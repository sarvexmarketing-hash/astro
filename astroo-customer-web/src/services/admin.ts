import { api } from '../lib/api-client';

export interface AdminStats {
  totalUsers: number;
  totalAstrologers: number;
  activeConsultations: number;
  totalRevenue: number;
  platformEarnings?: number;
  recentUsers: Array<{
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    created_at: string;
    full_name: string | null;
    avatar_url: string | null;
  }>;
  recentConsultations: Array<{
    id: string;
    user_id: string;
    astrologer_id: string;
    type: string;
    state: string;
    rate_per_minute: number;
    total_duration_seconds: number;
    total_amount: number;
    astrologer_earnings: number;
    platform_fee: number;
    created_at: string;
    customer_name?: string;
    astrologer_name?: string;
  }>;
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  full_name?: string;
}

export interface AdminAstrologer {
  id: string;
  user_id: string;
  display_name: string;
  experience_years: number;
  per_minute_rate: number;
  is_verified: boolean;
  verification_status: string;
  is_online: boolean;
  is_busy: boolean;
  rating: number;
  total_consultations: number;
  languages?: string[];
  specializations?: string[];
  email?: string;
  phone?: string;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async listUsers(page = 1, limit = 20): Promise<{ users: AdminUser[]; total: number }> {
    const res = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return res.data || { users: [], total: 0 };
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'deleted') {
    const res = await api.put(`/admin/users/${id}`, { status });
    return res;
  },

  async listAstrologers(page = 1, limit = 20): Promise<{ astrologers: AdminAstrologer[]; total: number }> {
    const res = await api.get(`/admin/astrologers?page=${page}&limit=${limit}`);
    return res.data || { astrologers: [], total: 0 };
  },

  async verifyAstrologer(id: string, isVerified: boolean, verificationStatus: 'approved' | 'rejected' | 'pending') {
    const res = await api.put(`/admin/astrologers/${id}/verify`, {
      isVerified,
      verificationStatus,
    });
    return res;
  },

  async listAuditLogs(page = 1, limit = 20) {
    const res = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return res.data || [];
  },

  async broadcastNotification(title: string, message: string, targetRole: string = 'all') {
    const res = await api.post('/admin/notifications/broadcast', {
      title,
      message,
      targetRole,
    });
    return res;
  },
};
