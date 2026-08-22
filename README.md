# 🚀 NiftyTrade AI / NiftyPulse — NIFTY 50 Live Trade Planner

Production-ready MERN Stack web application for live NIFTY 50 market data analysis, technical analysis indicator matrix, market structure evaluation, transparent Bullish/Bearish scoring bias, rule-based trade plan generation, paper trading execution, and look-ahead bias-free strategy backtesting.

---

## 📌 Features Overview

- **Real-Time Market Data Stream**: Integrates official **Angel One SmartAPI** WebSocket feed with an automatic **DEMO MODE (Mock Market Provider)** fallback so the application runs seamlessly offline, during market-closed hours, or without credentials.
- **Provider-Independent Architecture**: Pluggable provider abstraction layer (`angelOneProvider.js`, `upstoxProvider.js`, `mockProvider.js`).
- **Multi-Timeframe Engine**: Analyzes 1m, 5m, 15m, 30m, 1h, 1d timeframes with primary decision frame **5M + 15M + 1H**.
- **Technical Indicators Matrix**:
  - EMAs (9, 20, 50, 200)
  - RSI 14
  - MACD (12, 26, 9)
  - Stochastic Oscillator (14, 3, 3)
  - ATR 14 (Volatility)
  - Bollinger Bands (20, 2)
  - Volume Moving Average & Volume Spikes
  - VWAP (Volume Weighted Average Price)
  - Pivots, CPR (Central Pivot Range), and Fibonacci Retracements
- **Market Structure Engine**: Detects Higher Highs/Lows, Lower Highs/Lows, Break of Structure (BOS), Change of Character (CHoCH), and Retests.
- **Transparent Bias Scoring (0–100)**: Bullish vs Bearish score breakdown resulting in `STRONG BULLISH`, `BULLISH`, `BEARISH`, `STRONG BEARISH`, or `NO CLEAR EDGE`.
- **Rule-Based Trade Planner**: Generates Entry Range, Stop Loss, Targets 1/2/3, R:R ratio, Setup Confidence %, dynamic position size calculator based on risk capital & contract lot size, and invalidation rules.
- **Mandatory NO-TRADE System**: Issues `NO TRADE / WAIT` signal with human-readable rationale when edge is lacking or choppy.
- **Paper Trading Execution Terminal**: Simulated trading with PnL tracking and Win Rate analytics.
- **Strategy Backtesting Lab**: Bar-by-bar historical backtesting without look-ahead bias and equity growth visualization.
- **NIFTY Option Chain**: ATM Strike, Call/Put Open Interest, Put-Call Ratio (PCR), and Max Pain sentiment.

---

## 🛠 Tech Stack

### Frontend (`client/`)
- React + Vite
- JavaScript
- Tailwind CSS v3
- Lightweight Charts & Recharts
- Lucide React Icons
- Socket.IO Client
- Axios

### Backend (`server/`)
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.IO
- `technicalindicators`
- `otplib` (Angel One SmartAPI TOTP)
- JWT Auth & Bcryptjs

---

## ⚡ Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` in `server/` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nifty_trade_planner
JWT_SECRET=nifty_pulse_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173

# Angel One SmartAPI Credentials (Optional - App defaults to DEMO MODE if empty)
ANGEL_API_KEY=
ANGEL_CLIENT_ID=
ANGEL_PASSWORD=
ANGEL_TOTP_SECRET=
```

### 3. Run Development Server
```bash
npm run dev
```

The application will start concurrently:
- **Backend Server & WebSocket Stream**: `http://localhost:5000`
- **React Trading Terminal UI**: `http://localhost:5173`

---

## ⚠️ Risk & Decision Support Disclaimer
This application is built solely as a technical-analysis decision-support tool. It does not provide financial advice or guarantee future profits.
