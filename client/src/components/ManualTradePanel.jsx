import React, { useState } from 'react';
import { TrendingUp, TrendingDown, PlayCircle, Sparkles, AlertCircle, Layers, Target, ShieldAlert } from 'lucide-react';
import API from '../services/api';

const ManualTradePanel = ({ ltp = 24850, isNiftyUp = true, onTradeEntered }) => {
  const [direction, setDirection] = useState('LONG'); // 'LONG' = CALL, 'SHORT' = PUT
  const [selectedLots, setSelectedLots] = useState(2);
  const [selectedStrikeOffset, setSelectedStrikeOffset] = useState(0); // 0 = ATM, +50 = OTM/ITM
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const slGap = 15; // Default 15 points SL Gap
  const rupeePerPoint = 65; // Default ₹65 per point

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

  // Exact Trade Preview Levels
  const entryLtp = currentStrikeObj.ltp;
  const stopLoss = Math.max(5, Math.round((entryLtp - slGap) * 100) / 100);
  const target1 = Math.round((entryLtp + slGap * 2.0) * 100) / 100;
  const target2 = Math.round((entryLtp + slGap * 4.0) * 100) / 100;
  const target3 = Math.round((entryLtp + slGap * 6.0) * 100) / 100;

  // Potential Rs calculation using exact 65/pt formula
  const potentialLossRs = Math.round(slGap * rupeePerPoint * (selectedLots / 2));
  const potentialProfitT1Rs = Math.round((slGap * 2.0) * rupeePerPoint * (selectedLots / 2));

  const handleEnterTrade = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/papertrades', {
        direction,
        strike: fullStrikeTitle,
        optionType: direction === 'LONG' ? 'CALL' : 'PUT',
        moneyness: currentStrikeObj.moneyness,
        entryPrice: entryLtp,
        indexEntryPrice: ltp,
        stopLoss,
        target1,
        target2,
        target3,
        quantity,
        rupeeValuePerPoint: rupeePerPoint
      });

      if (res.data.success) {
        setMessage(`✅ Entered ${fullStrikeTitle} @ ₹${entryLtp} (SL: ₹${stopLoss} | T1: ₹${target1})!`);
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
          Live LTP: ₹{ltp} • ₹{rupeePerPoint}/pt
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

      {/* FIX 2: Live Position Preview (Entry, SL, Targets, Potential Loss/Profit Rs) */}
      <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] border-b border-[#1e293b] pb-2">
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            POSITION TRADE PLAN PREVIEW (FROZEN ON ENTRY)
          </span>
          <span className="text-gray-400 text-[10px]">{fullStrikeTitle} ({currentStrikeObj.moneyness})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-[#131b2e] p-2 rounded-lg border border-[#1e293b]">
            <span className="text-[9px] text-gray-400 block uppercase">ENTRY LTP</span>
            <span className="font-extrabold text-blue-400">₹{entryLtp}</span>
          </div>

          <div className="bg-red-950/40 p-2 rounded-lg border border-red-900/60">
            <span className="text-[9px] text-red-400 block uppercase">SL (-{slGap} PTS)</span>
            <span className="font-extrabold text-red-300">₹{stopLoss}</span>
            <span className="text-[9px] text-red-400 block font-bold">(-₹{potentialLossRs.toLocaleString()})</span>
          </div>

          <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/60">
            <span className="text-[9px] text-emerald-400 block uppercase">TARGET 1 (+30 PTS)</span>
            <span className="font-extrabold text-emerald-300">₹{target1}</span>
            <span className="text-[9px] text-emerald-400 block font-bold">(+₹{potentialProfitT1Rs.toLocaleString()})</span>
          </div>

          <div className="bg-[#131b2e] p-2 rounded-lg border border-[#1e293b]">
            <span className="text-[9px] text-gray-400 block uppercase">TARGET 2 / 3</span>
            <span className="font-extrabold text-emerald-400">₹{target2} / ₹{target3}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-gray-400 text-[11px]">
          1 Pt Move = <strong className="text-amber-400">₹{rupeePerPoint * (selectedLots / 2)}</strong> P&L ({quantity} Qty)
        </span>

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
