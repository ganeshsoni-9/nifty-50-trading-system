const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: [
      'ENTRY_ALERT',
      'EXIT_ALERT',
      'SL_ALERT',
      'TARGET_ALERT',
      'BREAKOUT_ALERT',
      'BREAKDOWN_ALERT',
      'VWAP_CROSS_ALERT',
      'EMA_CROSS_ALERT'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'DANGER'],
    default: 'INFO'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);
