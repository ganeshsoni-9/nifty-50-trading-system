import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { History, Target } from 'lucide-react';

const HistoryPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        const res = await API.get('/tradeplans');
        if (res.data.success && isMounted) {
          setPlans(res.data.data);
        }
      } catch (err) {
        console.error('[HistoryPage Fetch Error]', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlans();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" />
          Trade Plan Historical Repository
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Full historical audit log of generated signals, bias scores, and outcomes
        </p>
      </div>

      <div className="terminal-card">
        {loading ? (
          <p className="text-xs font-mono text-gray-500 py-6 text-center">Loading trade plans history...</p>
        ) : plans.length === 0 ? (
          <p className="text-xs font-mono text-gray-500 py-6 text-center">No trade plan records found.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p._id} className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded uppercase ${
                      p.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : p.direction === 'SHORT' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {p.direction}
                    </span>
                    <span className="text-xs font-bold text-white">{p.marketBias}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(p.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-300">
                    Entry: ₹{p.entryMin} - ₹{p.entryMax} | SL: ₹{p.stopLoss} | T1: ₹{p.target1}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block text-[10px]">CONFIDENCE</span>
                    <span className="font-bold text-blue-400">{p.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">STATUS</span>
                    <span className="font-bold text-emerald-400">{p.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
