import React, { useState, useEffect } from 'react';
import { Target, ShieldAlert, CheckCircle2, PlayCircle, Clock, AlertTriangle } from 'lucide-react';
import API from '../services/api';

const TradePlanCard = ({ tradeSetup, ltp = 24850 }) => {
  const [paperMessage, setPaperMessage] = useState('');
  const [lastTickTime, setLastTickTime] = useState(new Date());
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    setLastTickTime(new Date());
    setIsStale(false);
  }, [ltp]);

  useEffect(() => {
    const timer = setInterval(() => {
      const secondsAgo = Math.floor((Date.now() - lastTickTime.getTime()) / 1000);
      if (secondsAgo > 5) {
        setIsStale(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastTickTime]);

  if (!tradeSetup) return null;

  const { direction, tradeLevels, confidence, reasons = [] } = tradeSetup;

  const isLong = direction === 'LONG';
  const isShort = direction === 'SHORT';
  const isNoTrade = direction === 'NO_TRADE';

  // FIX 1 & FIX 2: Live Tick LTP Binding for Pending Suggestions (Tight 15-pt SL)
  const activeLtp = ltp || tradeLevels?.entryMid || 24850;
  const slGap = tradeLevels?.riskPoints || 15;

  const entryMid = Math.round(activeLtp * 100) / 100;
  const entryMin = Math.round((activeLtp - 5) * 100) / 100;
  const entryMax = Math.round((activeLtp + 5) * 100) / 100;

  const stopLoss = isLong
    ? Math.round((entryMid - slGap) * 100) / 100
    : Math.round((entryMid + slGap) * 100) / 100;

  const target1 = isLong
    ? Math.round((entryMid + slGap * 2.0) * 100) / 100
    : Math.round((entryMid - slGap * 2.0) * 100) / 100;

  const target2 = isLong
    ? Math.round((entryMid + slGap * 4.0) * 100) / 100
    : Math.round((entryMid - slGap * 4.0) * 100) / 100;

  const target3 = isLong
    ? Math.round((entryMid + slGap * 6.0) * 100) / 100
    : Math.round((entryMid - slGap * 6.0) * 100) / 100;

  // FIX 2: Freeze exact live price upon paper trade execution
  const handleExecutePaper = async () => {
    if (isNoTrade) return;
    try {
      const res = await API.post('/papertrades', {
        direction,
        entryPrice: entryMid, // Frozen at current live execution tick
        stopLoss: stopLoss,   // Frozen
        target1: target1,     // Frozen
        target2: target2,     // Frozen
        target3: target3,     // Frozen
        quantity: tradeLevels?.lotSize ? tradeLevels.lotSize * 25 : 50
      });
      if (res.data.success) {
        setPaperMessage(`✅ Paper Trade Frozen & Executed at ₹${entryMid}!`);
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
      {/* Header with Timestamp & Staleness Telemetry */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="font-extrabold text-sm tracking-wide text-white uppercase block">Rule-Based Trade Plan</span>
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              Generated: {lastTickTime.toLocaleTimeString()}
              {isStale && <span className="text-amber-400 font-bold ml-1 animate-pulse">⚠️ Recalculating...</span>}
            </span>
          </div>
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
        /* Trade Levels Display (Re-bound to 1s Live Tick LTP) */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Entry Zone (Live)</span>
            <span className="font-mono font-bold text-sm text-blue-400">
              ₹{entryMin} – ₹{entryMax}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Tight SL ({slGap} pts)</span>
            <span className="font-mono font-bold text-sm text-red-400">
              ₹{stopLoss}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Risk / Reward</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              1 : 2.4
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Target 1 (+{slGap * 2} pts)</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ₹{target1}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Target 2 (+{slGap * 4} pts)</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ₹{target2}
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Target 3 (+{slGap * 6} pts)</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              ₹{target3}
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
            <span>Execute Paper Trade (Freeze Entry @ ₹{entryMid})</span>
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
