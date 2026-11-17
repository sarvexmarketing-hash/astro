import { api, setToken, clearToken } from '../lib/api-client';
import { User } from '../lib/types';

export const authService = {
  async register(data: { email?: string; phone?: string; password: string; fullName: string; avatarUrl?: string }) {
    const res = await api.post('/auth/register', { ...data, role: 'astrologer' });
    if (res.data?.accessToken) {
      setToken(res.data.accessToken);
    }
    return res.data;
  },

  async login(data: { email?: string; phone?: string; password: string }) {
    const res = await api.post('/auth/login', data);
    if (res.data?.accessToken) {
      setToken(res.data.accessToken);
    }
    return res.data;
  },

  async me(): Promise<User | null> {
    try {
      const res = await api.get('/auth/me');
      const u = res.data;
      if (!u) return null;
      return {
        ...u,
        fullName: u.fullName || u.full_name || '',
        avatarUrl: u.avatarUrl || u.avatar_url || '',
      };
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      clearToken();
    }
  },
};
