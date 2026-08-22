import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import OptionsChainWidget from '../components/OptionsChainWidget';
import TradeRecommendationCard from '../components/TradeRecommendationCard';
import { Layers } from 'lucide-react';

const OptionsPage = () => {
  const { snapshot } = useContext(MarketContext);
  const tradeSetup = snapshot?.tradeSetup;
  const ltp = snapshot?.ltp || 24850;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-emerald-400" />
          NIFTY Options & Open Interest Module
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          ATM Strike locator, Call/Put Open Interest, Put-Call Ratio (PCR) and Max Pain sentiment
        </p>
      </div>

      {/* FIX 1 — Trade Recommendation Card */}
      <TradeRecommendationCard tradeSetup={tradeSetup} ltp={ltp} />

      {/* Option Chain Table with Moneyness Badges */}
      <OptionsChainWidget tradeSetup={tradeSetup} />
    </div>
  );
};

export default OptionsPage;
