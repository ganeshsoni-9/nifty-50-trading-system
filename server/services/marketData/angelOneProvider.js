const axios = require('axios');
const { authenticator } = require('otplib');

class AngelOneProvider {
  constructor() {
    this.apiKey = process.env.ANGEL_API_KEY;
    this.clientId = process.env.ANGEL_CLIENT_ID;
    this.password = process.env.ANGEL_PASSWORD;
    this.totpSecret = process.env.ANGEL_TOTP_SECRET;
    this.jwtToken = null;
    this.refreshToken = null;
    this.feedToken = null;
    this.baseUrl = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking';
  }

  isConfigured() {
    return !!(this.apiKey && this.clientId && this.password && this.totpSecret);
  }

  async authenticate() {
    if (!this.isConfigured()) {
      throw new Error('Angel One SmartAPI credentials not fully configured in environment.');
    }

    try {
      const totp = authenticator.generate(this.totpSecret);
      const response = await axios.post(
        `${this.baseUrl}/user/v1/loginByPassword`,
        {
          clientcode: this.clientId,
          password: this.password,
          totp: totp
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '127.0.0.1',
            'X-ClientPublicIP': '127.0.0.1',
            'X-MACAddress': 'fe80::1',
            'X-PrivateKey': this.apiKey
          }
        }
      );

      if (response.data && response.data.status) {
        this.jwtToken = response.data.data.jwtToken;
        this.refreshToken = response.data.data.refreshToken;
        this.feedToken = response.data.data.feedToken;
        console.log('[AngelOneProvider] Authentication successful.');
        return true;
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('[AngelOneProvider Error]', err.message);
      throw err;
    }
  }

  async getQuote(symbol = 'NIFTY') {
    if (!this.jwtToken) {
      await this.authenticate();
    }
    // Search & fetch quote via SmartAPI API
    try {
      const response = await axios.post(
        `${this.baseUrl}/market/v1/quote/`,
        {
          mode: 'FULL',
          exchangeTokens: {
            NSE: ['99926000'] // NIFTY 50 Token
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`,
            'Content-Type': 'application/json',
            'X-PrivateKey': this.apiKey
          }
        }
      );

      if (response.data && response.data.data) {
        const fetched = response.data.data.fetched[0];
        return {
          symbol: 'NIFTY 50',
          ltp: parseFloat(fetched.ltp),
          open: parseFloat(fetched.open),
          high: parseFloat(fetched.high),
          low: parseFloat(fetched.low),
          close: parseFloat(fetched.close),
          previousClose: parseFloat(fetched.close),
          change: parseFloat(fetched.ltp - fetched.close),
          changePercent: parseFloat(((fetched.ltp - fetched.close) / fetched.close) * 100),
          volume: parseInt(fetched.tradeVolume || 0),
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('[AngelOneProvider Quote Error]', error.message);
      throw error;
    }
  }

  async getHistoricalData(symbol = 'NIFTY 50', timeframe = '15m', fromDate, toDate) {
    if (!this.jwtToken) {
      await this.authenticate();
    }
    // Map timeframes to SmartAPI interval string
    const intervalMap = {
      '1m': 'ONE_MINUTE',
      '5m': 'FIVE_MINUTE',
      '15m': 'FIFTEEN_MINUTE',
      '30m': 'THIRTY_MINUTE',
      '1h': 'ONE_HOUR',
      '1d': 'ONE_DAY'
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/historical/v1/getCandleData`,
        {
          exchange: 'NSE',
          symboltoken: '99926000',
          interval: intervalMap[timeframe] || 'FIFTEEN_MINUTE',
          fromdate: fromDate || '2026-08-20 09:15',
          todate: toDate || '2026-08-22 15:30'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`,
            'Content-Type': 'application/json',
            'X-PrivateKey': this.apiKey
          }
        }
      );

      if (response.data && response.data.data) {
        return response.data.data.map(item => ({
          time: new Date(item[0]).getTime() / 1000,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5])
        }));
      }
      return [];
    } catch (err) {
      console.error('[AngelOneProvider History Error]', err.message);
      throw err;
    }
  }
}

module.exports = AngelOneProvider;
