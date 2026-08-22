import React, { useState } from 'react';
import { TrendingUp, TrendingDown, PlayCircle, Sparkles, AlertCircle, Layers } from 'lucide-react';
import API from '../services/api';

const ManualTradePanel = ({ ltp = 24850, isNiftyUp = true, onTradeEntered }) => {
  const [direction, setDirection] = useState('LONG'); // 'LONG' = CALL, 'SHORT' = PUT
  const [selectedLots, setSelectedLots] = useState(2);
  const [selectedStrikeOffset, setSelectedStrikeOffset] = useState(0); // 0 = ATM, +50 = OTM/ITM
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Strike calculation around live LTP
  const atmStrike = Math.round(ltp / 50) * 50;

  const strikes = [
    { offset: -100, label: `${atmStrike - 100}`, moneyness: direction === 'LONG' ? 'ITM 2' : 'OTM 2', ltp: 175.50, oi: '82,400' },
    { offset: -50,  label: `${atmStrike - 50}`,  moneyness: direction === 'LONG' ? 'ITM 1' : 'OTM 1', ltp: 145.20, oi: '94,100' },
    { offset: 0,    label: `${atmStrike}`,       moneyness: 'ATM',                                   ltp: 120.00, oi: '1,12,500' },
    { offset: 50,   label: `${atmStrike + 50}`,  moneyness: direction === 'LONG' ? 'OTM 1' : 'ITM 1', ltp: 98.40,  oi: '78,900' },
    { offset: 100,  label: `${atmStrike + 100}`, moneyness: direction === 'LONG' ? 'OTM 2' : 'ITM 2', ltp: 76.10,  oi: '65,300' },
  ];

  const currentStrikeObj = strikes.find(s => s.offset === selectedStrikeOffset) || strikes[2];
  const optionType = direction === 'LONG' ? 'CE' : 'PE';
  const fullStrikeTitle = `NIFTY ${currentStrikeObj.label} ${optionType}`;
  const quantity = selectedLots * 25; // NIFTY Lot Size = 25

  const handleEnterTrade = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/papertrades', {
        direction,
        strike: fullStrikeTitle,
        optionType: direction === 'LONG' ? 'CALL' : 'PUT',
        moneyness: currentStrikeObj.moneyness,
        entryPrice: currentStrikeObj.ltp,
        stopLoss: Math.max(5, currentStrikeObj.ltp - 25),
        target1: currentStrikeObj.ltp + 35,
        target2: currentStrikeObj.ltp + 70,
        target3: currentStrikeObj.ltp + 100,
        quantity
      });

      if (res.data.success) {
        setMessage(`✅ Entered ${fullStrikeTitle} @ ₹${currentStrikeObj.ltp} (${quantity} Qty)!`);
        if (onTradeEntered) onTradeEntered();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error('[ManualTrade Error]', err);
      setMessage('❌ Failed to enter paper trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal-card border-blue-500/40 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          TAKE NEW POSITION (MANUAL DEMO TRADE)
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
          Live LTP: ₹{ltp}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Direction Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 font-mono font-bold block uppercase">
            1. Select Direction (Call / Put)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDirection('LONG')}
              className={`p-2.5 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                direction === 'LONG'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                  : 'bg-[#0b0f19] text-gray-400 border-[#1e293b] hover:text-white'
              } ${isNiftyUp ? 'ring-2 ring-emerald-500/50 animate-pulse' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>📈 CALL (Bullish)</span>
            </button>

            <button
              onClick={() => setDirection('SHORT')}
              className={`p-2.5 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                direction === 'SHORT'
                  ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                  : 'bg-[#0b0f19] text-gray-400 border-[#1e293b] hover:text-white'
              } ${!isNiftyUp ? 'ring-2 ring-red-500/50 animate-pulse' : ''}`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>📉 PUT (Bearish)</span>
            </button>
          </div>
        </div>

        {/* 2. Strike Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 font-mono font-bold block uppercase">
            2. Select Strike (ATM / ITM / OTM)
          </label>
          <select
            value={selectedStrikeOffset}
            onChange={(e) => setSelectedStrikeOffset(parseInt(e.target.value))}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-blue-500"
          >
            {strikes.map((s) => (
              <option key={s.offset} value={s.offset}>
                NIFTY {s.label} {optionType} — {s.moneyness} (₹{s.ltp} | OI: {s.oi})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Quantity / Lots Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 font-mono font-bold block uppercase">
            3. Quantity / Lots (Auto-Suggested)
          </label>
          <select
            value={selectedLots}
            onChange={(e) => setSelectedLots(parseInt(e.target.value))}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs font-mono text-blue-400 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value={1}>1 Lot (25 Qty)</option>
            <option value={2}>2 Lots (50 Qty) — Suggested</option>
            <option value={3}>3 Lots (75 Qty)</option>
            <option value={4}>4 Lots (100 Qty)</option>
            <option value={5}>5 Lots (125 Qty)</option>
          </select>
        </div>
      </div>

      {/* Trade Preview Summary & Action Button */}
      <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#131b2e] border border-[#1e293b]">
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Selected Position Preview</span>
            <span className="font-extrabold text-white text-xs">
              {fullStrikeTitle} <span className="text-amber-400">({currentStrikeObj.moneyness})</span> @ <span className="text-emerald-400">₹{currentStrikeObj.ltp}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleEnterTrade}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-2.5 px-6 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all font-mono"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{loading ? 'Entering Trade...' : '✅ ENTER TRADE NOW'}</span>
        </button>
      </div>

      {message && (
        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono font-bold text-emerald-400 text-center animate-fadeIn">
          {message}
        </div>
      )}
    </div>
  );
};

export default ManualTradePanel;
