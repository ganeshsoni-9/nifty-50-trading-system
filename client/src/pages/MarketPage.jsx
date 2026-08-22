import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

const MarketPage = () => {
  const { snapshot, selectedTimeframe, changeTimeframe } = useContext(MarketContext);

  if (!snapshot) return null;

  const { indicators = {}, trend = {}, multiTimeframeTrends = {} } = snapshot;

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1e293b] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            NIFTY 50 Technical Indicator Matrix
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Multi-timeframe trend alignment and oscillator indicators breakdown
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center bg-[#131b2e] p-1 rounded-xl border border-[#1e293b]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => changeTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedTimeframe === tf
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Timeframe Alignment Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="terminal-card text-center">
          <span className="text-xs text-gray-400 font-bold block mb-1">5M Trend</span>
          <span className={`text-base font-extrabold font-mono px-3 py-1 rounded border inline-block ${
            multiTimeframeTrends.tf5m === 'BULLISH' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
          }`}>
            {multiTimeframeTrends.tf5m || 'NEUTRAL'}
          </span>
        </div>

        <div className="terminal-card text-center border-blue-500/50">
          <span className="text-xs text-gray-400 font-bold block mb-1">15M Primary Decision Trend</span>
          <span className={`text-base font-extrabold font-mono px-3 py-1 rounded border inline-block ${
            multiTimeframeTrends.tf15m === 'BULLISH' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
          }`}>
            {multiTimeframeTrends.tf15m || 'NEUTRAL'}
          </span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-xs text-gray-400 font-bold block mb-1">1H Trend</span>
          <span className={`text-base font-extrabold font-mono px-3 py-1 rounded border inline-block ${
            multiTimeframeTrends.tf1h === 'BULLISH' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
          }`}>
            {multiTimeframeTrends.tf1h || 'NEUTRAL'}
          </span>
        </div>
      </div>

      {/* Technical Indicators Table */}
      <div className="terminal-card">
        <h3 className="text-sm font-bold text-gray-200 uppercase mb-4 tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          {selectedTimeframe.toUpperCase()} Indicator Detailed Metrics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">EMA 9</span>
            <span className="text-white font-bold text-sm">₹{trend?.ema9 || '-'}</span>
          </div>
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">EMA 20</span>
            <span className="text-blue-400 font-bold text-sm">₹{trend?.ema20 || '-'}</span>
          </div>
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">EMA 50</span>
            <span className="text-amber-400 font-bold text-sm">₹{trend?.ema50 || '-'}</span>
          </div>
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">EMA 200</span>
            <span className="text-purple-400 font-bold text-sm">₹{trend?.ema200 || '-'}</span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">RSI (14)</span>
            <span className={`font-bold text-sm ${indicators.rsi > 55 ? 'text-emerald-400' : indicators.rsi < 45 ? 'text-red-400' : 'text-amber-400'}`}>
              {indicators.rsi} ({indicators.rsiBias})
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">MACD HISTOGRAM</span>
            <span className="text-white font-bold text-sm">{indicators.macd?.histogram || '-'}</span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">VWAP</span>
            <span className="text-purple-400 font-bold text-sm">₹{indicators.vwap || '-'}</span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-gray-500 block text-[10px]">ATR (14 Volatility)</span>
            <span className="text-blue-400 font-bold text-sm">₹{indicators.atr || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
