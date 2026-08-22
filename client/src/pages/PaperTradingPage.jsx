import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FileSpreadsheet, PlayCircle, XCircle, TrendingUp, Award, DollarSign } from 'lucide-react';

const PaperTradingPage = () => {
  const [tradesData, setTradesData] = useState({ stats: {}, data: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPaperTrades = async () => {
    try {
      const res = await API.get('/papertrades');
      if (res.data.success) {
        setTradesData(res.data);
      }
    } catch (err) {
      console.error('[PaperTrades Fetch Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaperTrades();
  }, []);

  const handleCloseTrade = async (id) => {
    try {
      const res = await API.put(`/papertrades/${id}/close`);
      if (res.data.success) {
        setMessage('✅ Paper position closed at live market price');
        fetchPaperTrades();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Failed to close paper position');
    }
  };

  const { stats = {}, data: trades = [] } = tradesData;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          Paper Trading Execution Terminal
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Simulated trading workspace — Track execution, PnL performance, and win rate analytics
        </p>
      </div>

      {message && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold font-mono">
          {message}
        </div>
      )}

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Total Paper Trades</span>
          <span className="text-2xl font-black text-white">{stats.totalTrades || 0}</span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Win Rate %</span>
          <span className="text-2xl font-black text-emerald-400">{stats.winRate || 0}%</span>
        </div>

        <div className="terminal-card text-center">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Win / Loss Count</span>
          <span className="text-2xl font-black text-blue-400">
            {stats.winningTrades || 0}W / {stats.losingTrades || 0}L
          </span>
        </div>

        <div className="terminal-card text-center border-emerald-500/40">
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Net Realized PnL</span>
          <span className={`text-2xl font-black ${(stats.totalPnlRupees || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{(stats.totalPnlRupees || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Active & Closed Paper Trades Table */}
      <div className="terminal-card">
        <h3 className="text-sm font-bold text-gray-200 uppercase mb-4 tracking-wider">
          Paper Positions Log
        </h3>

        {loading ? (
          <p className="text-xs font-mono text-gray-400">Loading paper trades...</p>
        ) : trades.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-gray-400 font-mono">No paper trades executed yet.</p>
            <p className="text-[11px] text-gray-500">Go to Dashboard or Trade Plan tab to execute a paper setup.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">OPEN TIME</th>
                  <th className="p-2.5">DIRECTION</th>
                  <th className="p-2.5">QTY</th>
                  <th className="p-2.5">ENTRY</th>
                  <th className="p-2.5">SL</th>
                  <th className="p-2.5">TARGET 1</th>
                  <th className="p-2.5">EXIT</th>
                  <th className="p-2.5">PNL (₹)</th>
                  <th className="p-2.5">STATUS</th>
                  <th className="p-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {trades.map((t) => (
                  <tr key={t._id} className="hover:bg-[#1e293b]/40">
                    <td className="p-2.5 text-gray-400">{new Date(t.openedAt).toLocaleTimeString()}</td>
                    <td className={`p-2.5 font-bold ${t.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.direction}
                    </td>
                    <td className="p-2.5 text-white">{t.quantity}</td>
                    <td className="p-2.5 text-blue-400">₹{t.entryPrice}</td>
                    <td className="p-2.5 text-red-400">₹{t.stopLoss}</td>
                    <td className="p-2.5 text-emerald-400">₹{t.target1}</td>
                    <td className="p-2.5 text-gray-300">{t.exitPrice ? `₹${t.exitPrice}` : 'ACTIVE'}</td>
                    <td className={`p-2.5 font-bold ${t.pnlRupees >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{t.pnlRupees || 0}
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                        t.status === 'OPEN' ? 'bg-blue-950 text-blue-400 border-blue-800' : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      {t.status === 'OPEN' && (
                        <button
                          onClick={() => handleCloseTrade(t._id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                        >
                          Close Position
                        </button>
                      )}
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

export default PaperTradingPage;
