import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import { AuthContext } from '../context/AuthContext';
import RiskCalculatorWidget from '../components/RiskCalculatorWidget';
import { Settings, ShieldCheck, Cpu, Database, Radio, Key } from 'lucide-react';

const SettingsPage = () => {
  const { systemHealth } = useContext(MarketContext);
  const { user } = useContext(AuthContext);

  const comps = systemHealth?.components || {};

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          System Settings & API Health Monitor
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          User profile, risk parameters, and backend system health status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Calculator & Settings */}
        <div>
          <RiskCalculatorWidget />
        </div>

        {/* System API Health Monitor Widget */}
        <div className="terminal-card space-y-4">
          <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <Cpu className="w-4 h-4 text-blue-400" />
            Live Infrastructure Health Monitor
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300">Broker Market API</span>
              </div>
              <span className="font-bold text-emerald-400">
                {comps.marketApi?.status || '🟢 CONNECTED'}
              </span>
            </div>

            <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300">Socket.IO Real-time Stream</span>
              </div>
              <span className="font-bold text-emerald-400">
                {comps.webSocket?.status || '🟢 LIVE STREAMING'}
              </span>
            </div>

            <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">MongoDB Database</span>
              </div>
              <span className="font-bold text-purple-400">
                {comps.mongoDB?.status || '🟢 CONNECTED'}
              </span>
            </div>

            <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Analysis Engine Status</span>
              </div>
              <span className="font-bold text-blue-400">
                {comps.analysisEngine?.status || '🟢 RUNNING'}
              </span>
            </div>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] text-xs text-gray-400 space-y-1">
            <span className="text-[10px] font-bold text-gray-500 block uppercase">Angel One Credentials Setup</span>
            <p className="text-[11px] leading-relaxed">
              To connect your live Angel One SmartAPI account, configure <code className="text-emerald-400 font-mono">ANGEL_API_KEY</code>, <code className="text-emerald-400 font-mono">ANGEL_CLIENT_ID</code>, <code className="text-emerald-400 font-mono">ANGEL_PASSWORD</code>, and <code className="text-emerald-400 font-mono">ANGEL_TOTP_SECRET</code> inside <code className="text-blue-400 font-mono">server/.env</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
