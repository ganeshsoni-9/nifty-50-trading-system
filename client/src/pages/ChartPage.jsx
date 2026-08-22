import React, { useContext } from 'react';
import { MarketContext } from '../context/MarketContext';
import CandleChart from '../charts/CandleChart';
import { LineChart } from 'lucide-react';

const ChartPage = () => {
  const { snapshot, selectedTimeframe, changeTimeframe } = useContext(MarketContext);

  return (
    <div className="space-y-4 pb-12 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <LineChart className="w-6 h-6 text-emerald-400" />
          NIFTY 50 Fullscreen Interactive Chart
        </h1>
      </div>

      <div className="flex-1 w-full">
        <CandleChart
          timeframe={selectedTimeframe}
          tradeSetup={snapshot?.tradeSetup}
          onTimeframeChange={changeTimeframe}
        />
      </div>
    </div>
  );
};

export default ChartPage;
