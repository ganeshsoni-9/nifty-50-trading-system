const AngelOneProvider = require('./angelOneProvider');
const UpstoxProvider = require('./upstoxProvider');
const MockProvider = require('./mockProvider');
const { isMarketOpen, getMarketCalendarInfo } = require('../../utils/marketCalendar');
const logger = require('../../utils/logger');

class MarketDataService {
  constructor() {
    this.angelOne = new AngelOneProvider();
    this.upstox = new UpstoxProvider();
    this.mock = new MockProvider();
    this.activeProviderName = 'MockProvider';
    this.mode = 'DEMO'; // 'LIVE' or 'DEMO'
    this.initProvider();
  }

  async initProvider() {
    const marketOpen = isMarketOpen();

    if (this.angelOne.isConfigured()) {
      try {
        await this.angelOne.authenticate();
        this.activeProviderName = 'AngelOneProvider';
        if (marketOpen) {
          this.mode = 'LIVE';
          logger.info('[MarketDataService] Using Official Angel One SmartAPI live data provider (Market OPEN).');
        } else {
          this.mode = 'DEMO';
          logger.info('[MarketDataService] Market is currently CLOSED (Weekend/Holiday/Off-hours). Operating in DEMO mode.');
        }
      } catch (err) {
        logger.warn(`[MarketDataService Warning] Angel One auth failed: ${err.message}. Falling back to Mock DEMO Provider.`);
        this.activeProviderName = 'MockProvider';
        this.mode = 'DEMO';
      }
    } else {
      logger.info('[MarketDataService] Angel One credentials not present. Running in DEMO Mode with Mock Data.');
      this.activeProviderName = 'MockProvider';
      this.mode = 'DEMO';
    }
  }

  getActiveProvider() {
    if (this.activeProviderName === 'AngelOneProvider') return this.angelOne;
    if (this.activeProviderName === 'UpstoxProvider') return this.upstox;
    return this.mock;
  }

  async getQuote(symbol = 'NIFTY 50') {
    const calendarInfo = getMarketCalendarInfo();
    const marketOpen = calendarInfo.isOpen;

    try {
      let quote;

      // If market is closed, we serve quote with DEMO mode & CLOSED market status
      if (!marketOpen) {
        quote = await this.mock.getQuote();
        quote.mode = 'DEMO';
        quote.provider = this.activeProviderName;
        quote.marketStatus = 'CLOSED';
        quote.marketClosedReason = calendarInfo.reason;
        return quote;
      }

      // If market is open, attempt active provider quote
      const provider = this.getActiveProvider();
      quote = await provider.getQuote(symbol);
      quote.mode = this.mode;
      quote.provider = this.activeProviderName;
      quote.marketStatus = 'OPEN';
      quote.marketClosedReason = null;
      return quote;
    } catch (err) {
      logger.error(`[MarketDataService Quote Error] ${err.message}`);
      // Fallback to mock on any runtime provider error
      const mockQuote = await this.mock.getQuote();
      mockQuote.mode = 'DEMO';
      mockQuote.provider = 'MockProvider';
      mockQuote.marketStatus = marketOpen ? 'OPEN (DEMO)' : 'CLOSED';
      mockQuote.marketClosedReason = calendarInfo.reason;
      return mockQuote;
    }
  }

  async getHistoricalData(symbol = 'NIFTY 50', timeframe = '15m') {
    try {
      const provider = this.getActiveProvider();
      return await provider.getHistoricalData(symbol, timeframe);
    } catch (err) {
      logger.error(`[MarketDataService History Error] ${err.message}`);
      return await this.mock.getHistoricalData(symbol, timeframe);
    }
  }

  /**
   * Route Option Chain to Angel One when LIVE, fallback to Mock when DEMO or on error
   */
  async getOptionChain() {
    if (this.activeProviderName === 'AngelOneProvider' && this.mode === 'LIVE') {
      try {
        return await this.angelOne.getOptionChain('NIFTY');
      } catch (err) {
        logger.warn(`[MarketDataService OptionChain Warning] ${err.message} - Falling back to mock option chain.`);
      }
    }
    return this.mock.getOptionChain();
  }

  getProviderStatus() {
    const calendarInfo = getMarketCalendarInfo();
    return {
      activeProvider: this.activeProviderName,
      mode: calendarInfo.isOpen ? this.mode : 'DEMO',
      marketStatus: calendarInfo.status,
      marketClosedReason: calendarInfo.reason,
      isMarketOpen: calendarInfo.isOpen,
      isAngelConfigured: this.angelOne.isConfigured(),
      isUpstoxConfigured: this.upstox.isConfigured(),
      timestamp: new Date()
    };
  }
}

// Export singleton instance
module.exports = new MarketDataService();
