import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  TrendingUp,
  Award,
  DollarSign,
  AlertTriangle,
  Activity,
  Layers,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const PerformancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterResult, setFilterResult] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchPerformance = async () => {
      try {
        const res = await API.get('/papertrades/performance');
        if (res.data.success && isMounted) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[PerformancePage Fetch Error]', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPerformance();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-gray-400">Loading Performance & P&L Analytics...</span>
      </div>
    );
  }

  if (!data) return null;

  const { summary, equityCurve = [], confidenceBands = [], tradeLog = [] } = data;

  const filteredLog = tradeLog.filter(t => {
    if (filterResult === 'ALL') return true;
    return t.result === filterResult;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1e293b] pb-4 gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            P&L Performance & Signal History
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Audit historical trade plan win rates, cumulative equity growth, and confidence band reliability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-800 font-bold">
            Total P&L: ₹{summary.totalPnlRupees ? summary.totalPnlRupees.toLocaleString() : 0}
          </span>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Total Trades</span>
          <span className="font-mono font-black text-lg text-white">{summary.totalTrades}</span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Win Rate</span>
          <span className={`font-mono font-black text-lg ${summary.winRate >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {summary.winRate}%
          </span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Avg Win Trade</span>
          <span className="font-mono font-black text-lg text-emerald-400">₹{summary.avgProfit}</span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Avg Loss Trade</span>
          <span className="font-mono font-black text-lg text-red-400">₹{summary.avgLoss}</span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Profit Factor</span>
          <span className="font-mono font-black text-lg text-purple-400">{summary.profitFactor}</span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-500 font-bold block uppercase">Max Drawdown</span>
          <span className="font-mono font-black text-lg text-amber-400">₹{summary.maxDrawdownRs} ({summary.maxDrawdownPercent}%)</span>
        </div>
      </div>

      {/* Main Grid: Equity Curve Chart (Left) + Confidence Band Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        <div className="terminal-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Cumulative Equity Curve Growth (₹)
            </span>
            <span className="text-[10px] font-mono text-gray-500">Realized Paper P&L</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Band Breakdown Table */}
        <div className="terminal-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Accuracy by Confidence Band
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {confidenceBands.map((band, idx) => (
              <div key={idx} className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] space-y-1">
                <div className="flex items-center justify-between font-bold text-gray-300">
                  <span>{band.band}</span>
                  <span className={`text-sm ${band.winRate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {band.winRate}% Win Rate
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Evaluated Trades:</span>
                  <span className="text-gray-300 font-bold">{band.total} trades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="terminal-card space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-[#1e293b] pb-3 gap-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Trade History Log ({filteredLog.length} Records)
          </span>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-gray-500 text-[10px]">Filter:</span>
            {['ALL', 'WIN', 'LOSS'].map(type => (
              <button
                key={type}
                onClick={() => setFilterResult(type)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  filterResult === type
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#0b0f19] text-gray-400 border-[#1e293b] hover:bg-[#1e293b]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Setup Type</th>
                <th className="p-2.5">Strike</th>
                <th className="p-2.5">Entry</th>
                <th className="p-2.5">Exit</th>
                <th className="p-2.5 text-right">P&L (₹)</th>
                <th className="p-2.5 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredLog.map(row => (
                <tr key={row._id} className="hover:bg-[#1e293b]/50">
                  <td className="p-2.5 text-gray-400">{row.date}</td>
                  <td className="p-2.5 font-bold text-gray-200">{row.setupType} ({row.confidence}%)</td>
                  <td className="p-2.5 font-bold text-amber-400">{row.strike}</td>
                  <td className="p-2.5 text-gray-300">₹{row.entryPrice}</td>
                  <td className="p-2.5 text-gray-300">₹{row.exitPrice}</td>
                  <td className={`p-2.5 text-right font-black ${row.pnlRupees >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {row.pnlRupees >= 0 ? '+' : ''}₹{row.pnlRupees}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      row.result === 'WIN' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      row.result === 'LOSS' ? 'bg-red-950 text-red-400 border-red-800' :
                      'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {row.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIX 4 — Disclaimer Footer */}
      <div className="pt-2 border-t border-[#1e293b] text-[10px] text-gray-500 font-mono text-center flex items-center justify-center gap-1">
        <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>This is a rule-based technical analysis suggestion, not guaranteed. Past accuracy does not guarantee future results. Trade at your own risk.</span>
      </div>
    </div>
  );
};

export default PerformancePage;
