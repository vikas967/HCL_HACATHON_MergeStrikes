import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shopsmart.user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shopsmart.token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me', { skipAuthRedirect: true })
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('shopsmart.user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('shopsmart.token');
        localStorage.removeItem('shopsmart.user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('shopsmart.token', res.data.token);
    localStorage.setItem('shopsmart.user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('shopsmart.token', res.data.token);
    localStorage.setItem('shopsmart.user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('shopsmart.token');
    localStorage.removeItem('shopsmart.user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
