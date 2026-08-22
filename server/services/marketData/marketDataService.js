const AngelOneProvider = require('./angelOneProvider');
const UpstoxProvider = require('./upstoxProvider');
const MockProvider = require('./mockProvider');

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
    if (this.angelOne.isConfigured()) {
      try {
        await this.angelOne.authenticate();
        this.activeProviderName = 'AngelOneProvider';
        this.mode = 'LIVE';
        console.log('[MarketDataService] Using Official Angel One SmartAPI live data provider.');
      } catch (err) {
        console.warn('[MarketDataService Warning] Angel One auth failed. Falling back to Mock DEMO Provider.');
        this.activeProviderName = 'MockProvider';
        this.mode = 'DEMO';
      }
    } else {
      console.log('[MarketDataService] Angel One credentials not present. Running in DEMO Mode with Mock Data.');
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
    try {
      const provider = this.getActiveProvider();
      const quote = await provider.getQuote(symbol);
      quote.mode = this.mode;
      quote.provider = this.activeProviderName;
      return quote;
    } catch (err) {
      console.error('[MarketDataService Quote Error]', err.message);
      // Fallback to mock on any runtime provider error
      return this.mock.getQuote();
    }
  }

  async getHistoricalData(symbol = 'NIFTY 50', timeframe = '15m') {
    try {
      const provider = this.getActiveProvider();
      return await provider.getHistoricalData(symbol, timeframe);
    } catch (err) {
      console.error('[MarketDataService History Error]', err.message);
      return await this.mock.getHistoricalData(symbol, timeframe);
    }
  }

  getOptionChain() {
    // Always returns option chain from provider or mock
    return this.mock.getOptionChain();
  }

  getProviderStatus() {
    return {
      activeProvider: this.activeProviderName,
      mode: this.mode,
      isAngelConfigured: this.angelOne.isConfigured(),
      isUpstoxConfigured: this.upstox.isConfigured(),
      timestamp: new Date()
    };
  }
}

// Export singleton instance
module.exports = new MarketDataService();
