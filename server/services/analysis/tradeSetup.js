const RiskManagement = require('./riskManagement');

class TradeSetup {
  static evaluate(trendData, structureData, indicatorData, srData, ltp, multiTimeframeTrends = {}) {
    let bullishScore = 0;
    let bearishScore = 0;
    const reasons = [];

    const tf5m = multiTimeframeTrends.tf5m || trendData.trend;
    const tf15m = multiTimeframeTrends.tf15m || trendData.trend;
    const tf1h = multiTimeframeTrends.tf1h || trendData.trend;

    const isAllBullish = tf5m === 'BULLISH' && tf15m === 'BULLISH' && tf1h === 'BULLISH';
    const isAllBearish = tf5m === 'BEARISH' && tf15m === 'BEARISH' && tf1h === 'BEARISH';
    const isConflict = (tf5m === 'BULLISH' && tf1h === 'BEARISH') || (tf5m === 'BEARISH' && tf1h === 'BULLISH');

    // 1. Multi-Timeframe Alignment Scoring (Fix 2)
    if (isAllBullish) {
      bullishScore += 30;
      reasons.push('5M, 15M, and 1H trends are 100% aligned Bullish');
    } else if (isAllBearish) {
      bearishScore += 30;
      reasons.push('5M, 15M, and 1H trends are 100% aligned Bearish');
    } else if (trendData.alignment === 'PERFECT_BULLISH_STACK') {
      bullishScore += 20;
      reasons.push('EMA 20 > EMA 50 > EMA 200 bullish alignment');
    } else if (trendData.alignment === 'PERFECT_BEARISH_STACK') {
      bearishScore += 20;
      reasons.push('EMA 20 < EMA 50 < EMA 200 bearish alignment');
    } else if (trendData.trend === 'BULLISH') {
      bullishScore += 15;
    } else if (trendData.trend === 'BEARISH') {
      bearishScore += 15;
    }

    // 2. VWAP Alignment
    if (indicatorData.vwapStatus === 'ABOVE_VWAP') {
      bullishScore += 20;
      reasons.push('Price is trading cleanly above intraday VWAP');
    } else if (indicatorData.vwapStatus === 'BELOW_VWAP') {
      bearishScore += 20;
      reasons.push('Price is trading cleanly below intraday VWAP');
    }

    // 3. RSI Momentum
    if (indicatorData.rsi > 58) {
      bullishScore += 20;
      reasons.push(`RSI (${indicatorData.rsi}) indicates strong bullish momentum`);
    } else if (indicatorData.rsi < 42) {
      bearishScore += 20;
      reasons.push(`RSI (${indicatorData.rsi}) indicates strong bearish momentum`);
    }

    // 4. Market Structure
    if (structureData.structure.includes('BULLISH')) {
      bullishScore += 20;
      reasons.push('Higher High + Higher Low market structure confirmed');
    } else if (structureData.structure.includes('BEARISH')) {
      bearishScore += 20;
      reasons.push('Lower High + Lower Low market structure confirmed');
    }

    // 5. Volume Expansion
    if (indicatorData.volumeSpike) {
      if (bullishScore > bearishScore) {
        bullishScore += 10;
        reasons.push('High volume breakout expansion confirmed');
      } else {
        bearishScore += 10;
        reasons.push('High volume breakdown expansion confirmed');
      }
    }

    // Normalize Scores to max 100
    bullishScore = Math.min(100, Math.max(0, bullishScore));
    bearishScore = Math.min(100, Math.max(0, bearishScore));

    // Determine Bias & Handle Conflict / Strong / Normal states (Fix 2)
    let marketBias = 'NEUTRAL / NO EDGE';
    if (isConflict) {
      marketBias = '🟡 MIXED SIGNALS — WAIT';
    } else if (isAllBullish && bullishScore >= 75) {
      marketBias = '🟢 STRONG BULLISH';
    } else if (bullishScore >= 60) {
      marketBias = '🟢 BULLISH';
    } else if (isAllBearish && bearishScore >= 75) {
      marketBias = '🔴 STRONG BEARISH';
    } else if (bearishScore >= 60) {
      marketBias = '🔴 BEARISH';
    } else {
      marketBias = '🟡 NO CLEAR EDGE';
    }

    // No Trade Criteria Check
    const isSideways = Math.abs(bullishScore - bearishScore) < 20;
    const isNeutralRsi = indicatorData.rsi >= 45 && indicatorData.rsi <= 55;
    const isChoppyStructure = structureData.structure.includes('CONSOLIDATION') || structureData.structure.includes('SIDEWAYS');

    if (isConflict || isSideways || isNeutralRsi || isChoppyStructure || (bullishScore < 60 && bearishScore < 60)) {
      const noTradeReasons = [];
      if (isConflict) noTradeReasons.push(`Timeframe conflict: 5M is ${tf5m} while 1H is ${tf1h}`);
      if (isNeutralRsi) noTradeReasons.push(`RSI (${indicatorData.rsi}) is neutral in 45-55 range`);
      if (isSideways) noTradeReasons.push('Bullish vs Bearish score differential is insufficient');
      if (isChoppyStructure) noTradeReasons.push('Price structure is consolidating in a tight range');

      return {
        direction: 'NO_TRADE',
        marketBias,
        bullishScore,
        bearishScore,
        confidence: Math.round(Math.max(bullishScore, bearishScore)),
        reasons: noTradeReasons,
        invalidationRules: [
          'Wait for 5M, 15M, and 1H timeframes to align in the same direction',
          'Wait for clear breakout above resistance or breakdown below support'
        ],
        tradeLevels: null,
        marketRegime: isConflict ? 'MIXED TIMEFRAMES' : isChoppyStructure ? 'SIDEWAYS / CHOPPY' : 'LOW VOLATILITY'
      };
    }

    // Trade Signal Generation
    const direction = bullishScore > bearishScore ? 'LONG' : 'SHORT';
    const confidence = Math.round(direction === 'LONG' ? bullishScore : bearishScore);
    const tradeLevels = RiskManagement.calculateTradeLevels(
      direction,
      ltp,
      indicatorData.atr,
      structureData.swingHigh,
      structureData.swingLow
    );

    const invalidationRules = direction === 'LONG'
      ? [
          `15M candle closes below SL level (${tradeLevels.stopLoss})`,
          'Intraday VWAP breakdown with high volume rejection',
          'RSI falls below 45'
        ]
      : [
          `15M candle closes above SL level (${tradeLevels.stopLoss})`,
          'Intraday VWAP reclaim with high volume expansion',
          'RSI rises above 55'
        ];

    let marketRegime = 'TRENDING ' + direction;
    if (indicatorData.volumeSpike) marketRegime = '🔥 HIGH VOLATILITY + ' + direction + ' BREAKOUT';

    return {
      direction,
      marketBias,
      bullishScore,
      bearishScore,
      confidence,
      reasons,
      invalidationRules,
      tradeLevels,
      marketRegime
    };
  }
}

module.exports = TradeSetup;
