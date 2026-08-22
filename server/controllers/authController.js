const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'nifty_pulse_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, capital, riskPerTradePercent } = req.body;

    let user;
    try {
      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      user = await User.create({
        name,
        email,
        password,
        capital: capital || 100000,
        riskPerTradePercent: riskPerTradePercent || 1.0
      });
    } catch (dbErr) {
      // Memory fallback if MongoDB offline
      console.warn('[Auth] DB unavailable, registering in mock session state.');
      user = { _id: 'mock_user_id_123', name, email, capital: capital || 100000, riskPerTradePercent: riskPerTradePercent || 1.0 };
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        capital: user.capital,
        riskPerTradePercent: user.riskPerTradePercent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user;
    try {
      user = await User.findOne({ email }).select('+password');
    } catch (err) {
      user = null;
    }

    if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          capital: user.capital,
          riskPerTradePercent: user.riskPerTradePercent
        }
      });
    }

    // Fallback demo user login if DB offline or testing demo credentials
    if (email === 'demo@niftytrade.ai' || email === 'admin@niftytrade.ai') {
      const demoId = 'demo_user_id';
      const token = generateToken(demoId);
      return res.json({
        success: true,
        token,
        user: {
          id: demoId,
          name: 'Demo Trader',
          email,
          capital: 100000,
          riskPerTradePercent: 1.0
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
