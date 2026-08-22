const express = require('express');
const router = express.Router();
const { runBacktest, getBacktestById } = require('../controllers/backtestController');

router.post('/', runBacktest);
router.get('/:id', getBacktestById);

module.exports = router;
