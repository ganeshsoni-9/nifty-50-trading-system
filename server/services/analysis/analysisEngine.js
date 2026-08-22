const marketDataService = require('../marketData/marketDataService');
const TrendAnalysis = require('./trendAnalysis');
const MarketStructure = require('./marketStructure');
const SupportResistance = require('./supportResistance');
const IndicatorAnalysis = require('./indicatorAnalysis');
const TradeSetup = require('./tradeSetup');
const OptionsAnalysis = require('./optionsAnalysis');

class AnalysisEngine {
  static evaluateTimeframeSignal(candles, tfLabel, ltp) {
    if (!candles || candles.length === 0) {
      return { direction: 'NEUTRAL', confidence: 50, reason: 'No historical candle data', tradeLevels: null };
    }

    const currentPrice = ltp || candles[candles.length - 1].close;
    const trend = TrendAnalysis.analyze(candles);
    const indicators = IndicatorAnalysis.analyze(candles);
    const structure = MarketStructure.analyze(candles);
    const sr = SupportResistance.analyze(candles, currentPrice);

    const setup = TradeSetup.evaluate(trend, structure, indicators, sr, currentPrice, {
      tf5m: trend.trend,
      tf15m: trend.trend,
      tf1h: trend.trend
    });

    return {
      direction: setup.direction,
      marketBias: setup.marketBias,
      confidence: setup.confidence,
      reason: setup.reasons[0] || (trend.alignment ? trend.alignment : 'Consolidating in tight range'),
      reasons: setup.reasons,
      tradeLevels: setup.tradeLevels,
      supportResistance: sr,
      marketStructure: structure
    };
  }

  static async runFullAnalysis(selectedTimeframe = '15m') {
    try {
      const quote = await marketDataService.getQuote('NIFTY 50');
      const ltp = quote.ltp;

      // Fetch candle history for all 6 timeframes
      const candles1m = await marketDataService.getHistoricalData('NIFTY 50', '1m');
      const candles5m = await marketDataService.getHistoricalData('NIFTY 50', '5m');
      const candles15m = await marketDataService.getHistoricalData('NIFTY 50', '15m');
      const candles30m = await marketDataService.getHistoricalData('NIFTY 50', '30m');
      const candles1h = await marketDataService.getHistoricalData('NIFTY 50', '1h');
      const candles1d = await marketDataService.getHistoricalData('NIFTY 50', '1d');

      // Primary decision timeframe candles (user selected or 15m default)
      let activeCandles = candles15m;
      if (selectedTimeframe === '1m') activeCandles = candles1m;
      if (selectedTimeframe === '5m') activeCandles = candles5m;
      if (selectedTimeframe === '30m') activeCandles = candles30m;
      if (selectedTimeframe === '1h') activeCandles = candles1h;
      if (selectedTimeframe === '1d') activeCandles = candles1d;

      // Multi-timeframe trend checks
      const trend5m = TrendAnalysis.analyze(candles5m);
      const trend15m = TrendAnalysis.analyze(candles15m);
      const trend1h = TrendAnalysis.analyze(candles1h);

      const multiTimeframeTrends = {
        tf5m: trend5m.trend,
        tf15m: trend15m.trend,
        tf1h: trend1h.trend
      };

      // Independent Evaluator for all 6 timeframes with tradeLevels
      const timeframeBreakdown = {
        '1m': this.evaluateTimeframeSignal(candles1m, '1m', ltp),
        '5m': this.evaluateTimeframeSignal(candles5m, '5m', ltp),
        '15m': this.evaluateTimeframeSignal(candles15m, '15m', ltp),
        '30m': this.evaluateTimeframeSignal(candles30m, '30m', ltp),
        '1h': this.evaluateTimeframeSignal(candles1h, '1h', ltp),
        '1d': this.evaluateTimeframeSignal(candles1d, '1d', ltp)
      };

      const longCount = Object.values(timeframeBreakdown).filter(v => v.direction === 'LONG').length;
      const shortCount = Object.values(timeframeBreakdown).filter(v => v.direction === 'SHORT').length;

      let confluenceSummary = `${longCount} out of 6 timeframes agree on LONG direction`;
      if (shortCount > longCount) {
        confluenceSummary = `${shortCount} out of 6 timeframes agree on SHORT direction`;
      } else if (longCount === shortCount) {
        confluenceSummary = `Mixed signals across timeframes — short-term (${timeframeBreakdown['1m'].direction}) vs long-term (${timeframeBreakdown['1h'].direction})`;
      }

      // Structure & Indicators on primary timeframe
      const structure = MarketStructure.analyze(activeCandles);
      const indicators = IndicatorAnalysis.analyze(activeCandles);
      const sr = SupportResistance.analyze(activeCandles, ltp);

      // Trade Setup Engine with multi-timeframe confluence
      const setup = TradeSetup.evaluate(trend15m, structure, indicators, sr, ltp, multiTimeframeTrends);
      const options = await OptionsAnalysis.analyze();

      return {
        symbol: 'NIFTY 50',
        ltp,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        previousClose: quote.previousClose,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        dayHigh: quote.dayHigh,
        dayLow: quote.dayLow,
        week52High: quote.week52High,
        week52Low: quote.week52Low,
        marketStatus: quote.marketStatus,
        mode: quote.mode,
        provider: quote.provider,
        lastUpdated: new Date().toLocaleTimeString(),

        timeframe: selectedTimeframe,
        multiTimeframeTrends,
        timeframeBreakdown,
        confluenceSummary,

        trend: trend15m,
        marketStructure: structure,
        indicators,
        supportResistance: sr,
        tradeSetup: setup,
        optionsSummary: {
          pcr: options.pcr,
          maxPain: options.maxPain,
          interpretation: options.interpretation
        }
      };
    } catch (err) {
      console.error('[AnalysisEngine Error]', err.message);
      throw err;
    }
  }
}

module.exports = AnalysisEngine;
