import React from 'react';
import { GitCommit, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

const MarketStructureWidget = ({ marketStructure }) => {
  if (!marketStructure) return null;

  const { structure = 'SIDEWAYS', swingHigh, swingLow, bos, choch, retest } = marketStructure;

  const isBullish = structure.includes('BULLISH');
  const isBearish = structure.includes('BEARISH');

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <GitCommit className="w-4 h-4 text-emerald-400" />
          Price Structure & Signals
        </span>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
          isBullish ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : isBearish ? 'bg-red-950/80 text-red-400 border-red-800' : 'bg-gray-800 text-gray-300 border-gray-700'
        }`}>
          {structure}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b]">
          <span className="text-gray-500 text-[10px] block">LAST SWING HIGH</span>
          <span className="font-mono font-bold text-white">₹{swingHigh || '-'}</span>
        </div>
        <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b]">
          <span className="text-gray-500 text-[10px] block">LAST SWING LOW</span>
          <span className="font-mono font-bold text-white">₹{swingLow || '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1e293b] text-[11px] font-semibold text-center">
        <div className={`p-1.5 rounded border ${bos ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-[#0b0f19] text-gray-500 border-[#1e293b]'}`}>
          BOS: {bos ? 'CONFIRMED' : 'NONE'}
        </div>
        <div className={`p-1.5 rounded border ${choch ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-[#0b0f19] text-gray-500 border-[#1e293b]'}`}>
          CHoCH: {choch ? 'DETECTED' : 'NONE'}
        </div>
        <div className={`p-1.5 rounded border ${retest ? 'bg-blue-950 text-blue-400 border-blue-800' : 'bg-[#0b0f19] text-gray-500 border-[#1e293b]'}`}>
          RETEST: {retest ? 'IN ZONE' : 'NO'}
        </div>
      </div>
    </div>
  );
};

export default MarketStructureWidget;
