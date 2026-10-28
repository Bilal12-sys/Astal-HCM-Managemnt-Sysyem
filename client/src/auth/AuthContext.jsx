import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../api/authApi.js';

const AuthContext = createContext(null);

// This component shares the signed-in user with all protected pages.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('astral-token')));

  useEffect(() => {
    if (!localStorage.getItem('astral-token')) return;
    getCurrentUser().then((response) => setUser(response.data.user)).catch(() => localStorage.removeItem('astral-token')).finally(() => setLoading(false));
  }, []);

  return <AuthContext.Provider value={{ user, loading, signIn: (data) => { localStorage.setItem('astral-token', data.token); setUser(data.user); }, signOut: () => { localStorage.removeItem('astral-token'); setUser(null); } }}>{children}</AuthContext.Provider>;
}

// This hook reads the current authentication state.
export function useAuth() { return useContext(AuthContext); }
