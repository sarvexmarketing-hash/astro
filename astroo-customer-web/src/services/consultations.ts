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

  async end(
    id: string,
    durationSeconds?: number | { durationSeconds?: number; recordingUrl?: string; audioBase64?: string }
  ): Promise<{ data: Consultation; billing: any }> {
    const payload =
      typeof durationSeconds === 'object'
        ? { ...durationSeconds, idempotencyKey: `end_${id}_${Date.now()}` }
        : { durationSeconds, idempotencyKey: `end_${id}_${Date.now()}` };
    const res = await api.post(`/consultations/${id}/end`, payload);
    return res;
  },

  async saveRecording(
    id: string,
    data: { recordingUrl?: string; audioBase64?: string; durationSeconds?: number; callType?: string }
  ): Promise<any> {
    const res = await api.post(`/consultations/${id}/recording`, {
      consultationId: id,
      ...data,
    });
    return res.data;
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
    id?: string;
  }): Promise<ChatMessage> {
    const res = await api.post('/chat/send', data);
    return res.data || res.message;
  },
};
