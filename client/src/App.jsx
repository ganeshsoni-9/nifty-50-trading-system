import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import MarketPage from './pages/MarketPage';
import TradePlanPage from './pages/TradePlanPage';
import ChartPage from './pages/ChartPage';
import OptionsPage from './pages/OptionsPage';
import PaperTradingPage from './pages/PaperTradingPage';
import PerformancePage from './pages/PerformancePage';
import BacktestingPage from './pages/BacktestingPage';
import AlertsPage from './pages/AlertsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-[#0b0f19] flex flex-col">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto max-w-[1800px] mx-auto w-full">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <MarketProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Application Routes */}
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/market" element={<MainLayout><MarketPage /></MainLayout>} />
            <Route path="/trade-plan" element={<MainLayout><TradePlanPage /></MainLayout>} />
            <Route path="/chart" element={<MainLayout><ChartPage /></MainLayout>} />
            <Route path="/options" element={<MainLayout><OptionsPage /></MainLayout>} />
            <Route path="/paper-trading" element={<MainLayout><PaperTradingPage /></MainLayout>} />
            <Route path="/performance" element={<MainLayout><PerformancePage /></MainLayout>} />
            <Route path="/backtesting" element={<MainLayout><BacktestingPage /></MainLayout>} />
            <Route path="/alerts" element={<MainLayout><AlertsPage /></MainLayout>} />
            <Route path="/history" element={<MainLayout><HistoryPage /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </MarketProvider>
    </AuthProvider>
  );
}

export default App;
