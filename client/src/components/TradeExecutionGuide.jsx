import React from 'react';
import { Target, TrendingUp, ShieldAlert, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TradeExecutionGuide = ({ tradeSetup, ltp = 24850 }) => {
  if (!tradeSetup) return null;

  const { direction = 'NO_TRADE', marketBias = '', confidence = 0, tradeLevels } = tradeSetup;
  const isLong = direction === 'LONG';
  const isShort = direction === 'SHORT';
  const isNoTrade = direction === 'NO_TRADE' || marketBias.includes('WAIT') || marketBias.includes('NO CLEAR EDGE');

  const atmStrike = Math.round(ltp / 50) * 50;
  const strikeTitle = `NIFTY ${atmStrike} ${isLong ? 'CE' : isShort ? 'PE' : 'Option'}`;

  // Index Point Deltas
  const entryMin = tradeLevels ? tradeLevels.entryMin : Math.round(ltp - 10);
  const entryMax = tradeLevels ? tradeLevels.entryMax : Math.round(ltp + 10);
  const stopLoss = tradeLevels ? tradeLevels.stopLoss : Math.round(ltp - 30);
  const t1 = tradeLevels ? tradeLevels.target1 : Math.round(ltp + 50);
  const t2 = tradeLevels ? tradeLevels.target2 : Math.round(ltp + 90);
  const t3 = tradeLevels ? tradeLevels.target3 : Math.round(ltp + 140);

  // Delta ~0.50 Premium Calculations
  const delta = 0.50;
  const optionLtp = 120.0;
  const optionSL = Math.max(5, Math.round((optionLtp - (Math.abs(ltp - stopLoss) * delta)) * 10) / 10);
  const optionT1 = Math.round((optionLtp + (Math.abs(t1 - ltp) * delta)) * 10) / 10;
  const optionT2 = Math.round((optionLtp + (Math.abs(t2 - ltp) * delta)) * 10) / 10;
  const optionT3 = Math.round((optionLtp + (Math.abs(t3 - ltp) * delta)) * 10) / 10;

  const suggestedLots = 2;
  const quantity = suggestedLots * 25; // NIFTY Lot size = 25

  if (isNoTrade) {
    return (
      <div className="bg-[#0b0f19] p-4 rounded-xl border border-amber-500/30 text-amber-300 font-mono text-xs text-center">
        <ShieldAlert className="w-5 h-5 mx-auto mb-2 text-amber-400" />
        <strong className="block text-sm uppercase font-bold">No Trade Execution Guide Active</strong>
        <span>Market is currently in {marketBias} state. Wait for clear 5M + 15M + 1H timeframe alignment.</span>
      </div>
    );
  }

  const steps = [
    {
      step: 1,
      title: '1. ENTRY CONDITION',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800',
      description: `BUY ${strikeTitle} when NIFTY Index enters zone ₹${entryMin} - ₹${entryMax} AND option premium is in ₹${Math.round(optionLtp - 4)} - ₹${Math.round(optionLtp + 4)} range. Use LIMIT order within ±2% of LTP to avoid bad fills.`
    },
    {
      step: 2,
      title: '2. POSITION SIZING & RISK',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40 border-blue-800',
      description: `Execute ${suggestedLots} Lots (${quantity} Qty). Maximum risk capped at ₹1,000 (1-2% of trading capital) on this trade.`
    },
    {
      step: 3,
      title: '3. HARD STOP LOSS RULE',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-950/40 border-red-800',
      description: `Exit immediately if option premium drops to ₹${optionSL} (approx.) (equivalent to NIFTY Index SL ₹${stopLoss}). Do not hold on hope — SL is a mandatory hard rule.`
    },
    {
      step: 4,
      title: '4. TARGET SCALING & PARTIAL EXIT',
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-800',
      description: `Target 1 (₹${optionT1} premium): Book 33% quantity. Target 2 (₹${optionT2} premium): Book next 33%. Target 3 (₹${optionT3} premium): Trail remaining 34% behind VWAP.`
    },
    {
      step: 5,
      title: '5. TIME-BASED EXIT DEADLINE',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800',
      description: `If neither target nor SL is hit by 3:15 PM IST, review position. Intraday options face rapid theta time-decay before market close.`
    }
  ];

  return (
    <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e293b] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Trade Execution Guide — Step-by-Step Instructions
        </span>
        <span className="text-[10px] font-mono text-gray-500">Live Dynamic Rules</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className={`p-3 rounded-xl border ${item.bgColor} flex items-start gap-3`}>
              <div className={`p-2 rounded-lg bg-[#0b0f19] border border-[#1e293b] ${item.color} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className={`font-bold block text-[11px] uppercase ${item.color}`}>{item.title}</span>
                <p className="text-gray-300 leading-relaxed text-[11px]">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeExecutionGuide;
