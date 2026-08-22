import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nifty_pulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('[AuthContext] Token verification failed:', err.message);
          logout();
        }
      } else {
        // Fallback default demo user if unauthenticated
        setUser({
          name: 'Trader User',
          email: 'trader@niftytrade.ai',
          capital: 100000,
          riskPerTradePercent: 1.0
        });
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('nifty_pulse_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('nifty_pulse_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('nifty_pulse_token');
    setToken(null);
    setUser(null);
  };

  const updateSettings = (capital, riskPerTradePercent) => {
    setUser(prev => ({
      ...prev,
      capital: parseFloat(capital),
      riskPerTradePercent: parseFloat(riskPerTradePercent)
    }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};
