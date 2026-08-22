const mongoose = require('mongoose');

const marketSnapshotSchema = new mongoose.Schema({
  symbol: { type: String, default: 'NIFTY 50' },
  ltp: Number,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  previousClose: Number,
  change: Number,
  changePercent: Number,
  volume: Number,
  vwap: Number,
  dayHigh: Number,
  dayLow: Number,
  week52High: Number,
  week52Low: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketSnapshot', marketSnapshotSchema);
