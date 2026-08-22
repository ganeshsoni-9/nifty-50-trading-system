import React, { useState } from 'react';
import { Target, ShieldAlert, CheckCircle2, ArrowUpRight, ArrowDownRight, PlayCircle } from 'lucide-react';
import API from '../services/api';

const TradePlanCard = ({ tradeSetup, ltp }) => {
  const [paperMessage, setPaperMessage] = useState('');

  if (!tradeSetup) return null;

  const { direction, tradeLevels, confidence, reasons = [], invalidationRules = [] } = tradeSetup;

  const isLong = direction === 'LONG';
  const isShort = direction === 'SHORT';
  const isNoTrade = direction === 'NO_TRADE';

  const handleExecutePaper = async () => {
    if (isNoTrade || !tradeLevels) return;
    try {
      const res = await API.post('/papertrades', {
        direction,
        entryPrice: tradeLevels.entryMid,
        stopLoss: tradeLevels.stopLoss,
        target1: tradeLevels.target1,
        target2: tradeLevels.target2,
        target3: tradeLevels.target3,
        quantity: tradeLevels.lotSize || 50
      });
      if (res.data.success) {
        setPaperMessage('✅ Paper Trade Executed Successfully!');
        setTimeout(() => setPaperMessage(''), 4000);
      }
    } catch (err) {
      setPaperMessage('❌ Failed to execute paper trade');
    }
  };

  return (
    <div className={`terminal-card flex flex-col justify-between h-full border-2 ${
      isLong ? 'border-emerald-600/60 bg-[#0d1f1c]' : isShort ? 'border-red-600/60 bg-[#211116]' : 'border-amber-600/60 bg-[#1f1a10]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-sm tracking-wide text-white uppercase">Rule-Based Trade Plan</span>
        </div>
        <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
          isLong ? 'bg-emerald-500 text-white' : isShort ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
        }`}>
          {direction}
        </span>
      </div>

      {isNoTrade ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-lg text-amber-400">NO CLEAR EDGE — WAIT</h4>
          <p className="text-xs text-gray-300 max-w-sm mx-auto">
            Market is consolidating or indicators are contradictory. Preserving capital is the highest priority trade.
          </p>
        </div>
      ) : (
        /* Trade Levels Display */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Entry Zone</span>
            <span className="font-mono font-bold text-sm text-blue-400">
              ₹{tradeLevels?.entryMin} – ₹{tradeLevels?.entryMax}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Stop Loss</span>
            <span className="font-mono font-bold text-sm text-red-400">
              ₹{tradeLevels?.stopLoss}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Risk / Reward</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              {tradeLevels?.riskReward}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Target 1</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ₹{tradeLevels?.target1}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Target 2</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ₹{tradeLevels?.target2}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Target 3</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ₹{tradeLevels?.target3}
            </span>
          </div>
        </div>
      )}

      {/* Why? Reasons */}
      <div className="space-y-2 bg-[#0b0f19]/80 p-3.5 rounded-xl border border-[#1e293b] my-2">
        <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider block">
          WHY THIS SETUP?
        </span>
        <ul className="space-y-1">
          {reasons.slice(0, 4).map((r, i) => (
            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Footer */}
      {!isNoTrade && (
        <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
          <button
            onClick={handleExecutePaper}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Execute Paper Trade</span>
          </button>
        </div>
      )}

      {paperMessage && (
        <p className="text-xs text-center text-emerald-400 font-bold mt-2">{paperMessage}</p>
      )}
    </div>
  );
};

export default TradePlanCard;
