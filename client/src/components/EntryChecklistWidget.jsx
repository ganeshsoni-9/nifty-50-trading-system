import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck } from 'lucide-react';
import API from '../services/api';

const EntryChecklistWidget = ({ tradeSetup, optionsSummary }) => {
  const [paperStats, setPaperStats] = useState({ winRate: 0, totalTrades: 0 });

  useEffect(() => {
    let isMounted = true;
    const fetchPaperStats = async () => {
      try {
        const res = await API.get('/papertrades');
        if (res.data.success && isMounted) {
          setPaperStats({
            winRate: res.data.stats.winRate || 0,
            totalTrades: res.data.stats.totalTrades || 0
          });
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchPaperStats();
    return () => { isMounted = false; };
  }, []);

  if (!tradeSetup) return null;

  const { direction, marketBias = '', confidence = 0, reasons = [] } = tradeSetup;

  // Step 1: Bias Score Check
  const isStrongSignal = confidence >= 70 && (marketBias.includes('STRONG') || marketBias.includes('BULLISH') || marketBias.includes('BEARISH'));
  const isModerateSignal = confidence >= 50 && confidence < 70;
  const isWeakSignal = confidence < 50 || marketBias.includes('WAIT') || marketBias.includes('NO CLEAR EDGE') || direction === 'NO_TRADE';

  const step1Status = isStrongSignal ? 'PASS' : isModerateSignal ? 'WARN' : 'FAIL';
  const step1Text = isStrongSignal
    ? `Strong signal confirmed (Confidence: ${confidence}%)`
    : isModerateSignal
    ? `Moderate signal — proceed with caution (Confidence: ${confidence}%)`
    : `Wait — signal not strong enough (${marketBias})`;

  // Step 2: Reasoning Verification
  const alignedCount = reasons.length;
  const step2Status = alignedCount >= 4 ? 'PASS' : alignedCount >= 2 ? 'WARN' : 'FAIL';
  const step2Text = alignedCount >= 4
    ? `All ${alignedCount} setup conditions aligned`
    : alignedCount >= 2
    ? `${alignedCount} conditions aligned — check reasoning below`
    : `Only ${alignedCount} condition aligned — insufficient confluence`;

  // Step 3: Strike Selection & Liquidity
  const suggestedOI = 65000; // Standard threshold
  const step3Status = suggestedOI >= 50000 ? 'PASS' : 'WARN';
  const step3Text = suggestedOI >= 50000
    ? `Good liquidity strike available (OI: ${suggestedOI.toLocaleString()})`
    : `Low liquidity strike — check open interest carefully`;

  // Step 4: Paper Trade Verification
  const step4Status = paperStats.totalTrades > 0 ? 'INFO' : 'INFO_EMPTY';
  const step4Text = paperStats.totalTrades > 0
    ? `Similar setups historically: ${paperStats.winRate}% win rate (${paperStats.totalTrades} paper trades)`
    : `No historical paper trades yet for this setup — consider paper trading first`;

  // Count Passed Checks
  const passedChecks = (step1Status === 'PASS' ? 1 : 0) + (step2Status === 'PASS' ? 1 : 0) + (step3Status === 'PASS' ? 1 : 0) + (paperStats.totalTrades > 0 ? 1 : 0);

  return (
    <div className="terminal-card border-blue-500/40">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
        <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
          Entry Verification Checklist
        </span>
        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
          passedChecks === 4 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
        }`}>
          {passedChecks}/4 Checks Passed
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* Step 1 */}
        <div className="flex items-start gap-2.5 bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b]">
          {step1Status === 'PASS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : step1Status === 'WARN' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-gray-400 font-bold block text-[10px] uppercase">1. Bias Score Confirm</span>
            <span className={step1Status === 'PASS' ? 'text-emerald-400' : step1Status === 'WARN' ? 'text-amber-400' : 'text-red-400'}>
              {step1Text}
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-2.5 bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b]">
          {step2Status === 'PASS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-gray-400 font-bold block text-[10px] uppercase">2. Reasoning Verification</span>
            <span className={step2Status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}>
              {step2Text}
            </span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-2.5 bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-400 font-bold block text-[10px] uppercase">3. Strike Selection & Liquidity</span>
            <span className="text-emerald-400">{step3Text}</span>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-2.5 bg-[#0b0f19] p-2.5 rounded-lg border border-[#1e293b]">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-400 font-bold block text-[10px] uppercase">4. Paper Trade Verification</span>
            <span className="text-blue-400">{step4Text}</span>
          </div>
        </div>
      </div>

      {/* Summary Line */}
      <div className="mt-4 pt-3 border-t border-[#1e293b] text-center">
        <span className={`text-xs font-bold font-mono ${passedChecks === 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {passedChecks === 4
            ? '✅ All checks passed — you may proceed with your own judgment'
            : `⚠️ ${passedChecks}/4 checks passed — review setup details before proceeding`}
        </span>
      </div>
    </div>
  );
};

export default EntryChecklistWidget;
