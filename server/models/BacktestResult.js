const mongoose = require('mongoose');

const backtestResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  strategyName: {
    type: String,
    default: 'NiftyPulse Multi-TF EMA + VWAP Strategy'
  },
  timeframe: {
    type: String,
    default: '15m'
  },
  dateFrom: String,
  dateTo: String,
  initialCapital: Number,
  riskPerTradePercent: Number,
  totalTrades: Number,
  winningTrades: Number,
  losingTrades: Number,
  winRate: Number,
  profitFactor: Number,
  maxDrawdownPercent: Number,
  avgRiskReward: Number,
  netPoints: Number,
  equityCurve: [
    {
      tradeIndex: Number,
      equity: Number,
      pnl: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BacktestResult', backtestResultSchema);
