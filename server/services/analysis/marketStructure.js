class MarketStructure {
  static analyze(candles) {
    if (!candles || candles.length < 20) {
      return { structure: 'SIDEWAYS', bos: false, choch: false, swingHigh: 0, swingLow: 0 };
    }

    const swings = [];
    const len = candles.length;

    // Detect swing points (window = 3)
    for (let i = 3; i < len - 3; i++) {
      const curr = candles[i];
      const isHigh = candles[i - 3].high < curr.high && candles[i - 2].high < curr.high && candles[i - 1].high < curr.high &&
                     candles[i + 1].high < curr.high && candles[i + 2].high < curr.high && candles[i + 3].high < curr.high;

      const isLow = candles[i - 3].low > curr.low && candles[i - 2].low > curr.low && candles[i - 1].low > curr.low &&
                    candles[i + 1].low > curr.low && candles[i + 2].low > curr.low && candles[i + 3].low > curr.low;

      if (isHigh) swings.push({ type: 'HIGH', price: curr.high, index: i });
      if (isLow) swings.push({ type: 'LOW', price: curr.low, index: i });
    }

    const highs = swings.filter(s => s.type === 'HIGH');
    const lows = swings.filter(s => s.type === 'LOW');

    const lastHigh = highs[highs.length - 1] ? highs[highs.length - 1].price : candles[len - 1].high;
    const prevHigh = highs[highs.length - 2] ? highs[highs.length - 2].price : lastHigh;

    const lastLow = lows[lows.length - 1] ? lows[lows.length - 1].price : candles[len - 1].low;
    const prevLow = lows[lows.length - 2] ? lows[lows.length - 2].price : lastLow;

    const ltp = candles[len - 1].close;

    let structure = 'SIDEWAYS';
    let isBOS = false;
    let isCHoCH = false;
    let isRetest = false;

    if (lastHigh > prevHigh && lastLow > prevLow) {
      structure = 'HIGHER_HIGH_HIGHER_LOW (BULLISH)';
      if (ltp > lastHigh) isBOS = true;
    } else if (lastHigh < prevHigh && lastLow < prevLow) {
      structure = 'LOWER_HIGH_LOWER_LOW (BEARISH)';
      if (ltp < lastLow) isBOS = true;
    } else if (lastHigh > prevHigh && lastLow < prevLow) {
      structure = 'EXPANDING_RANGE';
    } else {
      structure = 'CONSOLIDATION / COMPRESSION';
    }

    // CHoCH detection (Change of Character)
    if (structure.includes('BEARISH') && ltp > lastHigh) {
      isCHoCH = true;
    } else if (structure.includes('BULLISH') && ltp < lastLow) {
      isCHoCH = true;
    }

    // Retest check (price within 0.15% of key swing level)
    const distToHigh = Math.abs(ltp - lastHigh) / ltp;
    const distToLow = Math.abs(ltp - lastLow) / ltp;
    if (distToHigh < 0.0015 || distToLow < 0.0015) {
      isRetest = true;
    }

    return {
      structure,
      swingHigh: Math.round(lastHigh * 100) / 100,
      swingLow: Math.round(lastLow * 100) / 100,
      prevSwingHigh: Math.round(prevHigh * 100) / 100,
      prevSwingLow: Math.round(prevLow * 100) / 100,
      bos: isBOS,
      choch: isCHoCH,
      retest: isRetest
    };
  }
}

module.exports = MarketStructure;
