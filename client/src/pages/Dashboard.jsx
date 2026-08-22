import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import CandleChart from '../charts/CandleChart';
import MarketBiasWidget from '../components/MarketBiasWidget';
import TimeframeBreakdownWidget from '../components/TimeframeBreakdownWidget';
import TradePlanCard from '../components/TradePlanCard';
import EntryChecklistWidget from '../components/EntryChecklistWidget';
import SupportResistanceTable from '../components/SupportResistanceTable';
import MarketStructureWidget from '../components/MarketStructureWidget';
import OptionsChainWidget from '../components/OptionsChainWidget';
import RiskCalculatorWidget from '../components/RiskCalculatorWidget';
import { Activity, ShieldAlert, Sparkles, Clock } from 'lucide-react';

const Dashboard = () => {
  const { snapshot, liveQuote, selectedTimeframe, changeTimeframe, loading } = useContext(MarketContext);

  if (loading || !snapshot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-gray-400">Initializing Live NIFTY Analysis Engine...</span>
      </div>
    );
  }

  const { tradeSetup, ltp, indicators, supportResistance, marketStructure, optionsSummary, timeframeBreakdown, confluenceSummary } = snapshot;
  const marketStatus = liveQuote?.marketStatus || snapshot?.marketStatus || 'CLOSED';
  const marketClosedReason = liveQuote?.marketClosedReason || snapshot?.marketClosedReason || 'Market is closed outside NSE trading hours';

  return (
    <div className="space-y-6 pb-12">
      {/* Market Closed Banner */}
      {marketStatus === 'CLOSED' && (
        <div className="bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border border-amber-600/60 rounded-xl p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/40 text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                MARKET IS CURRENTLY CLOSED — LIVE ANALYSIS PAUSED
              </span>
              <span className="text-xs text-gray-300 font-mono">
                {marketClosedReason} (Operating in DEMO mode with last available market snapshot)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold font-mono text-amber-400 bg-amber-950 px-3 py-1 rounded-lg border border-amber-800">
            NSE Hours: 9:15 AM - 3:30 PM IST (Mon-Fri)
          </span>
        </div>
      )}

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

      {/* Main Grid Row 1: Candlestick Chart (2 Cols) + Trade Plan Card & Checklist (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CandleChart
            timeframe={selectedTimeframe}
            tradeSetup={tradeSetup}
            onTimeframeChange={changeTimeframe}
          />
        </div>

        <div className="space-y-6">
          <TradePlanCard tradeSetup={tradeSetup} ltp={ltp} />
          <EntryChecklistWidget tradeSetup={tradeSetup} optionsSummary={optionsSummary} />
        </div>
      </div>

      {/* Main Grid Row 2: TIMEFRAME-WISE TRADE PLAN BREAKDOWN (Large Panel across Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeframeBreakdownWidget timeframeBreakdown={timeframeBreakdown} confluenceSummary={confluenceSummary} />
        </div>
        <div>
          <MarketBiasWidget tradeSetup={tradeSetup} />
        </div>
      </div>

      {/* Main Grid Row 3: Structure + Risk Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MarketStructureWidget marketStructure={marketStructure} />
        <RiskCalculatorWidget riskPoints={tradeSetup?.tradeLevels?.riskPoints || 30} />
      </div>

      {/* Main Grid Row 4: Support/Resistance + Options Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupportResistanceTable srData={supportResistance} ltp={ltp} />
        <OptionsChainWidget tradeSetup={tradeSetup} />
      </div>
    </div>
  );
};

export default Dashboard;
