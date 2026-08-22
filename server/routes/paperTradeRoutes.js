const express = require('express');
const router = express.Router();
const { createPaperTrade, getPaperTrades, closePaperTrade, getPerformanceStats } = require('../controllers/paperTradeController');

router.post('/', createPaperTrade);
router.get('/', getPaperTrades);
router.get('/performance', getPerformanceStats);
router.put('/:id/close', closePaperTrade);

module.exports = router;
