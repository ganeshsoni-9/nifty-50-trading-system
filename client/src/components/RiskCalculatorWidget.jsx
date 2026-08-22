import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calculator, Shield } from 'lucide-react';

const RiskCalculatorWidget = ({ riskPoints = 15 }) => {
  const { user, updateSettings } = useContext(AuthContext);
  const [capital, setCapital] = useState(user?.capital || 100000);
  const [riskPercent, setRiskPercent] = useState(user?.riskPerTradePercent || 1.0);
  const [slPoints, setSlPoints] = useState(user?.slPoints || 15);

  const lotSize = 50; // Dynamic NIFTY Lot Size (2 lots = 50 qty)
  const maxRiskRupees = Math.round(capital * (riskPercent / 100));
  const activeRiskPoints = slPoints || riskPoints || 15;
  const maxQtyByRisk = activeRiskPoints > 0 ? Math.floor(maxRiskRupees / activeRiskPoints) : 50;
  const lots = Math.max(1, Math.floor(maxQtyByRisk / 25));
  const suggestedQuantity = lots * 25;

  const handleSave = () => {
    updateSettings(capital, riskPercent, slPoints);
  };

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-emerald-400" />
          Risk & Position Sizing Calculator
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
          SL: {activeRiskPoints} pts
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">Capital (₹)</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">Risk (%)</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">SL Gap (pts)</label>
          <input
            type="number"
            value={slPoints}
            onChange={(e) => setSlPoints(parseInt(e.target.value) || 15)}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b] space-y-1.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Max Risk Capital:</span>
          <span className="font-bold text-red-400">₹{maxRiskRupees.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tight SL Distance:</span>
          <span className="font-bold text-amber-400">{activeRiskPoints} points</span>
        </div>
        <div className="flex justify-between border-t border-[#1e293b] pt-1.5">
          <span className="text-gray-300 font-bold">Suggested Quantity:</span>
          <span className="font-bold text-emerald-400 text-sm">{suggestedQuantity} Qty ({lots} Lots)</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-3 bg-[#1e293b] hover:bg-blue-600 text-white font-bold py-1.5 rounded-lg text-xs transition-colors"
      >
        Update Risk Settings
      </button>
    </div>
  );
};

export default RiskCalculatorWidget;
