const express = require('express');
const router = express.Router();
const { createPaperTrade, getPaperTrades, closePaperTrade } = require('../controllers/paperTradeController');

router.post('/', createPaperTrade);
router.get('/', getPaperTrades);
router.put('/:id/close', closePaperTrade);

module.exports = router;
