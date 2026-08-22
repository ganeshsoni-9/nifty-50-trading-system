class MockProvider {
  constructor() {
    this.name = 'MockProvider';
    this.currentLtp = 24850.40;
    this.previousClose = 24780.00;
    this.open = 24795.00;
    this.high = 24890.50;
    this.low = 24760.20;
    this.volume = 14250000;
    this.week52High = 25078.90;
    this.week52Low = 19250.40;
    this.timeframeData = {};
    this.initHistory();
  }

  isConfigured() {
    return true; // Always available as fallback
  }

  initHistory() {
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];
    const count = 150;
    const now = Math.floor(Date.now() / 1000);

    timeframes.forEach(tf => {
      let stepSeconds = 900; // 15m default
      if (tf === '1m') stepSeconds = 60;
      if (tf === '5m') stepSeconds = 300;
      if (tf === '15m') stepSeconds = 900;
      if (tf === '30m') stepSeconds = 1800;
      if (tf === '1h') stepSeconds = 3600;
      if (tf === '1d') stepSeconds = 86400;

      let candles = [];
      let basePrice = 24600;

      for (let i = count; i >= 0; i--) {
        const time = now - (i * stepSeconds);
        const change = (Math.random() - 0.48) * 25;
        const open = basePrice;
        const close = Math.round((open + change) * 100) / 100;
        const high = Math.round((Math.max(open, close) + Math.random() * 12) * 100) / 100;
        const low = Math.round((Math.min(open, close) - Math.random() * 12) * 100) / 100;
        const vol = Math.floor(100000 + Math.random() * 300000);

        candles.push({
          time,
          open,
          high,
          low,
          close,
          volume: vol
        });

        basePrice = close;
      }

      this.timeframeData[tf] = candles;
      this.currentLtp = candles[candles.length - 1].close;
    });
  }

  generateTick() {
    // Realistic micro-tick random walk per second (Fix 1)
    const delta = (Math.random() - 0.49) * 1.5;
    this.currentLtp = Math.round((this.currentLtp + delta) * 100) / 100;

    if (this.currentLtp > this.high) this.high = this.currentLtp;
    if (this.currentLtp < this.low) this.low = this.currentLtp;
    this.volume += Math.floor(Math.random() * 150);

    const change = Math.round((this.currentLtp - this.previousClose) * 100) / 100;
    const changePercent = Math.round((change / this.previousClose) * 10000) / 100;

    return {
      symbol: 'NIFTY 50',
      ltp: this.currentLtp,
      open: this.open,
      high: this.high,
      low: this.low,
      close: this.currentLtp,
      previousClose: this.previousClose,
      change,
      changePercent,
      volume: this.volume,
      vwap: Math.round((this.high + this.low + this.currentLtp) / 3 * 100) / 100,
      dayHigh: this.high,
      dayLow: this.low,
      week52High: this.week52High,
      week52Low: this.week52Low,
      marketStatus: this.isMarketOpen() ? 'OPEN' : 'OPEN (DEMO)',
      timestamp: new Date()
    };
  }

  isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) return false;
    const timeInMin = now.getHours() * 60 + now.getMinutes();
    return timeInMin >= 555 && timeInMin <= 930;
  }

  async getQuote() {
    return this.generateTick();
  }

  async getHistoricalData(symbol = 'NIFTY 50', timeframe = '15m') {
    if (!this.timeframeData[timeframe]) {
      this.initHistory();
    }
    const list = [...(this.timeframeData[timeframe] || [])];
    if (list.length > 0) {
      const last = { ...list[list.length - 1] };
      last.close = this.currentLtp;
      last.high = Math.max(last.high, this.currentLtp);
      last.low = Math.min(last.low, this.currentLtp);
      list[list.length - 1] = last;
    }
    return list;
  }

  getOptionChain() {
    const atmStrike = Math.round(this.currentLtp / 50) * 50;
    const strikes = [];
    let totalCallOI = 0;
    let totalPutOI = 0;

    for (let i = -5; i <= 5; i++) {
      const strike = atmStrike + (i * 50);
      const isATM = strike === atmStrike;
      const isITMCall = strike < this.currentLtp;
      const isITMPut = strike > this.currentLtp;

      const callMoneyness = strike < atmStrike ? 'ITM' : isATM ? 'ATM' : 'OTM';
      const putMoneyness = strike > atmStrike ? 'ITM' : isATM ? 'ATM' : 'OTM';

      const callLtp = Math.max(5, Math.round((isITMCall ? (this.currentLtp - strike) + 80 : 120 - Math.abs(strike - this.currentLtp) * 0.8) * 10) / 10);
      const putLtp = Math.max(5, Math.round((isITMPut ? (strike - this.currentLtp) + 80 : 120 - Math.abs(strike - this.currentLtp) * 0.8) * 10) / 10);

      const callOI = Math.floor(45000 + Math.random() * 60000 + (isATM ? 40000 : 0));
      const putOI = Math.floor(50000 + Math.random() * 70000 + (isATM ? 45000 : 0));

      totalCallOI += callOI;
      totalPutOI += putOI;

      strikes.push({
        strikePrice: strike,
        isATM,
        callMoneyness,
        putMoneyness,
        call: {
          ltp: callLtp,
          change: Math.round((Math.random() - 0.4) * 15 * 10) / 10,
          openInterest: callOI,
          changeInOI: Math.floor((Math.random() - 0.3) * 8000),
          volume: Math.floor(callOI * 1.5),
          iv: Math.round((13 + Math.random() * 4) * 10) / 10
        },
        put: {
          ltp: putLtp,
          change: Math.round((Math.random() - 0.4) * 15 * 10) / 10,
          openInterest: putOI,
          changeInOI: Math.floor((Math.random() - 0.3) * 8000),
          volume: Math.floor(putOI * 1.5),
          iv: Math.round((13 + Math.random() * 4) * 10) / 10
        }
      });
    }

    const pcr = Math.round((totalPutOI / (totalCallOI || 1)) * 100) / 100;
    const maxPain = atmStrike;

    let interpretation = 'Neutral';
    if (pcr > 1.2) interpretation = 'Bullish (High Put Writing Support)';
    else if (pcr < 0.8) interpretation = 'Bearish (High Call Writing Resistance)';

    return {
      symbol: 'NIFTY',
      underlyingValue: this.currentLtp,
      atmStrike,
      totalCallOI,
      totalPutOI,
      pcr,
      maxPain,
      interpretation,
      strikes
    };
  }
}

module.exports = MockProvider;
