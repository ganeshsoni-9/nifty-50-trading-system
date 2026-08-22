import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { MarketContext } from '../context/MarketContext';
import ManualTradePanel from '../components/ManualTradePanel';
import { FileSpreadsheet, XCircle, AlertTriangle, Target } from 'lucide-react';

const PaperTradingPage = () => {
  const { ltp = 24850, liveQuote } = useContext(MarketContext);
  const [tradesData, setTradesData] = useState({ stats: {}, data: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const rupeePerPoint = 65; // Default ₹65 per 1.0 point movement
  const isNiftyUp = (liveQuote?.changePercent || 0) >= 0;

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

  const handleCloseTrade = async (id, customExitPrice) => {
    try {
      const res = await API.put(`/papertrades/${id}/close`, { customExitPrice });
      if (res.data.success) {
        setMessage('✅ Position closed successfully!');
        fetchPaperTrades();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Failed to close position');
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
          Simulated trading workspace — Exact ₹65/pt PnL engine, dynamic live premium updates, and position alerts
        </p>
      </div>

      {message && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold font-mono">
          {message}
        </div>
      )}

      {/* MANUAL TRADE EXECUTION PANEL */}
      <ManualTradePanel
        ltp={ltp}
        isNiftyUp={isNiftyUp}
        onTradeEntered={fetchPaperTrades}
      />

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
          <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Net Realized PnL (₹65/pt)</span>
          <span className={`text-2xl font-black ${(stats.totalPnlRupees || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{(stats.totalPnlRupees || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Active & Closed Paper Trades Table */}
      <div className="terminal-card space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center justify-between">
          <span>Paper Positions Log</span>
          <span className="text-[10px] font-mono text-gray-500 uppercase">Live Tick Stream (₹65/Pt) • Dynamic Delta Simulation</span>
        </h3>

        {loading ? (
          <p className="text-xs font-mono text-gray-400">Loading paper trades...</p>
        ) : trades.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-gray-400 font-mono">No paper trades executed yet.</p>
            <p className="text-[11px] text-gray-500">Use the TAKE NEW POSITION panel above to place a manual paper trade.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#0b0f19] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">OPEN TIME</th>
                  <th className="p-2.5">STRIKE & TYPE</th>
                  <th className="p-2.5">QTY</th>
                  <th className="p-2.5">ENTRY</th>
                  <th className="p-2.5">SL</th>
                  <th className="p-2.5">TARGET 1</th>
                  <th className="p-2.5">TARGET 2</th>
                  <th className="p-2.5">LIVE / REALIZED PNL (₹)</th>
                  <th className="p-2.5">STATUS & ALERTS</th>
                  <th className="p-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {trades.map((t) => {
                  const isOpen = t.status === 'OPEN';

                  // BUG 1 ROOT CAUSE FIX: Anchor reference index price properly.
                  // If t.indexEntryPrice exists, use it.
                  // If t.entryPrice > 2000 (Index level trade), use t.entryPrice.
                  // Otherwise fallback to 24850 baseline.
                  const baseIndexPrice = t.indexEntryPrice || (t.entryPrice > 2000 ? t.entryPrice : 24850);
                  const delta = 0.50;
                  const indexShift = ltp - baseIndexPrice;
                  const isCall = t.direction === 'LONG' || (t.strike && t.strike.includes('CE')) || t.optionType === 'CALL';
                  const optionShift = (isCall ? indexShift : -indexShift) * delta;

                  const currentLivePremium = isOpen
                    ? Math.max(1, Math.round((t.entryPrice + optionShift) * 100) / 100)
                    : t.exitPrice;

                  // Exact ₹65/pt PnL calculation (0.5 pt = ₹32.50)
                  const pnlPoints = Math.round((currentLivePremium - t.entryPrice) * 100) / 100;
                  const displayQty = t.quantity || 50; // BUG 2 FIX: Fallback to 50 instead of undefined
                  const displayLots = Math.max(1, Math.floor(displayQty / 25)); // BUG 2 FIX: Fallback to valid integer instead of NaN
                  const lotsMultiplier = displayQty / 50;
                  const livePnlRupees = isOpen
                    ? Math.round(pnlPoints * rupeePerPoint * lotsMultiplier * 10) / 10
                    : (t.pnlRupees || 0);

                  // Check SL / Target Hit Alert Badging
                  const slHit = isOpen && t.stopLoss && currentLivePremium <= t.stopLoss;
                  const targetHit = isOpen && t.target1 && currentLivePremium >= t.target1;

                  return (
                    <tr
                      key={t._id}
                      className={`transition-colors ${
                        slHit
                          ? 'bg-red-950/50 hover:bg-red-900/60'
                          : targetHit
                          ? 'bg-emerald-950/50 hover:bg-emerald-900/60'
                          : 'hover:bg-[#1e293b]/40'
                      }`}
                    >
                      <td className="p-2.5 text-gray-400">{new Date(t.openedAt).toLocaleTimeString()}</td>
                      <td className="p-2.5 font-extrabold text-amber-400">
                        {t.strike || `NIFTY ${t.entryPrice} ${t.direction}`} <span className="text-[10px] text-gray-400 font-normal">({t.moneyness || 'ATM'})</span>
                      </td>
                      {/* BUG 2 FIX: Clean Qty & Lots display without NaN */}
                      <td className="p-2.5 text-white">{displayQty} ({displayLots} Lots)</td>
                      <td className="p-2.5 text-blue-400 font-bold">₹{t.entryPrice}</td>
                      <td className="p-2.5 text-red-400 font-bold">₹{t.stopLoss || Math.max(5, t.entryPrice - 15)}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">₹{t.target1 || t.entryPrice + 30}</td>
                      <td className="p-2.5 text-emerald-400">₹{t.target2 || t.entryPrice + 60}</td>
                      <td className={`p-2.5 font-bold ${livePnlRupees >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ₹{livePnlRupees.toLocaleString()}
                        {isOpen && <span className="text-[9px] text-emerald-400 block font-normal animate-pulse">({pnlPoints > 0 ? '+' : ''}{pnlPoints.toFixed(1)} pts)</span>}
                      </td>
                      <td className="p-2.5">
                        {slHit ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold flex items-center gap-1 w-max animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> ⚠️ SL HIT — Consider Exit
                          </span>
                        ) : targetHit ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1 w-max animate-pulse">
                            <Target className="w-3 h-3" /> 🎯 TARGET REACHED
                          </span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                            isOpen ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}>
                            {t.status}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        {isOpen && (
                          <button
                            onClick={() => handleCloseTrade(t._id, currentLivePremium)}
                            className="bg-[#ef4444] hover:bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ml-auto shadow-md shadow-red-600/30 font-mono"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>EXIT TRADE</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperTradingPage;
