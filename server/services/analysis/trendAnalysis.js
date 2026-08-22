const TechnicalIndicators = require('../indicators/technicalIndicators');

class TrendAnalysis {
  static analyze(candles) {
    if (!candles || candles.length < 50) {
      return { trend: 'NEUTRAL', alignment: 'INSUFFICIENT_DATA', score: 0 };
    }

    const closes = candles.map(c => c.close);
    const ltp = closes[closes.length - 1];

    const ema9Array = TechnicalIndicators.calculateEMA(closes, 9);
    const ema20Array = TechnicalIndicators.calculateEMA(closes, 20);
    const ema50Array = TechnicalIndicators.calculateEMA(closes, 50);
    const ema200Array = TechnicalIndicators.calculateEMA(closes, Math.min(200, closes.length - 1));

    const ema9 = ema9Array[ema9Array.length - 1] || ltp;
    const ema20 = ema20Array[ema20Array.length - 1] || ltp;
    const ema50 = ema50Array[ema50Array.length - 1] || ltp;
    const ema200 = ema200Array[ema200Array.length - 1] || ltp;

    let score = 0;
    let trend = 'NEUTRAL';
    let alignment = 'MIXED';

    // Bullish scoring
    if (ltp > ema20) score += 15;
    if (ema20 > ema50) score += 25;
    if (ema50 > ema200) score += 25;
    if (ema9 > ema20) score += 15;

    // Alignment status
    if (ema20 > ema50 && ema50 > ema200) {
      alignment = 'PERFECT_BULLISH_STACK';
      trend = 'BULLISH';
    } else if (ema20 < ema50 && ema50 < ema200) {
      alignment = 'PERFECT_BEARISH_STACK';
      trend = 'BEARISH';
    } else if (ltp > ema50 && ema20 > ema50) {
      alignment = 'MODERATE_BULLISH';
      trend = 'BULLISH';
    } else if (ltp < ema50 && ema20 < ema50) {
      alignment = 'MODERATE_BEARISH';
      trend = 'BEARISH';
    } else {
      alignment = 'SIDEWAYS / CHOPPY';
      trend = 'NEUTRAL';
    }

    return {
      trend,
      alignment,
      score, // 0 to 80
      ema9: Math.round(ema9 * 100) / 100,
      ema20: Math.round(ema20 * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
      ema200: Math.round(ema200 * 100) / 100
    };
  }
}

module.exports = TrendAnalysis;
