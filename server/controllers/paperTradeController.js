const PaperTrade = require('../models/PaperTrade');
const marketDataService = require('../services/marketData/marketDataService');

let memoryPaperTrades = [];

// POST /api/papertrades
exports.createPaperTrade = async (req, res, next) => {
  try {
    const { direction, entryPrice, stopLoss, target1, target2, target3, quantity } = req.body;

    const tradeData = {
      userId: req.user ? req.user.id : null,
      symbol: 'NIFTY 50',
      direction: direction || 'LONG',
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      target1: parseFloat(target1),
      target2: parseFloat(target2),
      target3: parseFloat(target3),
      quantity: parseInt(quantity || 50),
      status: 'OPEN',
      openedAt: new Date()
    };

    let trade;
    try {
      trade = await PaperTrade.create(tradeData);
    } catch (err) {
      trade = { _id: `paper_${Date.now()}`, ...tradeData };
      memoryPaperTrades.unshift(trade);
    }

    res.status(201).json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};

// GET /api/papertrades
exports.getPaperTrades = async (req, res, next) => {
  try {
    let trades;
    try {
      trades = await PaperTrade.find().sort({ openedAt: -1 });
    } catch (err) {
      trades = memoryPaperTrades;
    }

    // Calculate performance stats
    const closed = trades.filter(t => t.status !== 'OPEN');
    const winners = closed.filter(t => t.pnlRupees > 0);
    const totalPnl = closed.reduce((acc, t) => acc + (t.pnlRupees || 0), 0);
    const winRate = closed.length > 0 ? Math.round((winners.length / closed.length) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalTrades: trades.length,
        activeTrades: trades.length - closed.length,
        winningTrades: winners.length,
        losingTrades: closed.length - winners.length,
        winRate,
        totalPnlRupees: Math.round(totalPnl)
      },
      data: trades
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/papertrades/:id/close
exports.closePaperTrade = async (req, res, next) => {
  try {
    const quote = await marketDataService.getQuote('NIFTY 50');
    const exitPrice = quote.ltp;

    let trade;
    try {
      trade = await PaperTrade.findById(req.params.id);
    } catch (err) {
      trade = memoryPaperTrades.find(t => t._id.toString() === req.params.id);
    }

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Paper trade not found' });
    }

    let pnlPoints = 0;
    if (trade.direction === 'LONG') {
      pnlPoints = exitPrice - trade.entryPrice;
    } else {
      pnlPoints = trade.entryPrice - exitPrice;
    }

    const pnlRupees = pnlPoints * trade.quantity;

    trade.exitPrice = Math.round(exitPrice * 100) / 100;
    trade.pnlPoints = Math.round(pnlPoints * 100) / 100;
    trade.pnlRupees = Math.round(pnlRupees);
    trade.status = 'CLOSED_MANUALLY';
    trade.closedAt = new Date();

    if (trade.save) {
      await trade.save();
    }

    res.json({ success: true, message: 'Paper trade closed successfully', data: trade });
  } catch (error) {
    next(error);
  }
};
