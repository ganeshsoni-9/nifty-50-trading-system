import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import CandleChart from '../charts/CandleChart';
import MarketBiasWidget from '../components/MarketBiasWidget';
import TradePlanCard from '../components/TradePlanCard';
import SupportResistanceTable from '../components/SupportResistanceTable';
import MarketStructureWidget from '../components/MarketStructureWidget';
import OptionsChainWidget from '../components/OptionsChainWidget';
import RiskCalculatorWidget from '../components/RiskCalculatorWidget';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { snapshot, selectedTimeframe, changeTimeframe, loading } = useContext(MarketContext);

  if (loading || !snapshot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-gray-400">Initializing Live NIFTY Analysis Engine...</span>
      </div>
    );
  }

  const { tradeSetup, ltp, indicators, supportResistance, marketStructure } = snapshot;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-gray-300">
            NiftyTrade AI Technical Analysis Decision-Support Tool — Rule-Based Execution System
          </span>
        </div>
        <span className="text-[11px] text-gray-500 font-mono hidden sm:inline">
          No Profit Guarantee • Rule-Based Guardrails Active
        </span>
      </div>

      {/* Main Grid Row 1: Candlestick Chart (2 Cols) + Trade Plan Card (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CandleChart
            timeframe={selectedTimeframe}
            tradeSetup={tradeSetup}
            onTimeframeChange={changeTimeframe}
          />
        </div>

        <div>
          <TradePlanCard tradeSetup={tradeSetup} ltp={ltp} />
        </div>
      </div>

      {/* Main Grid Row 2: Market Bias + Structure + Risk Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MarketBiasWidget tradeSetup={tradeSetup} />
        <MarketStructureWidget marketStructure={marketStructure} />
        <RiskCalculatorWidget riskPoints={tradeSetup?.tradeLevels?.riskPoints || 30} />
      </div>

      {/* Main Grid Row 3: Support/Resistance + Options Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupportResistanceTable srData={supportResistance} ltp={ltp} />
        <OptionsChainWidget />
      </div>
    </div>
  );
};

export default Dashboard;
