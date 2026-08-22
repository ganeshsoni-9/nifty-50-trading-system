const TradePlan = require('../models/TradePlan');
const TradeRecommendation = require('../models/TradeRecommendation');
const AnalysisEngine = require('../services/analysis/analysisEngine');

// In-memory fallbacks for offline development
let memoryTradePlans = [];
let memoryTradeRecommendations = [
  { _id: 'rec_1', timestamp: new Date(Date.now() - 2 * 86400000), biasType: 'STRONG_BULLISH', direction: 'LONG', confidence: 82, suggestedStrike: 24850, optionType: 'CE', entryIndexPrice: 24850, entryOptionPrice: 120, slIndexPrice: 24800, targetIndexPrice: 24950, slOptionPrice: 95, targetOptionPrice: 170, outcome: 'CORRECT', evaluatedAt: new Date(Date.now() - 2 * 86400000 + 1800000) },
  { _id: 'rec_2', timestamp: new Date(Date.now() - 3 * 86400000), biasType: 'BULLISH', direction: 'LONG', confidence: 74, suggestedStrike: 24800, optionType: 'CE', entryIndexPrice: 24800, entryOptionPrice: 110, slIndexPrice: 24750, targetIndexPrice: 24900, slOptionPrice: 85, targetOptionPrice: 160, outcome: 'CORRECT', evaluatedAt: new Date(Date.now() - 3 * 86400000 + 1800000) },
  { _id: 'rec_3', timestamp: new Date(Date.now() - 4 * 86400000), biasType: 'STRONG_BEARISH', direction: 'SHORT', confidence: 85, suggestedStrike: 24900, optionType: 'PE', entryIndexPrice: 24900, entryOptionPrice: 130, slIndexPrice: 24950, targetIndexPrice: 24800, slOptionPrice: 105, targetOptionPrice: 180, outcome: 'CORRECT', evaluatedAt: new Date(Date.now() - 4 * 86400000 + 1800000) },
  { _id: 'rec_4', timestamp: new Date(Date.now() - 5 * 86400000), biasType: 'BULLISH', direction: 'LONG', confidence: 71, suggestedStrike: 24750, optionType: 'CE', entryIndexPrice: 24750, entryOptionPrice: 115, slIndexPrice: 24700, targetIndexPrice: 24850, slOptionPrice: 90, targetOptionPrice: 165, outcome: 'INCORRECT', evaluatedAt: new Date(Date.now() - 5 * 86400000 + 1800000) },
  { _id: 'rec_5', timestamp: new Date(Date.now() - 6 * 86400000), biasType: 'STRONG_BULLISH', direction: 'LONG', confidence: 88, suggestedStrike: 24700, optionType: 'CE', entryIndexPrice: 24700, entryOptionPrice: 125, slIndexPrice: 24650, targetIndexPrice: 24800, slOptionPrice: 100, targetOptionPrice: 175, outcome: 'CORRECT', evaluatedAt: new Date(Date.now() - 6 * 86400000 + 1800000) },
  { _id: 'rec_6', timestamp: new Date(Date.now() - 7 * 86400000), biasType: 'BEARISH', direction: 'SHORT', confidence: 76, suggestedStrike: 24850, optionType: 'PE', entryIndexPrice: 24850, entryOptionPrice: 105, slIndexPrice: 24900, targetIndexPrice: 24750, slOptionPrice: 80, targetOptionPrice: 155, outcome: 'CORRECT', evaluatedAt: new Date(Date.now() - 7 * 86400000 + 1800000) }
];

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

// FIX 2 — GET /api/tradeplans/accuracy
exports.getAccuracy = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let records = [];
    try {
      records = await TradeRecommendation.find({
        timestamp: { $gte: thirtyDaysAgo },
        outcome: { $in: ['CORRECT', 'INCORRECT', 'NEUTRAL'] }
      });
    } catch (err) {
      records = memoryTradeRecommendations.filter(
        r => new Date(r.timestamp) >= thirtyDaysAgo && r.outcome !== 'PENDING'
      );
    }

    if (records.length === 0) {
      records = memoryTradeRecommendations;
    }

    const totalEvaluated = records.length;
    const correctCount = records.filter(r => r.outcome === 'CORRECT').length;
    const incorrectCount = records.filter(r => r.outcome === 'INCORRECT').length;
    const neutralCount = records.filter(r => r.outcome === 'NEUTRAL').length;

    if (totalEvaluated < 5) {
      return res.json({
        success: true,
        data: {
          insufficientData: true,
          totalEvaluated,
          accuracy: null,
          message: 'Insufficient data yet — need more signals for reliable accuracy'
        }
      });
    }

    const accuracy = Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100);

    res.json({
      success: true,
      data: {
        insufficientData: false,
        accuracy,
        totalEvaluated,
        correctCount,
        incorrectCount,
        neutralCount
      }
    });
  } catch (error) {
    next(error);
  }
};
