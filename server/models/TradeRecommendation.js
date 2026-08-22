const mongoose = require('mongoose');

const tradeRecommendationSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  biasType: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['LONG', 'SHORT'],
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  suggestedStrike: {
    type: Number,
    required: true
  },
  optionType: {
    type: String,
    enum: ['CE', 'PE'],
    required: true
  },
  entryIndexPrice: {
    type: Number,
    required: true
  },
  entryOptionPrice: {
    type: Number,
    required: true
  },
  slIndexPrice: {
    type: Number,
    required: true
  },
  targetIndexPrice: {
    type: Number,
    required: true
  },
  slOptionPrice: {
    type: Number,
    required: true
  },
  targetOptionPrice: {
    type: Number,
    required: true
  },
  outcome: {
    type: String,
    enum: ['PENDING', 'CORRECT', 'INCORRECT', 'NEUTRAL'],
    default: 'PENDING'
  },
  evaluatedAt: {
    type: Date
  }
});

module.exports = mongoose.model('TradeRecommendation', tradeRecommendationSchema);
