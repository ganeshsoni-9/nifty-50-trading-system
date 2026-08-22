const TechnicalIndicators = require('../indicators/technicalIndicators');

class IndicatorAnalysis {
  static analyze(candles) {
    if (!candles || candles.length < 26) {
      return { rsi: 50, macd: {}, vwap: 0, atr: 15, volumeSpike: false, score: 0 };
    }

    const closes = candles.map(c => c.close);
    const ltp = closes[closes.length - 1];

    // RSI
    const rsiArray = TechnicalIndicators.calculateRSI(closes, 14);
    const rsi = rsiArray[rsiArray.length - 1] || 50;

    let rsiBias = 'NEUTRAL';
    let rsiScore = 0;
    if (rsi > 55) {
      rsiBias = 'BULLISH';
      rsiScore = 20;
    } else if (rsi < 45) {
      rsiBias = 'BEARISH';
      rsiScore = -20;
    }

    // MACD
    const macdArray = TechnicalIndicators.calculateMACD(closes);
    const lastMacd = macdArray[macdArray.length - 1] || { MACD: 0, signal: 0, histogram: 0 };
    const prevMacd = macdArray[macdArray.length - 2] || lastMacd;

    let macdSignal = 'NEUTRAL';
    let macdScore = 0;
    if (lastMacd.histogram > 0 && prevMacd.histogram <= 0) {
      macdSignal = 'BULLISH_CROSSOVER';
      macdScore = 25;
    } else if (lastMacd.histogram < 0 && prevMacd.histogram >= 0) {
      macdSignal = 'BEARISH_CROSSOVER';
      macdScore = -25;
    } else if (lastMacd.histogram > 0) {
      macdSignal = 'BULLISH_HISTOGRAM';
      macdScore = 15;
    } else if (lastMacd.histogram < 0) {
      macdSignal = 'BEARISH_HISTOGRAM';
      macdScore = -15;
    }

    // VWAP
    const vwap = TechnicalIndicators.calculateVWAP(candles);
    let vwapStatus = 'AT_VWAP';
    let vwapScore = 0;
    if (ltp > vwap + 3) {
      vwapStatus = 'ABOVE_VWAP';
      vwapScore = 20;
    } else if (ltp < vwap - 3) {
      vwapStatus = 'BELOW_VWAP';
      vwapScore = -20;
    }

    // ATR
    const atrArray = TechnicalIndicators.calculateATR(candles, 14);
    const atr = atrArray[atrArray.length - 1] || 15;

    // Volume Spike (Volume > 1.8x 20-period Volume MA)
    const volumes = candles.map(c => c.volume || 1);
    const currentVol = volumes[volumes.length - 1];
    const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeSpike = currentVol > (avgVol * 1.8);

    return {
      rsi: Math.round(rsi * 100) / 100,
      rsiBias,
      macd: {
        macd: Math.round((lastMacd.MACD || 0) * 100) / 100,
        signal: Math.round((lastMacd.signal || 0) * 100) / 100,
        histogram: Math.round((lastMacd.histogram || 0) * 100) / 100,
        macdSignal
      },
      vwap: Math.round(vwap * 100) / 100,
      vwapStatus,
      atr: Math.round(atr * 100) / 100,
      volumeSpike,
      currentVolume: currentVol,
      avgVolume: Math.round(avgVol),
      combinedIndicatorScore: rsiScore + macdScore + vwapScore
    };
  }
}

module.exports = IndicatorAnalysis;
