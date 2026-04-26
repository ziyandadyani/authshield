import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { fullName: string; email: string; password: string; role?: 'user' | 'admin' };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authshield_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get<{ user: User }>('/api/user/profile');
        setUser(data.user);
      } catch {
        localStorage.removeItem('authshield_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const data = await api.post<{ token: string; user: User }>('/api/auth/login', payload);
    localStorage.setItem('authshield_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: RegisterPayload) => {
    await api.post('/api/auth/register', payload);
    await login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    localStorage.removeItem('authshield_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
