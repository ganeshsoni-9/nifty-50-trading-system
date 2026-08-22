const express = require('express');
const router = express.Router();
const { createTradePlan, getTradePlans, getTradePlanById } = require('../controllers/tradePlanController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createTradePlan);
router.get('/', getTradePlans);
router.get('/:id', getTradePlanById);

module.exports = router;
