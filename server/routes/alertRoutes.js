const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, markAsRead } = require('../controllers/alertController');

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id/read', markAsRead);

module.exports = router;
