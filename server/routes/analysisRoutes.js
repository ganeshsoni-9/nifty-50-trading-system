const express = require('express');
const router = express.Router();
const { getNiftyAnalysis, getSignals } = require('../controllers/analysisController');

router.get('/nifty', getNiftyAnalysis);
router.get('/signals', getSignals);

module.exports = router;
