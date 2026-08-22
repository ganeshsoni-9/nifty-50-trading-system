class UpstoxProvider {
  constructor() {
    this.name = 'UpstoxProvider';
  }

  isConfigured() {
    return false; // Stubbed for future expansion
  }

  async getQuote() {
    throw new Error('Upstox provider not implemented yet.');
  }

  async getHistoricalData() {
    throw new Error('Upstox provider not implemented yet.');
  }
}

module.exports = UpstoxProvider;
