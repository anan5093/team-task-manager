import { createContext, useContext, useMemo, useState } from 'react';

import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('ttm_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ttm_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (payload) => {
    localStorage.setItem('ttm_token', payload.token);
    localStorage.setItem('ttm_user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    persistSession(data);
  };

  const signup = async (form) => {
    const { data } = await api.post('/auth/signup', form);
    persistSession(data);
  };

  const logout = async () => {
    try {
      if (token) await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ttm_token');
      localStorage.removeItem('ttm_user');
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      login,
      signup,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
