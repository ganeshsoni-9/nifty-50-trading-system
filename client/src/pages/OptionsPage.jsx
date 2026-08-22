import React from 'react';
import OptionsChainWidget from '../components/OptionsChainWidget';
import { Layers } from 'lucide-react';

const OptionsPage = () => {
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

      <OptionsChainWidget />
    </div>
  );
};

export default OptionsPage;
