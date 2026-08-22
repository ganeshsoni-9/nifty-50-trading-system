const Alert = require('../models/Alert');

let memoryAlerts = [
  {
    _id: 'a1',
    type: 'ENTRY_ALERT',
    title: '🔔 NIFTY Entry Zone Reached',
    message: 'NIFTY LTP (24,850) entered 15M LONG buy zone (24,840 - 24,860)',
    level: 'SUCCESS',
    isRead: false,
    createdAt: new Date(Date.now() - 300000)
  },
  {
    _id: 'a2',
    type: 'VWAP_CROSS_ALERT',
    title: '📈 VWAP Reclaim Confirmed',
    message: 'NIFTY price crossed above VWAP (24,810) with 1.8x volume expansion',
    level: 'INFO',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000)
  }
];

// GET /api/alerts
exports.getAlerts = async (req, res, next) => {
  try {
    let alerts;
    try {
      alerts = await Alert.find().sort({ createdAt: -1 }).limit(30);
      if (alerts.length === 0) alerts = memoryAlerts;
    } catch (err) {
      alerts = memoryAlerts;
    }
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

// POST /api/alerts
exports.createAlert = async (req, res, next) => {
  try {
    const { type, title, message, level } = req.body;
    let alert;
    try {
      alert = await Alert.create({
        userId: req.user ? req.user.id : null,
        type: type || 'ENTRY_ALERT',
        title: title || 'Custom Market Alert',
        message: message || 'Price threshold notification triggered',
        level: level || 'INFO'
      });
    } catch (err) {
      alert = { _id: `a_${Date.now()}`, type, title, message, level: level || 'INFO', isRead: false, createdAt: new Date() };
      memoryAlerts.unshift(alert);
    }
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// PUT /api/alerts/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    try {
      await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
    } catch (err) {
      const a = memoryAlerts.find(item => item._id.toString() === req.params.id);
      if (a) a.isRead = true;
    }
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (error) {
    next(error);
  }
};
