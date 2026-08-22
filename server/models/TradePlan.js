const mongoose = require('mongoose');

const tradePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  symbol: {
    type: String,
    default: 'NIFTY 50'
  },
  timeframe: {
    type: String,
    default: '15m'
  },
  direction: {
    type: String,
    enum: ['LONG', 'SHORT', 'NO_TRADE'],
    required: true
  },
  marketBias: {
    type: String,
    required: true
  },
  bullishScore: {
    type: Number,
    required: true
  },
  bearishScore: {
    type: Number,
    required: true
  },
  entryMin: {
    type: Number,
    required: true
  },
  entryMax: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    required: true
  },
  target1: {
    type: Number,
    required: true
  },
  target2: {
    type: Number,
    required: true
  },
  target3: {
    type: Number,
    required: true
  },
  riskReward: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  reasons: [String],
  invalidationRules: [String],
  marketRegime: {
    type: String,
    default: 'NORMAL'
  },
  suggestedQuantity: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'TARGET_1', 'TARGET_2', 'TARGET_3', 'STOPPED', 'EXITED', 'EXPIRED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TradePlan', tradePlanSchema);
