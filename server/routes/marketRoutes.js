const express = require('express');
const router = express.Router();
const { getNiftyQuote, getNiftyHistory, getMarketStatus, getOptionChain } = require('../controllers/marketController');

router.get('/nifty', getNiftyQuote);
router.get('/nifty/history', getNiftyHistory);
router.get('/status', getMarketStatus);
router.get('/options', getOptionChain);

module.exports = router;
