import { api } from '../lib/api-client';
import { EarningsData, AstrologerProfile } from '../lib/types';

export const astrologerService = {
  async getEarnings(): Promise<EarningsData> {
    const res = await api.get('/astrologers/me/earnings');
    return res.data;
  },

  async updateStatus(data: {
    isOnline?: boolean;
    isBusy?: boolean;
    perMinuteRate?: number;
    hourlyRate?: number;
    languages?: string[];
    specializations?: string[];
    bio?: string;
  }): Promise<AstrologerProfile> {
    const res = await api.put('/astrologers/status', data);
    return res.data;
  },

  async updateProfile(data: {
    per_minute_rate?: number;
    hourly_rate?: number;
    specializations?: string[];
    languages?: string[];
    bio?: string;
    experience_years?: number;
    is_online?: boolean;
    is_busy?: boolean;
  }): Promise<AstrologerProfile> {
    const payload = {
      isOnline: data.is_online,
      isBusy: data.is_busy,
      perMinuteRate: data.per_minute_rate,
      hourlyRate: data.hourly_rate,
      languages: data.languages,
      specializations: data.specializations,
      bio: data.bio,
    };
    const res = await api.put('/astrologers/status', payload);
    return res.data;
  },

  async toggleOnline(isOnline: boolean): Promise<AstrologerProfile> {
    const res = await api.put('/astrologers/status', { isOnline });
    return res.data;
  },

  async getMyProfile(id?: string): Promise<AstrologerProfile> {
    if (id) {
      const res = await api.get(`/astrologers/${id}`);
      return res.data;
    }
    const res = await api.get('/auth/me');
    if (res.data?.astrologerProfile) {
      return {
        ...res.data.astrologerProfile,
        display_name: res.data.full_name || res.data.astrologerProfile.display_name,
        avatar_url: res.data.avatar_url,
      };
    }
    return res.data;
  },

  async uploadDocument(data: { documentType: string; documentUrl: string }) {
    const res = await api.post('/astrologers/documents', data);
    return res.data;
  },
};
