const TechnicalIndicators = require('../indicators/technicalIndicators');

class SupportResistance {
  static analyze(candles, ltp) {
    if (!candles || candles.length < 10) {
      return {
        pdh: ltp * 1.01,
        pdl: ltp * 0.99,
        pdc: ltp,
        pivots: {},
        fibLevels: {},
        strongSupports: [],
        strongResistances: []
      };
    }

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);

    const dayHigh = Math.max(...highs.slice(-30));
    const dayLow = Math.min(...lows.slice(-30));
    const pdh = Math.max(...highs.slice(-90, -30));
    const pdl = Math.min(...lows.slice(-90, -30));
    const pdc = closes[closes.length - 30] || closes[0];

    const pivots = TechnicalIndicators.calculatePivotPoints(pdh, pdl, pdc);

    // Fibonacci calculations based on day's range
    const range = dayHigh - dayLow;
    const fib = {
      fib0: Math.round(dayLow * 100) / 100,
      fib236: Math.round((dayLow + range * 0.236) * 100) / 100,
      fib382: Math.round((dayLow + range * 0.382) * 100) / 100,
      fib500: Math.round((dayLow + range * 0.500) * 100) / 100,
      fib618: Math.round((dayLow + range * 0.618) * 100) / 100,
      fib786: Math.round((dayLow + range * 0.786) * 100) / 100,
      fib100: Math.round(dayHigh * 100) / 100
    };

    // Aggregate key levels
    const rawResistances = [dayHigh, pdh, pivots.r1, pivots.r2, pivots.r3, fib.fib618, fib.fib786]
      .filter(p => p > ltp)
      .sort((a, b) => a - b);

    const rawSupports = [dayLow, pdl, pivots.s1, pivots.s2, pivots.s3, fib.fib382, fib.fib236]
      .filter(p => p < ltp)
      .sort((a, b) => b - a);

    const strongResistances = Array.from(new Set(rawResistances.map(p => Math.round(p)))).slice(0, 3);
    const strongSupports = Array.from(new Set(rawSupports.map(p => Math.round(p)))).slice(0, 3);

    return {
      pdh: Math.round(pdh * 100) / 100,
      pdl: Math.round(pdl * 100) / 100,
      pdc: Math.round(pdc * 100) / 100,
      dayHigh: Math.round(dayHigh * 100) / 100,
      dayLow: Math.round(dayLow * 100) / 100,
      pivots,
      fibLevels: fib,
      strongSupports,
      strongResistances
    };
  }
}

module.exports = SupportResistance;
