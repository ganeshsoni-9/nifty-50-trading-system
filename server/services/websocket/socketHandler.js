const { Server } = require('socket.io');
const marketDataService = require('../marketData/marketDataService');
const AnalysisEngine = require('../analysis/analysisEngine');

class SocketHandler {
  constructor() {
    this.io = null;
    this.connectedClients = 0;
    this.streamInterval = null;
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      this.connectedClients++;
      console.log(`[Socket.IO] Client connected (${socket.id}). Total clients: ${this.connectedClients}`);

      // Immediately send current analysis snapshot
      this.sendSnapshot(socket);

      socket.on('request_analysis', async (data) => {
        const tf = data && data.timeframe ? data.timeframe : '15m';
        try {
          const snapshot = await AnalysisEngine.runFullAnalysis(tf);
          socket.emit('analysis_update', snapshot);
        } catch (err) {
          socket.emit('error_update', { message: err.message });
        }
      });

      socket.on('disconnect', () => {
        this.connectedClients = Math.max(0, this.connectedClients - 1);
        console.log(`[Socket.IO] Client disconnected. Total clients: ${this.connectedClients}`);
      });
    });

    this.startStreaming();
  }

  startStreaming() {
    if (this.streamInterval) clearInterval(this.streamInterval);

    // Stream tick and analysis updates every 2 seconds
    this.streamInterval = setInterval(async () => {
      if (this.io) {
        try {
          const quote = await marketDataService.getQuote('NIFTY 50');
          this.io.emit('market_tick', quote);

          // Full analysis update
          const snapshot = await AnalysisEngine.runFullAnalysis('15m');
          this.io.emit('analysis_update', snapshot);

          // Broadcast WS status
          this.io.emit('system_status', {
            wsConnected: true,
            connectedClients: this.connectedClients,
            provider: quote.provider,
            mode: quote.mode,
            lastTickTime: quote.timestamp
          });
        } catch (err) {
          console.error('[SocketHandler Stream Error]', err.message);
        }
      }
    }, 2000);
  }

  async sendSnapshot(socket) {
    try {
      const snapshot = await AnalysisEngine.runFullAnalysis('15m');
      socket.emit('analysis_update', snapshot);
    } catch (err) {
      socket.emit('error_update', { message: err.message });
    }
  }

  emitAlert(alertData) {
    if (this.io) {
      this.io.emit('new_alert', alertData);
    }
  }
}

module.exports = new SocketHandler();
