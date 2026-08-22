const TradePlan = require('../models/TradePlan');
const AnalysisEngine = require('../services/analysis/analysisEngine');

// In-memory trade plan store fallback
let memoryTradePlans = [];

// POST /api/tradeplans
exports.createTradePlan = async (req, res, next) => {
  try {
    const analysis = await AnalysisEngine.runFullAnalysis(req.body.timeframe || '15m');
    const setup = analysis.tradeSetup;

    const planData = {
      userId: req.user ? req.user.id : null,
      symbol: 'NIFTY 50',
      timeframe: analysis.timeframe,
      direction: setup.direction,
      marketBias: setup.marketBias,
      bullishScore: setup.bullishScore,
      bearishScore: setup.bearishScore,
      entryMin: setup.tradeLevels ? setup.tradeLevels.entryMin : analysis.ltp,
      entryMax: setup.tradeLevels ? setup.tradeLevels.entryMax : analysis.ltp,
      stopLoss: setup.tradeLevels ? setup.tradeLevels.stopLoss : analysis.ltp,
      target1: setup.tradeLevels ? setup.tradeLevels.target1 : analysis.ltp,
      target2: setup.tradeLevels ? setup.tradeLevels.target2 : analysis.ltp,
      target3: setup.tradeLevels ? setup.tradeLevels.target3 : analysis.ltp,
      riskReward: setup.tradeLevels ? setup.tradeLevels.riskReward : 'N/A',
      confidence: setup.confidence,
      reasons: setup.reasons,
      invalidationRules: setup.invalidationRules,
      marketRegime: setup.marketRegime,
      suggestedQuantity: setup.tradeLevels ? setup.tradeLevels.lotSize : 50,
      status: 'PENDING'
    };

    let savedPlan;
    try {
      savedPlan = await TradePlan.create(planData);
    } catch (err) {
      savedPlan = { _id: `plan_${Date.now()}`, ...planData, createdAt: new Date() };
      memoryTradePlans.unshift(savedPlan);
    }

    res.status(201).json({ success: true, data: savedPlan });
  } catch (error) {
    next(error);
  }
};

// GET /api/tradeplans
exports.getTradePlans = async (req, res, next) => {
  try {
    let plans;
    try {
      plans = await TradePlan.find().sort({ createdAt: -1 }).limit(20);
    } catch (err) {
      plans = memoryTradePlans;
    }
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

// GET /api/tradeplans/:id
exports.getTradePlanById = async (req, res, next) => {
  try {
    let plan;
    try {
      plan = await TradePlan.findById(req.params.id);
    } catch (err) {
      plan = memoryTradePlans.find(p => p._id.toString() === req.params.id);
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Trade plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};
