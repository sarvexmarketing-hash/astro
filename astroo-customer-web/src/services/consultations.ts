import { api } from '../lib/api-client';
import { Consultation, ChatMessage } from '../lib/types';

export const consultationsService = {
  async create(data: { astrologerId: string; type: 'chat' | 'call' | 'video' }): Promise<Consultation> {
    const res = await api.post('/consultations', data);
    return res.data;
  },

  async request(data: { astrologer_id?: string; astrologerId?: string; type: 'chat' | 'call' | 'video' }): Promise<Consultation> {
    const payload = {
      astrologerId: data.astrologerId || data.astrologer_id,
      type: data.type,
    };
    const res = await api.post('/consultations', payload);
    return res.data;
  },

  async accept(id: string): Promise<Consultation> {
    const res = await api.post(`/consultations/${id}/accept`);
    return res.data;
  },

  async end(id: string, durationSeconds?: number): Promise<{ data: Consultation; billing: any }> {
    const res = await api.post(`/consultations/${id}/end`, {
      durationSeconds,
      idempotencyKey: `end_${id}_${Date.now()}`,
    });
    return res;
  },

  async getById(id: string): Promise<Consultation> {
    const res = await api.get(`/consultations/${id}`);
    return res.data;
  },

  async getHistory(): Promise<Consultation[]> {
    const res = await api.get('/consultations/history');
    return res.data || [];
  },

  async getMessages(consultationId: string, limit = 100): Promise<ChatMessage[]> {
    const res = await api.get(`/chat/messages/${consultationId}?limit=${limit}`);
    return res.data || [];
  },

  async sendMessage(data: {
    consultationId: string;
    recipientId?: string;
    content: string;
    messageType?: string;
  }): Promise<ChatMessage> {
    const res = await api.post('/chat/send', data);
    return res.data || res.message;
  },
};
