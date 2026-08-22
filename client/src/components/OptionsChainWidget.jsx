import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Layers, Target, CheckCircle2 } from 'lucide-react';

const OptionsChainWidget = ({ tradeSetup }) => {
  const [optionData, setOptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      try {
        const res = await API.get('/market/options');
        if (res.data.success && isMounted) {
          setOptionData(res.data.data);
        }
      } catch (err) {
        console.error('[OptionsChainWidget Fetch Error]', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOptions();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="terminal-card flex items-center justify-center p-8">
        <span className="text-xs text-gray-400 font-mono animate-pulse">Loading Option Chain & PCR Analytics...</span>
      </div>
    );
  }

  if (!optionData) return null;

  const { atmStrike, pcr, maxPain, interpretation, strikes = [] } = optionData;

  // FIX 2: Calculate Suggested Strike based on Trade Setup Bias
  const direction = tradeSetup?.direction || 'NO_TRADE';
  const isLong = direction === 'LONG';
  const isShort = direction === 'SHORT';

  const atmRow = strikes.find(s => s.strikePrice === atmStrike) || strikes[0] || {};
  const suggestedType = isLong ? 'CE (Call)' : isShort ? 'PE (Put)' : 'ATM Strike';
  const suggestedLtp = isLong ? atmRow.call?.ltp : isShort ? atmRow.put?.ltp : atmRow.call?.ltp;
  const suggestedOI = isLong ? atmRow.call?.openInterest : isShort ? atmRow.put?.openInterest : atmRow.call?.openInterest;
  const isHighLiquidity = (suggestedOI || 0) >= 50000;

  return (
    <div className="terminal-card space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1e293b] pb-3 gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          NIFTY Option Chain & Moneyness Analytics
        </span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800 font-mono">
          {interpretation}
        </span>
      </div>

      {/* Highlights & FIX 2 Suggested Strike Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-[#1e293b]">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">ATM Strike</span>
          <span className="font-mono font-black text-base text-amber-400">{atmStrike}</span>
        </div>

        <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-[#1e293b]">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">PCR (Put / Call)</span>
          <span className={`font-mono font-black text-base ${pcr >= 1.0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pcr}
          </span>
        </div>

        <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-[#1e293b]">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Max Pain</span>
          <span className="font-mono font-black text-base text-purple-400">{maxPain}</span>
        </div>

        {/* FIX 2: SUGGESTED STRIKE CARD */}
        <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-emerald-500/30 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" /> Suggested Strike
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              isHighLiquidity ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {isHighLiquidity ? 'High Liquidity' : 'Low Liquidity'}
            </span>
          </div>
          <div className="font-mono font-black text-xs text-gray-200">
            NIFTY {atmStrike} {suggestedType}
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-0.5">
            <span>LTP: <strong className="text-emerald-400">₹{suggestedLtp}</strong></span>
            <span>OI: <strong className="text-gray-300">{(suggestedOI || 0).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Option Chain Table with FIX 2 Moneyness Badges */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px]">
            <tr>
              <th className="p-2 text-emerald-400">CALL MONEYNESS</th>
              <th className="p-2 text-emerald-400">CALL LTP</th>
              <th className="p-2 text-emerald-400">CALL OI</th>
              <th className="p-2 text-center text-amber-400">STRIKE</th>
              <th className="p-2 text-right text-red-400">PUT OI</th>
              <th className="p-2 text-right text-red-400">PUT LTP</th>
              <th className="p-2 text-right text-red-400">PUT MONEYNESS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {strikes.map((s) => {
              const callMoneyness = s.callMoneyness || (s.strikePrice < atmStrike ? 'ITM' : s.isATM ? 'ATM' : 'OTM');
              const putMoneyness = s.putMoneyness || (s.strikePrice > atmStrike ? 'ITM' : s.isATM ? 'ATM' : 'OTM');

              return (
                <tr
                  key={s.strikePrice}
                  className={s.isATM ? 'bg-amber-500/10 font-bold' : 'hover:bg-[#1e293b]/50'}
                >
                  {/* Call Moneyness Badge */}
                  <td className="p-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      callMoneyness === 'ITM' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      callMoneyness === 'ATM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}>
                      {callMoneyness}
                    </span>
                  </td>

                  <td className="p-2 text-emerald-400">₹{s.call.ltp}</td>
                  <td className="p-2 text-gray-300">{s.call.openInterest.toLocaleString()}</td>
                  
                  {/* Strike */}
                  <td className="p-2 text-center font-extrabold text-amber-400">
                    {s.strikePrice} {s.isATM && <span className="text-[9px] bg-amber-500 text-black px-1 rounded ml-1">ATM</span>}
                  </td>
                  
                  <td className="p-2 text-right text-gray-300">{s.put.openInterest.toLocaleString()}</td>
                  <td className="p-2 text-right text-red-400">₹{s.put.ltp}</td>

                  {/* Put Moneyness Badge */}
                  <td className="p-2 text-right">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      putMoneyness === 'ITM' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      putMoneyness === 'ATM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}>
                      {putMoneyness}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionsChainWidget;
