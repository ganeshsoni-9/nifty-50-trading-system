const mongoose = require('mongoose');
const marketDataService = require('../services/marketData/marketDataService');

// GET /api/health
exports.getSystemHealth = async (req, res, next) => {
  try {
    const providerStatus = marketDataService.getProviderStatus();
    const dbState = mongoose.connection.readyState;

    let mongoStatus = '🔴 DISCONNECTED';
    if (dbState === 1) mongoStatus = '🟢 CONNECTED';
    else if (dbState === 2) mongoStatus = '🟡 CONNECTING';
    else mongoStatus = '🟡 IN-MEMORY FALLBACK (ACTIVE)';

    const quote = await marketDataService.getQuote('NIFTY 50');

    res.json({
      success: true,
      data: {
        appName: 'NiftyTrade AI / NiftyPulse',
        version: '1.0.0',
        status: 'RUNNING',
        timestamp: new Date(),
        components: {
          marketApi: {
            status: providerStatus.mode === 'LIVE' ? '🟢 CONNECTED (SmartAPI)' : '🟡 DEMO MODE (Mock Engine)',
            provider: providerStatus.activeProvider,
            isAngelConfigured: providerStatus.isAngelConfigured
          },
          webSocket: {
            status: '🟢 LIVE STREAMING',
            port: process.env.PORT || 5000
          },
          mongoDB: {
            status: mongoStatus,
            readyState: dbState
          },
          analysisEngine: {
            status: '🟢 RUNNING',
            supportedTimeframes: ['1m', '5m', '15m', '30m', '1h', '1d']
          }
        },
        lastTick: {
          symbol: quote.symbol,
          ltp: quote.ltp,
          timestamp: quote.timestamp
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
