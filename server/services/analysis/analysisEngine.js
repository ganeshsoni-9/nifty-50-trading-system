const marketDataService = require('../marketData/marketDataService');
const TrendAnalysis = require('./trendAnalysis');
const MarketStructure = require('./marketStructure');
const SupportResistance = require('./supportResistance');
const IndicatorAnalysis = require('./indicatorAnalysis');
const TradeSetup = require('./tradeSetup');
const OptionsAnalysis = require('./optionsAnalysis');

class AnalysisEngine {
  static async runFullAnalysis(selectedTimeframe = '15m') {
    try {
      const quote = await marketDataService.getQuote('NIFTY 50');
      const ltp = quote.ltp;

      // Fetch candle history for primary decision timeframes: 5m, 15m, 1h
      const candles15m = await marketDataService.getHistoricalData('NIFTY 50', '15m');
      const candles5m = await marketDataService.getHistoricalData('NIFTY 50', '5m');
      const candles1h = await marketDataService.getHistoricalData('NIFTY 50', '1h');

      // Primary decision timeframe candles (user selected or 15m default)
      let activeCandles = candles15m;
      if (selectedTimeframe === '5m') activeCandles = candles5m;
      if (selectedTimeframe === '1h') activeCandles = candles1h;

      // Multi-timeframe trend checks
      const trend5m = TrendAnalysis.analyze(candles5m);
      const trend15m = TrendAnalysis.analyze(candles15m);
      const trend1h = TrendAnalysis.analyze(candles1h);

      // Structure & Indicators on primary timeframe
      const structure = MarketStructure.analyze(activeCandles);
      const indicators = IndicatorAnalysis.analyze(activeCandles);
      const sr = SupportResistance.analyze(activeCandles, ltp);

      // Trade Setup Engine
      const setup = TradeSetup.evaluate(trend15m, structure, indicators, sr, ltp);
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
        multiTimeframeTrends: {
          tf5m: trend5m.trend,
          tf15m: trend15m.trend,
          tf1h: trend1h.trend
        },

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
