const mongoose = require('mongoose');

const paperTradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  tradePlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TradePlan',
    required: false
  },
  symbol: {
    type: String,
    default: 'NIFTY 50'
  },
  direction: {
    type: String,
    enum: ['LONG', 'SHORT'],
    required: true
  },
  entryPrice: {
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
  quantity: {
    type: Number,
    default: 50
  },
  exitPrice: {
    type: Number,
    default: null
  },
  pnlPoints: {
    type: Number,
    default: 0
  },
  pnlRupees: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['OPEN', 'TARGET_1_HIT', 'TARGET_2_HIT', 'TARGET_3_HIT', 'STOPPED_OUT', 'CLOSED_MANUALLY'],
    default: 'OPEN'
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  }
});

module.exports = mongoose.model('PaperTrade', paperTradeSchema);
