const marketDataService = require('../services/marketData/marketDataService');

// GET /api/market/nifty
exports.getNiftyQuote = async (req, res, next) => {
  try {
    const quote = await marketDataService.getQuote('NIFTY 50');
    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

// GET /api/market/nifty/history
exports.getNiftyHistory = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || '15m';
    const candles = await marketDataService.getHistoricalData('NIFTY 50', timeframe);
    res.json({ success: true, timeframe, count: candles.length, data: candles });
  } catch (error) {
    next(error);
  }
};

// GET /api/market/status
exports.getMarketStatus = async (req, res, next) => {
  try {
    const status = marketDataService.getProviderStatus();
    res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
};

// GET /api/market/options
exports.getOptionChain = async (req, res, next) => {
  try {
    const chain = await marketDataService.getOptionChain();
    res.json({ success: true, data: chain });
  } catch (error) {
    next(error);
  }
};
