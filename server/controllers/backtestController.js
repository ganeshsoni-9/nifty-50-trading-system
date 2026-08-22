const BacktestEngine = require('../services/backtest/backtestEngine');
const BacktestResult = require('../models/BacktestResult');

let memoryBacktests = [];

// POST /api/backtest
exports.runBacktest = async (req, res, next) => {
  try {
    const options = {
      timeframe: req.body.timeframe || '15m',
      dateFrom: req.body.dateFrom || '2026-01-01',
      dateTo: req.body.dateTo || '2026-08-22',
      capital: parseFloat(req.body.capital || 100000),
      riskPerTradePercent: parseFloat(req.body.riskPerTradePercent || 1.0)
    };

    const result = await BacktestEngine.runBacktest(options);

    let savedResult;
    try {
      savedResult = await BacktestResult.create({
        userId: req.user ? req.user.id : null,
        ...result
      });
    } catch (err) {
      savedResult = { _id: `bt_${Date.now()}`, ...result, createdAt: new Date() };
      memoryBacktests.unshift(savedResult);
    }

    res.json({ success: true, data: savedResult });
  } catch (error) {
    next(error);
  }
};

// GET /api/backtest/:id
exports.getBacktestById = async (req, res, next) => {
  try {
    let result;
    try {
      result = await BacktestResult.findById(req.params.id);
    } catch (err) {
      result = memoryBacktests.find(b => b._id.toString() === req.params.id);
    }

    if (!result) {
      return res.status(404).json({ success: false, message: 'Backtest result not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
