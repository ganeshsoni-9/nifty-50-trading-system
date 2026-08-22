import React from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, Gauge } from 'lucide-react';

const MarketBiasWidget = ({ tradeSetup }) => {
  if (!tradeSetup) return null;

  const { bullishScore = 50, bearishScore = 50, marketBias = 'NEUTRAL', confidence = 50, marketRegime } = tradeSetup;

  const isBullish = bullishScore > bearishScore;
  const isNeutral = Math.abs(bullishScore - bearishScore) < 15;

  return (
    <div className="terminal-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-blue-400" />
          Market Bias & Score
        </span>
        <span className="text-[11px] font-mono font-semibold text-gray-400 bg-[#0b0f19] px-2 py-0.5 rounded border border-[#1e293b]">
          {marketRegime || 'NORMAL'}
        </span>
      </div>

      {/* Large Market Bias Badge */}
      <div className="text-center py-2">
        <span className="text-xs text-gray-400 uppercase block font-semibold mb-1">Final Market Bias</span>
        <div className={`text-2xl font-black tracking-tight inline-block px-4 py-1.5 rounded-xl border ${
          marketBias.includes('BULLISH')
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700 glow-green'
            : marketBias.includes('BEARISH')
            ? 'bg-red-950/80 text-red-400 border-red-700 glow-red'
            : 'bg-amber-950/80 text-amber-400 border-amber-700 glow-yellow'
        }`}>
          {marketBias}
        </div>
      </div>

      {/* Progress Bars for Bullish vs Bearish */}
      <div className="space-y-3 my-4">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Bullish Power
            </span>
            <span className="font-mono font-bold text-emerald-400">{bullishScore} / 100</span>
          </div>
          <div className="w-full bg-[#0b0f19] rounded-full h-2.5 overflow-hidden border border-[#1e293b]">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500"
              style={{ width: `${bullishScore}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-red-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Bearish Power
            </span>
            <span className="font-mono font-bold text-red-400">{bearishScore} / 100</span>
          </div>
          <div className="w-full bg-[#0b0f19] rounded-full h-2.5 overflow-hidden border border-[#1e293b]">
            <div
              className="bg-red-500 h-2.5 rounded-full transition-all duration-500 shadow-sm shadow-red-500"
              style={{ width: `${bearishScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Setup Confidence Meter */}
      <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">Setup Confidence:</span>
        <span className="font-mono font-extrabold text-sm text-blue-400">
          {confidence}%
        </span>
      </div>
    </div>
  );
};

export default MarketBiasWidget;
