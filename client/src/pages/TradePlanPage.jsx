import React, { useContext, useState, useEffect } from 'react';
import { MarketContext } from '../context/MarketContext';
import TradePlanCard from '../components/TradePlanCard';
import API from '../services/api';
import { Target, History, CheckCircle2, AlertTriangle } from 'lucide-react';

const TradePlanPage = () => {
  const { snapshot, ltp } = useContext(MarketContext);
  const [plansHistory, setPlansHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await API.get('/tradeplans');
        if (res.data.success && isMounted) {
          setPlansHistory(res.data.data);
        }
      } catch (err) {
        console.error('[TradePlanPage Fetch Error]', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  if (!snapshot) return null;

  const { tradeSetup } = snapshot;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-emerald-400" />
          Active Trade Plan & Setup Rules
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Rule-based trade generation, invalidation criteria, and saved setup repository
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradePlanCard tradeSetup={tradeSetup} ltp={ltp} />
        </div>

        {/* Invalidation Rules Panel */}
        <div className="terminal-card flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Setup Invalidation Conditions
            </h3>
            <ul className="space-y-2">
              {tradeSetup?.invalidationRules?.map((rule, idx) => (
                <li key={idx} className="text-xs text-gray-300 bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b] flex items-start gap-2 font-mono">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] mt-4">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">TRADE LIFETIME RULE</span>
            <span className="text-xs text-gray-300">
              Trade setup automatically expires after session close or upon structure breakdown.
            </span>
          </div>
        </div>
      </div>

      {/* Historical Plans */}
      <div className="terminal-card">
        <h3 className="text-sm font-bold text-gray-200 uppercase mb-4 tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Saved Trade Plans Log
        </h3>

        {loading ? (
          <p className="text-xs font-mono text-gray-500">Loading plans log...</p>
        ) : plansHistory.length === 0 ? (
          <p className="text-xs font-mono text-gray-500">No saved trade plans yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">TIME</th>
                  <th className="p-2.5">DIRECTION</th>
                  <th className="p-2.5">BIAS</th>
                  <th className="p-2.5">ENTRY ZONE</th>
                  <th className="p-2.5">STOP LOSS</th>
                  <th className="p-2.5">TARGET 1</th>
                  <th className="p-2.5">CONFIDENCE</th>
                  <th className="p-2.5">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {plansHistory.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1e293b]/40">
                    <td className="p-2.5 text-gray-400">{new Date(p.createdAt).toLocaleTimeString()}</td>
                    <td className={`p-2.5 font-bold ${p.direction === 'LONG' ? 'text-emerald-400' : p.direction === 'SHORT' ? 'text-red-400' : 'text-amber-400'}`}>
                      {p.direction}
                    </td>
                    <td className="p-2.5 text-gray-300">{p.marketBias}</td>
                    <td className="p-2.5 text-blue-400">₹{p.entryMin} – ₹{p.entryMax}</td>
                    <td className="p-2.5 text-red-400">₹{p.stopLoss}</td>
                    <td className="p-2.5 text-emerald-400">₹{p.target1}</td>
                    <td className="p-2.5 font-bold text-white">{p.confidence}%</td>
                    <td className="p-2.5">
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradePlanPage;
