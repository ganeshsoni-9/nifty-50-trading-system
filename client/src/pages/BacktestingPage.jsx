import React, { useState } from 'react';
import API from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TestTube2, Play, Award, TrendingUp, AlertTriangle } from 'lucide-react';

const BacktestingPage = () => {
  const [timeframe, setTimeframe] = useState('15m');
  const [capital, setCapital] = useState(100000);
  const [riskPercent, setRiskPercent] = useState(1.0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunBacktest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/backtest', {
        timeframe,
        capital,
        riskPerTradePercent: riskPercent
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Backtest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <TestTube2 className="w-6 h-6 text-emerald-400" />
          Strategy Backtesting Lab (No Look-Ahead Bias)
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Simulate multi-timeframe EMA + VWAP rules on historical candle data
        </p>
      </div>

      {/* Strategy Control Controls */}
      <div className="terminal-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            >
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Initial Capital (₹)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Risk Per Trade (%)</label>
            <input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunBacktest}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Run Backtest Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-xs font-mono">
          {error}
        </div>
      )}

      {/* Backtest Results */}
      {result && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono">
            <div className="terminal-card text-center p-3">
              <span className="text-[10px] text-gray-400 font-bold block">TOTAL TRADES</span>
              <span className="text-xl font-black text-white">{result.totalTrades}</span>
            </div>

            <div className="terminal-card text-center p-3">
              <span className="text-[10px] text-gray-400 font-bold block">WIN RATE</span>
              <span className="text-xl font-black text-emerald-400">{result.winRate}%</span>
            </div>

            <div className="terminal-card text-center p-3">
              <span className="text-[10px] text-gray-400 font-bold block">PROFIT FACTOR</span>
              <span className="text-xl font-black text-blue-400">{result.profitFactor}</span>
            </div>

            <div className="terminal-card text-center p-3">
              <span className="text-[10px] text-gray-400 font-bold block">MAX DRAWDOWN</span>
              <span className="text-xl font-black text-red-400">{result.maxDrawdownPercent}%</span>
            </div>

            <div className="terminal-card text-center p-3">
              <span className="text-[10px] text-gray-400 font-bold block">NET POINTS</span>
              <span className="text-xl font-black text-emerald-400">+{result.netPoints} pts</span>
            </div>

            <div className="terminal-card text-center p-3 border-emerald-500">
              <span className="text-[10px] text-gray-400 font-bold block">FINAL EQUITY</span>
              <span className="text-xl font-black text-emerald-400">₹{result.finalEquity?.toLocaleString()}</span>
            </div>
          </div>

          {/* Equity Curve Chart */}
          <div className="terminal-card">
            <h3 className="text-xs font-bold text-gray-300 uppercase mb-4 tracking-wider">
              Equity Growth Curve
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equityCurve}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="tradeIndex" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestingPage;
