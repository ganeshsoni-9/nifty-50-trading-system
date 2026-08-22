import React, { useState } from 'react';
import { Layers, TrendingUp, TrendingDown, Minus, ShieldCheck, ChevronDown, ChevronUp, Target, ShieldAlert } from 'lucide-react';

const TimeframeBreakdownWidget = ({ timeframeBreakdown, confluenceSummary }) => {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!timeframeBreakdown) return null;

  const tfConfig = [
    { key: '1m', label: '1 MINUTE', subtitle: 'Ultra Scalp' },
    { key: '5m', label: '5 MINUTES', subtitle: 'Intraday Momentum' },
    { key: '15m', label: '15 MINUTES', subtitle: 'Primary Decision' },
    { key: '30m', label: '30 MINUTES', subtitle: 'Structure Trend' },
    { key: '1h', label: '1 HOUR', subtitle: 'Positional Bias' },
    { key: '1d', label: '1 DAY', subtitle: 'Macro Trend' },
  ];

  const toggleExpand = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  return (
    <div className="terminal-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-400" />
          Timeframe-Wise Trade Plan
        </span>
        <span className="text-[10px] font-mono text-gray-500 uppercase">
          6 Independent Signals • Accordion View
        </span>
      </div>

      {/* 6 Timeframe Rows */}
      <div className="space-y-3 my-2">
        {tfConfig.map(({ key, label, subtitle }) => {
          const item = timeframeBreakdown[key] || { direction: 'NEUTRAL', confidence: 50, reason: 'Analyzing...' };
          const isLong = item.direction === 'LONG';
          const isShort = item.direction === 'SHORT';
          const isExpanded = expandedKey === key;
          const levels = item.tradeLevels;

          return (
            <div key={key} className="bg-[#0b0f19] rounded-xl border border-[#1e293b] overflow-hidden">
              {/* Row Header Bar */}
              <div className="p-3 flex items-center justify-between gap-3 font-mono">
                {/* Label & Subtitle */}
                <div className="w-32 shrink-0">
                  <span className="text-xs font-bold text-gray-200 block">{label}</span>
                  <span className="text-[9px] text-gray-500 block -mt-0.5">{subtitle}</span>
                </div>

                {/* Direction Badge */}
                <div className="w-24 shrink-0 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                    isLong
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : isShort
                      ? 'bg-red-950/80 text-red-400 border-red-800'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {isLong ? <TrendingUp className="w-3 h-3" /> : isShort ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {item.direction}
                  </span>
                </div>

                {/* Reason & Strength Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-gray-400 truncate">{item.reason}</span>
                    <span className="text-gray-300 font-bold ml-2">{item.confidence}%</span>
                  </div>
                  <div className="w-full bg-[#131b2e] rounded-full h-1.5 overflow-hidden border border-[#1e293b]">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isLong ? 'bg-emerald-500' : isShort ? 'bg-red-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>

                {/* View Plan Accordion Toggle Button */}
                <button
                  onClick={() => toggleExpand(key)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-[#131b2e] hover:bg-[#1e293b] px-2.5 py-1 rounded-lg border border-[#1e293b] transition-colors shrink-0 ml-2"
                >
                  <span>{isExpanded ? 'Hide' : 'View Plan'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Full Trade Plan Mini-Card */}
              {isExpanded && (
                <div className="p-3 bg-[#131b2e]/60 border-t border-[#1e293b] space-y-3 font-mono text-xs animate-fadeIn">
                  {item.direction === 'NO_TRADE' || item.direction === 'NEUTRAL' || !levels ? (
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/60 text-xs">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>No trade plan available for {label} — timeframe showing no clear direction / choppy market.</span>
                    </div>
                  ) : (
                    <>
                      {/* Trade Plan Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">ENTRY ZONE</span>
                          <span className="font-extrabold text-blue-400">₹{levels.entryMin} - ₹{levels.entryMax}</span>
                        </div>

                        <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">STOP LOSS</span>
                          <span className="font-extrabold text-red-400">₹{levels.stopLoss}</span>
                        </div>

                        <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">TARGET 1</span>
                          <span className="font-extrabold text-emerald-400">₹{levels.target1}</span>
                        </div>

                        <div className="bg-[#0b0f19] p-2 rounded-lg border border-[#1e293b]">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">RISK / REWARD</span>
                          <span className="font-extrabold text-purple-400">1 : {levels.riskReward}</span>
                        </div>
                      </div>

                      {/* Extended Level Details */}
                      <div className="flex flex-wrap items-center justify-between bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b] text-[11px] gap-2">
                        <div>
                          <span className="text-gray-500 font-bold uppercase">TARGET 2: </span>
                          <span className="text-emerald-400 font-bold">₹{levels.target2}</span>
                          <span className="text-gray-500 font-bold uppercase ml-3">TARGET 3: </span>
                          <span className="text-emerald-400 font-bold">₹{levels.target3}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold uppercase">SUPPORT LEVEL: </span>
                          <span className="text-amber-400 font-bold">₹{item.supportResistance?.support1 || levels.stopLoss}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold uppercase">POS SIZE: </span>
                          <span className="text-blue-400 font-bold">{levels.lotSize * 25} Qty ({levels.lotSize} Lots)</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confluence Summary Footer */}
      <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px] font-mono font-bold text-emerald-400 truncate">
          {confluenceSummary || 'Multi-timeframe signal analysis active.'}
        </span>
      </div>
    </div>
  );
};

export default TimeframeBreakdownWidget;
