import React from 'react';
import { Layers } from 'lucide-react';

const SupportResistanceTable = ({ srData, ltp }) => {
  if (!srData) return null;

  const { pdh, pdl, pdc, dayHigh, dayLow, pivots = {}, fibLevels = {}, strongSupports = [], strongResistances = [] } = srData;

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-purple-400" />
          Key Support & Resistance Zones
        </span>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
          {pivots?.cprType || 'CPR MODERATE'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resistances */}
        <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] space-y-2">
          <span className="text-xs font-bold text-red-400 block border-b border-[#1e293b] pb-1">
            🔴 Resistance Levels
          </span>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">R3 Pivot</span>
              <span className="text-red-400 font-bold">₹{pivots.r3 || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">R2 Pivot</span>
              <span className="text-red-400 font-bold">₹{pivots.r2 || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">R1 Pivot / PDH</span>
              <span className="text-red-400 font-bold">₹{pivots.r1 || pdh || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Day High</span>
              <span className="text-white font-bold">₹{dayHigh || '-'}</span>
            </div>
          </div>
        </div>

        {/* Supports */}
        <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] space-y-2">
          <span className="text-xs font-bold text-emerald-400 block border-b border-[#1e293b] pb-1">
            🟢 Support Levels
          </span>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Day Low</span>
              <span className="text-white font-bold">₹{dayLow || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">S1 Pivot / PDL</span>
              <span className="text-emerald-400 font-bold">₹{pivots.s1 || pdl || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">S2 Pivot</span>
              <span className="text-emerald-400 font-bold">₹{pivots.s2 || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">S3 Pivot</span>
              <span className="text-emerald-400 font-bold">₹{pivots.s3 || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CPR summary */}
      <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono text-gray-300">
        <div>
          <span className="text-gray-500 block text-[10px]">CPR CENTRAL PIVOT</span>
          <span className="font-bold text-amber-400">₹{pivots.pivot || '-'}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">CPR RANGE (TC - BC)</span>
          <span>₹{pivots.tc || '-'} – ₹{pivots.bc || '-'}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">FIB 0.618 GOLDEN ZONE</span>
          <span className="text-blue-400 font-bold">₹{fibLevels.fib618 || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default SupportResistanceTable;
