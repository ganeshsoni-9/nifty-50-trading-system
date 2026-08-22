const AnalysisEngine = require('../services/analysis/analysisEngine');

// GET /api/analysis/nifty
exports.getNiftyAnalysis = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || '15m';
    const analysis = await AnalysisEngine.runFullAnalysis(timeframe);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// GET /api/analysis/signals
exports.getSignals = async (req, res, next) => {
  try {
    const analysis = await AnalysisEngine.runFullAnalysis('15m');
    res.json({
      success: true,
      data: {
        symbol: 'NIFTY 50',
        direction: analysis.tradeSetup.direction,
        marketBias: analysis.tradeSetup.marketBias,
        confidence: analysis.tradeSetup.confidence,
        setup: analysis.tradeSetup
      }
    });
  } catch (error) {
    next(error);
  }
};
