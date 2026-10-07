import { api } from '../lib/api-client';
import { Consultation, ChatMessage } from '../lib/types';

export const consultationsService = {
  async listRequests(): Promise<Consultation[]> {
    try {
      const res = await api.get('/consultations/history?state=REQUESTED');
      return res.data || [];
    } catch {
      return [];
    }
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
