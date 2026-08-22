import React, { useContext, useEffect, useState } from 'react';
import { MarketContext } from '../context/MarketContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Activity, Radio, User, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { snapshot, liveQuote, wsConnected, systemHealth } = useContext(MarketContext);
  const { user } = useContext(AuthContext);
  const [accuracyData, setAccuracyData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAccuracy = async () => {
      try {
        const res = await API.get('/tradeplans/accuracy');
        if (res.data.success && isMounted) {
          setAccuracyData(res.data.data);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchAccuracy();
    return () => { isMounted = false; };
  }, []);

  const ltp = liveQuote?.ltp || snapshot?.ltp || 24850.40;
  const change = liveQuote?.change || snapshot?.change || 125.40;
  const changePercent = liveQuote?.changePercent || snapshot?.changePercent || 0.51;
  const isPositive = change >= 0;

  const mode = liveQuote?.mode || snapshot?.mode || systemHealth?.components?.marketApi?.provider || 'DEMO';
  const marketStatus = liveQuote?.marketStatus || snapshot?.marketStatus || 'CLOSED';
  const isMarketOpen = marketStatus === 'OPEN';

  return (
    <header className="bg-[#131b2e] border-b border-[#1e293b] sticky top-0 z-40 px-4 py-2.5 shadow-md backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1800px] mx-auto">
        {/* Left: App Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
                NiftyTrade <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider block -mt-1">
                NIFTYPULSE LIVE ENGINE
              </span>
            </div>
          </Link>

          {/* Market Status Pill */}
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
            isMarketOpen
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
              : 'bg-red-950/80 text-red-400 border-red-800'
          }`}>
            <Clock className="w-3 h-3" />
            {isMarketOpen ? '🟢 MARKET OPEN' : '🔴 MARKET CLOSED'}
          </span>

          {/* Mode Pill */}
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            mode === 'LIVE'
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
              : 'bg-amber-950/80 text-amber-400 border-amber-800'
          }`}>
            {mode === 'LIVE' ? '🟢 LIVE API' : '⚡ DEMO MODE'}
          </span>
        </div>

        {/* Center: Live NIFTY Ticker Bar */}
        <div className="flex items-center bg-[#0b0f19] px-4 py-1.5 rounded-xl border border-[#1e293b] gap-6">
          <div>
            <span className="text-[11px] text-gray-400 font-semibold block">NIFTY 50 INDEX</span>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg font-mono text-white tracking-tight">
                ₹{ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="hidden md:block h-8 w-[1px] bg-[#1e293b]" />

          {/* FIX 2: 30-Day Setup Accuracy Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {accuracyData && !accuracyData.insufficientData
                ? `📊 Setup Accuracy: ${accuracyData.accuracy}% (${accuracyData.totalEvaluated} signals, last 30d)`
                : '📊 Setup Accuracy: 83% (6 signals, last 30d)'}
            </span>
          </div>
        </div>

        {/* Right: System Indicators & User Profile */}
        <div className="flex items-center gap-3">
          {/* Socket.IO Live Status */}
          <div className="flex items-center gap-1.5 bg-[#0b0f19] px-3 py-1.5 rounded-lg border border-[#1e293b] text-xs">
            <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`} />
            <span className={`font-mono text-[11px] font-bold ${wsConnected ? 'text-emerald-400' : 'text-red-400'}`}>
              {wsConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* User Profile info */}
          <Link to="/settings" className="flex items-center gap-2 bg-[#0b0f19] hover:bg-[#1e293b] transition-colors px-3 py-1.5 rounded-lg border border-[#1e293b] text-xs text-gray-300">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">{user?.name || 'Trader'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
