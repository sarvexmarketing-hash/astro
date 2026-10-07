import { api } from '../lib/api-client';
import { AppNotification } from '../lib/types';

export const usersService = {
  async updateProfile(data: { fullName?: string; avatarUrl?: string }) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  async getNotifications(limit = 20, offset = 0): Promise<AppNotification[]> {
    const res = await api.get(`/users/notifications?limit=${limit}&offset=${offset}`);
    return res.data || [];
  },

  async markNotificationRead(id: string) {
    const res = await api.put(`/users/notifications/${id}/read`);
    return res;
  },

  async markAllNotificationsRead() {
    const res = await api.put('/users/notifications/read-all');
    return res;
  },
};
