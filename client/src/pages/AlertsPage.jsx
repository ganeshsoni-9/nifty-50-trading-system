import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import { Bell, CheckCircle2 } from 'lucide-react';

const AlertsPage = () => {
  const { alerts = [] } = useContext(MarketContext);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-400" />
          Real-time Trade Plan & Market Alerts Feed
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Socket.IO live stream of entry zones, breakout alerts, and stop loss updates
        </p>
      </div>

      <div className="terminal-card space-y-3">
        {alerts.length === 0 ? (
          <p className="text-xs font-mono text-gray-500 py-6 text-center">No alerts triggered yet.</p>
        ) : (
          alerts.map((a, idx) => (
            <div
              key={a._id || idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                a.level === 'SUCCESS' ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' : 'bg-[#0b0f19] border-[#1e293b] text-gray-200'
              }`}
            >
              <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs">{a.title}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(a.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-300">{a.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
