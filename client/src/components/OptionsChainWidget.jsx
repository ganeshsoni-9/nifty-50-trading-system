import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Layers, Activity } from 'lucide-react';

const OptionsChainWidget = () => {
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

  return (
    <div className="terminal-card">
      <div className="flex flex-wrap items-center justify-between border-b border-[#1e293b] pb-3 mb-4 gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          NIFTY Option Chain & PCR Analysis
        </span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800 font-mono">
          {interpretation}
        </span>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
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
      </div>

      {/* Stripped Option Chain Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px]">
            <tr>
              <th className="p-2 text-emerald-400">CALL LTP</th>
              <th className="p-2 text-emerald-400">CALL OI</th>
              <th className="p-2 text-center text-amber-400">STRIKE</th>
              <th className="p-2 text-right text-red-400">PUT OI</th>
              <th className="p-2 text-right text-red-400">PUT LTP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {strikes.map((s) => (
              <tr
                key={s.strikePrice}
                className={s.isATM ? 'bg-amber-500/10 font-bold' : 'hover:bg-[#1e293b]/50'}
              >
                <td className="p-2 text-emerald-400">₹{s.call.ltp}</td>
                <td className="p-2 text-gray-300">{s.call.openInterest.toLocaleString()}</td>
                <td className="p-2 text-center font-extrabold text-amber-400">
                  {s.strikePrice} {s.isATM && <span className="text-[9px] bg-amber-500 text-black px-1 rounded ml-1">ATM</span>}
                </td>
                <td className="p-2 text-right text-gray-300">{s.put.openInterest.toLocaleString()}</td>
                <td className="p-2 text-right text-red-400">₹{s.put.ltp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionsChainWidget;
