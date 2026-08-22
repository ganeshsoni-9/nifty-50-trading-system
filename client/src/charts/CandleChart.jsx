import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import API from '../services/api';

const CandleChart = ({ timeframe = '15m', tradeSetup, onTimeframeChange }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const vwapSeriesRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch candle data on timeframe change
  useEffect(() => {
    let isMounted = true;
    const loadCandles = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/market/nifty/history?timeframe=${timeframe}`);
        if (res.data.success && isMounted) {
          setCandles(res.data.data);
        }
      } catch (err) {
        console.error('[CandleChart Fetch Error]', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCandles();
    return () => { isMounted = false; };
  }, [timeframe]);

  // Render lightweight-chart
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0f19' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlesticks Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candleSeries;
    candleSeries.setData(candles);

    // Add Trade Plan Price Line Overlays (SL, Entry, Targets)
    if (tradeSetup && tradeSetup.direction !== 'NO_TRADE' && tradeSetup.tradeLevels) {
      const { entryMid, stopLoss, target1, target2, target3 } = tradeSetup.tradeLevels;

      candleSeries.createPriceLine({
        price: entryMid,
        color: '#3b82f6',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `ENTRY (${entryMid})`,
      });

      candleSeries.createPriceLine({
        price: stopLoss,
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `SL (${stopLoss})`,
      });

      candleSeries.createPriceLine({
        price: target1,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: `T1 (${target1})`,
      });

      candleSeries.createPriceLine({
        price: target2,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `T2 (${target2})`,
      });
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, tradeSetup]);

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '1d'];

  return (
    <div className="terminal-card relative flex flex-col h-full">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-200 tracking-wide text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            NIFTY 50 Candlestick Chart
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {timeframe.toUpperCase()} Timeframe
          </span>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center bg-[#0b0f19] p-1 rounded-lg border border-[#1e293b]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange && onTimeframeChange(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e293b]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative flex-1 min-h-[420px] w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b0f19]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400 font-mono">Loading OHLC Candles...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default CandleChart;
