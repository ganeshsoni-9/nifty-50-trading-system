const PaperTrade = require('../models/PaperTrade');
const marketDataService = require('../services/marketData/marketDataService');

let memoryPaperTrades = [
  { _id: 'p_1', symbol: 'NIFTY 50', direction: 'LONG', setupType: 'STRONG BULLISH', confidence: 84, strike: 'NIFTY 24850 CE', entryPrice: 120, exitPrice: 165, pnlRupees: 2250, status: 'CLOSED_TARGET', openedAt: new Date(Date.now() - 5 * 86400000), closedAt: new Date(Date.now() - 5 * 86400000 + 3600000) },
  { _id: 'p_2', symbol: 'NIFTY 50', direction: 'LONG', setupType: 'BULLISH', confidence: 75, strike: 'NIFTY 24800 CE', entryPrice: 110, exitPrice: 145, pnlRupees: 1750, status: 'CLOSED_TARGET', openedAt: new Date(Date.now() - 4 * 86400000), closedAt: new Date(Date.now() - 4 * 86400000 + 3600000) },
  { _id: 'p_3', symbol: 'NIFTY 50', direction: 'SHORT', setupType: 'STRONG BEARISH', confidence: 88, strike: 'NIFTY 24900 PE', entryPrice: 130, exitPrice: 175, pnlRupees: 2250, status: 'CLOSED_TARGET', openedAt: new Date(Date.now() - 3 * 86400000), closedAt: new Date(Date.now() - 3 * 86400000 + 3600000) },
  { _id: 'p_4', symbol: 'NIFTY 50', direction: 'LONG', setupType: 'BULLISH', confidence: 72, strike: 'NIFTY 24750 CE', entryPrice: 115, exitPrice: 90, pnlRupees: -1250, status: 'CLOSED_SL', openedAt: new Date(Date.now() - 2 * 86400000), closedAt: new Date(Date.now() - 2 * 86400000 + 1800000) },
  { _id: 'p_5', symbol: 'NIFTY 50', direction: 'LONG', setupType: 'STRONG BULLISH', confidence: 85, strike: 'NIFTY 24700 CE', entryPrice: 125, exitPrice: 170, pnlRupees: 2250, status: 'CLOSED_TARGET', openedAt: new Date(Date.now() - 1 * 86400000), closedAt: new Date(Date.now() - 1 * 86400000 + 3600000) }
];

// POST /api/papertrades
exports.createPaperTrade = async (req, res, next) => {
  try {
    const { direction, entryPrice, stopLoss, target1, target2, target3, quantity, strike, optionType, moneyness } = req.body;

    const tradeData = {
      userId: req.user ? req.user.id : null,
      symbol: 'NIFTY 50',
      direction: direction || 'LONG',
      strike: strike || `NIFTY ${entryPrice || 24850} ${direction === 'LONG' ? 'CE' : 'PE'}`,
      optionType: optionType || (direction === 'LONG' ? 'CALL' : 'PUT'),
      moneyness: moneyness || 'ATM',
      entryPrice: parseFloat(entryPrice || 120),
      stopLoss: parseFloat(stopLoss || entryPrice - 15),
      target1: parseFloat(target1 || entryPrice + 30),
      target2: parseFloat(target2 || entryPrice + 60),
      target3: parseFloat(target3 || entryPrice + 90),
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

    if (trades.length === 0) trades = memoryPaperTrades;

    const closed = trades.filter(t => t.status !== 'OPEN');
    const winners = closed.filter(t => (t.pnlRupees || 0) > 0);
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

// GET /api/papertrades/performance
exports.getPerformanceStats = async (req, res, next) => {
  try {
    let trades;
    try {
      trades = await PaperTrade.find().sort({ openedAt: 1 });
    } catch (err) {
      trades = memoryPaperTrades;
    }

    if (trades.length === 0) trades = memoryPaperTrades;

    const closed = trades.filter(t => t.status !== 'OPEN');
    const winners = closed.filter(t => (t.pnlRupees || 0) > 0);
    const losers = closed.filter(t => (t.pnlRupees || 0) < 0);

    const totalWinRupees = winners.reduce((acc, t) => acc + t.pnlRupees, 0);
    const totalLossRupees = Math.abs(losers.reduce((acc, t) => acc + t.pnlRupees, 0));

    const winRate = closed.length > 0 ? Math.round((winners.length / closed.length) * 100) : 0;
    const avgProfit = winners.length > 0 ? Math.round(totalWinRupees / winners.length) : 0;
    const avgLoss = losers.length > 0 ? Math.round(totalLossRupees / losers.length) : 0;
    const profitFactor = totalLossRupees > 0 ? Math.round((totalWinRupees / totalLossRupees) * 100) / 100 : totalWinRupees > 0 ? 9.99 : 0;

    // Calculate Cumulative Equity Curve & Max Drawdown
    let cumulative = 0;
    let peak = 0;
    let maxDrawdownRs = 0;
    const equityCurve = [];

    closed.forEach((t) => {
      cumulative += t.pnlRupees || 0;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdownRs) maxDrawdownRs = drawdown;

      equityCurve.push({
        date: new Date(t.closedAt || t.openedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        pnl: Math.round(cumulative)
      });
    });

    const maxDrawdownPercent = peak > 0 ? Math.round((maxDrawdownRs / peak) * 100) : 0;

    // Confidence Band Breakdown (70-80%, 80-90%, 90-100%)
    const band70 = closed.filter(t => (t.confidence || 75) >= 70 && (t.confidence || 75) < 80);
    const band80 = closed.filter(t => (t.confidence || 85) >= 80 && (t.confidence || 85) < 90);
    const band90 = closed.filter(t => (t.confidence || 92) >= 90);

    const calcBandWin = (list) => {
      const w = list.filter(t => (t.pnlRupees || 0) > 0).length;
      return {
        total: list.length,
        winRate: list.length > 0 ? Math.round((w / list.length) * 100) : 0
      };
    };

    res.json({
      success: true,
      summary: {
        totalTrades: closed.length,
        winRate,
        avgProfit,
        avgLoss,
        profitFactor,
        maxDrawdownRs: Math.round(maxDrawdownRs),
        maxDrawdownPercent,
        totalPnlRupees: Math.round(cumulative)
      },
      equityCurve,
      confidenceBands: [
        { band: '70% - 80% Confidence', ...calcBandWin(band70) },
        { band: '80% - 90% Confidence', ...calcBandWin(band80) },
        { band: '90% - 100% Confidence', ...calcBandWin(band90) }
      ],
      tradeLog: closed.map(t => ({
        _id: t._id,
        date: new Date(t.openedAt).toLocaleDateString(),
        symbol: t.symbol || 'NIFTY 50',
        direction: t.direction,
        setupType: t.setupType || (t.direction === 'LONG' ? 'BULLISH' : 'BEARISH'),
        confidence: t.confidence || 75,
        strike: t.strike || `NIFTY ${t.entryPrice} ${t.direction === 'LONG' ? 'CE' : 'PE'}`,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        pnlRupees: t.pnlRupees,
        result: t.pnlRupees > 0 ? 'WIN' : t.pnlRupees < 0 ? 'LOSS' : 'BREAKEVEN'
      }))
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/papertrades/:id/close
exports.closePaperTrade = async (req, res, next) => {
  try {
    const { customExitPrice } = req.body || {};
    const quote = await marketDataService.getQuote('NIFTY 50');
    const exitPrice = customExitPrice ? parseFloat(customExitPrice) : quote.ltp;

    let trade;
    try {
      trade = await PaperTrade.findById(req.params.id);
    } catch (err) {
      trade = memoryPaperTrades.find(t => t._id.toString() === req.params.id);
    }

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Paper trade not found' });
    }

    // PnL tracking option premium buy logic (both CE and PE gain when premium increases)
    let pnlPoints = exitPrice - trade.entryPrice;
    if (!trade.strike && trade.direction === 'SHORT') {
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
