const { EMA, RSI, MACD, Stochastic, ATR, BollingerBands } = require('technicalindicators');

class TechnicalIndicators {
  static calculateEMA(closes, period) {
    if (!closes || closes.length < period) return [];
    return EMA.calculate({ period, values: closes });
  }

  static calculateRSI(closes, period = 14) {
    if (!closes || closes.length <= period) return [];
    return RSI.calculate({ period, values: closes });
  }

  static calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (!closes || closes.length < slowPeriod) return [];
    return MACD.calculate({
      values: closes,
      fastPeriod,
      slowPeriod,
      signalPeriod,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
  }

  static calculateStochastic(candles, period = 14, signalPeriod = 3) {
    if (!candles || candles.length < period) return [];
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    return Stochastic.calculate({
      high: highs,
      low: lows,
      close: closes,
      period,
      signalPeriod
    });
  }

  static calculateATR(candles, period = 14) {
    if (!candles || candles.length <= period) return [];
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    return ATR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period
    });
  }

  static calculateBollingerBands(closes, period = 20, stdDev = 2) {
    if (!closes || closes.length < period) return [];
    return BollingerBands.calculate({
      period,
      stdDev,
      values: closes
    });
  }

  static calculateVWAP(candles) {
    if (!candles || candles.length === 0) return 0;
    let cumulativeTPV = 0; // Typical Price * Volume
    let cumulativeVol = 0;

    candles.forEach(c => {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      const vol = c.volume || 1;
      cumulativeTPV += typicalPrice * vol;
      cumulativeVol += vol;
    });

    return cumulativeVol > 0 ? Math.round((cumulativeTPV / cumulativeVol) * 100) / 100 : candles[candles.length - 1].close;
  }

  static calculatePivotPoints(high, low, close) {
    const pivot = (high + low + close) / 3;
    const r1 = (2 * pivot) - low;
    const s1 = (2 * pivot) - high;
    const r2 = pivot + (high - low);
    const s2 = pivot - (high - low);
    const r3 = high + 2 * (pivot - low);
    const s3 = low - 2 * (high - pivot);

    // CPR (Central Pivot Range)
    const bc = (high + low) / 2; // Bottom Central
    const tc = (pivot - bc) + pivot; // Top Central
    const cprWidth = Math.abs(tc - bc);

    let cprType = 'MODERATE';
    if (cprWidth < 15) cprType = 'NARROW (Trending Day Expected)';
    else if (cprWidth > 40) cprType = 'WIDE (Rangebound Day Expected)';

    return {
      pivot: Math.round(pivot * 100) / 100,
      bc: Math.round(bc * 100) / 100,
      tc: Math.round(tc * 100) / 100,
      cprWidth: Math.round(cprWidth * 100) / 100,
      cprType,
      r1: Math.round(r1 * 100) / 100,
      s1: Math.round(s1 * 100) / 100,
      r2: Math.round(r2 * 100) / 100,
      s2: Math.round(s2 * 100) / 100,
      r3: Math.round(r3 * 100) / 100,
      s3: Math.round(s3 * 100) / 100
    };
  }
}

module.exports = TechnicalIndicators;
