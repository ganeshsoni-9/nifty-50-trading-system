import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import API from '../services/api';

const CandleChart = ({ timeframe = '15m', tradeSetup, onTimeframeChange }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const prevTimeframeRef = useRef(timeframe);
  const isDataLoadedRef = useRef(false);

  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to ensure timestamp is Unix seconds and candle object format is valid
  const formatCandles = (dataList) => {
    if (!Array.isArray(dataList)) return [];
    return dataList.map(c => {
      let rawTime = c.time || c.timestamp || Math.floor(Date.now() / 1000);
      if (typeof rawTime === 'string') {
        rawTime = new Date(rawTime).getTime() / 1000;
      }
      const timeInSeconds = rawTime > 20000000000 ? Math.floor(rawTime / 1000) : Math.floor(rawTime);

      return {
        time: timeInSeconds,
        open: parseFloat(c.open || c.close || 0),
        high: parseFloat(c.high || c.close || 0),
        low: parseFloat(c.low || c.close || 0),
        close: parseFloat(c.close || 0)
      };
    }).sort((a, b) => a.time - b.time);
  };

  // Fetch candle data on timeframe change
  useEffect(() => {
    let isMounted = true;
    const loadCandles = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/market/nifty/history?timeframe=${timeframe}`);
        if (res.data.success && isMounted) {
          const formatted = formatCandles(res.data.data);
          setCandles(formatted);
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

  // FIX: Initialize Lightweight Chart instance ONCE
  useEffect(() => {
    if (!chartContainerRef.current) return;

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
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1e293b' },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candleSeries;

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
  }, []);

  // FIX: Proper Initial setData() on Load + Incremental update() on Ticks + Viewport Preservation
  useEffect(() => {
    if (!candlestickSeriesRef.current || candles.length === 0) return;

    const series = candlestickSeriesRef.current;
    const chart = chartRef.current;
    const timeframeChanged = prevTimeframeRef.current !== timeframe;

    // ROOT CAUSE FIX: On initial load (!isDataLoadedRef.current) or timeframe change, ALWAYS call setData()
    if (!isDataLoadedRef.current || timeframeChanged) {
      prevTimeframeRef.current = timeframe;
      isDataLoadedRef.current = true;
      series.setData(candles);
      if (chart) {
        chart.timeScale().fitContent();
      }
    } else {
      // Subsequent live tick incremental update
      const timeScale = chart ? chart.timeScale() : null;
      const savedRange = timeScale ? timeScale.getVisibleLogicalRange() : null;
      const isScrolledLeft = savedRange && savedRange.to < (candles.length - 2);

      const latestCandle = candles[candles.length - 1];
      try {
        series.update(latestCandle);
      } catch (err) {
        // Fallback to setData if update fails
        series.setData(candles);
      }

      // Preserve viewport position if user has dragged/scrolled left inspecting past candles
      if (isScrolledLeft && timeScale && savedRange) {
        timeScale.setVisibleLogicalRange(savedRange);
      }
    }
  }, [candles, timeframe]);

  // Update Trade Plan Price Lines Overlay (SL, Entry, Targets) without touching candle data
  useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    const series = candlestickSeriesRef.current;

    // Clean up existing price lines
    priceLinesRef.current.forEach(line => {
      try { series.removePriceLine(line); } catch (e) {}
    });
    priceLinesRef.current = [];

    if (tradeSetup && tradeSetup.direction !== 'NO_TRADE' && tradeSetup.tradeLevels) {
      const { entryMid, stopLoss, target1, target2 } = tradeSetup.tradeLevels;

      const l1 = series.createPriceLine({
        price: entryMid,
        color: '#3b82f6',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `ENTRY (${entryMid})`,
      });

      const l2 = series.createPriceLine({
        price: stopLoss,
        color: '#ef4444',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `SL (${stopLoss})`,
      });

      const l3 = series.createPriceLine({
        price: target1,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: `T1 (${target1})`,
      });

      const l4 = series.createPriceLine({
        price: target2,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: `T2 (${target2})`,
      });

      priceLinesRef.current = [l1, l2, l3, l4];
    }
  }, [tradeSetup]);

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
        {loading && candles.length === 0 && (
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
