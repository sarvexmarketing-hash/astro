import { api } from '../lib/api-client';
import { Astrologer } from '../lib/types';

export const astrologersService = {
  async list(params?: {
    search?: string;
    specialization?: string;
    language?: string;
    isOnline?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Astrologer[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.specialization) searchParams.set('specialization', params.specialization);
      if (params?.language) searchParams.set('language', params.language);
      if (params?.isOnline) searchParams.set('isOnline', 'true');
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));

      const qs = searchParams.toString();
      const res = await api.get(`/astrologers${qs ? `?${qs}` : ''}`);
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch astrologers:', err);
      return [];
    }
  },

  async getById(id: string): Promise<Astrologer> {
    const res = await api.get(`/astrologers/${id}`);
    return res.data;
  },
};
