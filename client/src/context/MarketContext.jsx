import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API from '../services/api';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [snapshot, setSnapshot] = useState(null);
  const [liveQuote, setLiveQuote] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [wsConnected, setWsConnected] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    // Initial HTTP fetch
    const fetchInitialData = async () => {
      try {
        const [analysisRes, healthRes, alertsRes] = await Promise.all([
          API.get(`/analysis/nifty?timeframe=${selectedTimeframe}`),
          API.get('/health'),
          API.get('/alerts')
        ]);

        if (analysisRes.data.success) setSnapshot(analysisRes.data.data);
        if (healthRes.data.success) setSystemHealth(healthRes.data.data);
        if (alertsRes.data.success) setAlerts(alertsRes.data.data);
      } catch (err) {
        console.warn('[MarketContext] Initial API fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Socket.IO real-time connection
    const socketUrl = window.location.origin.includes('5173')
      ? 'http://localhost:5000'
      : window.location.origin;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    setSocketInstance(socket);

    socket.on('connect', () => {
      console.log('[MarketContext] Socket.IO Connected 🟢');
      setWsConnected(true);
    });

    socket.on('disconnect', () => {
      console.warn('[MarketContext] Socket.IO Disconnected 🔴');
      setWsConnected(false);
    });

    socket.on('market_tick', (quote) => {
      setLiveQuote(quote);
    });

    socket.on('analysis_update', (data) => {
      setSnapshot(data);
    });

    socket.on('new_alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Timeframe change handler
  const changeTimeframe = (tf) => {
    setSelectedTimeframe(tf);
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('request_analysis', { timeframe: tf });
    }
  };

  return (
    <MarketContext.Provider value={{
      snapshot,
      liveQuote,
      selectedTimeframe,
      changeTimeframe,
      wsConnected,
      systemHealth,
      alerts,
      loading
    }}>
      {children}
    </MarketContext.Provider>
  );
};
