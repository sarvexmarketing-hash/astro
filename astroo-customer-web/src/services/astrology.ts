import { api } from '../lib/api-client';

export const astrologyService = {
  async generateKundli(data: {
    name: string;
    gender: 'male' | 'female' | 'other';
    birth_date: string;
    birth_time: string;
    birth_place: string;
    latitude: number;
    longitude: number;
    timezone?: string;
    ayanamsha?: string;
  }) {
    const res = await api.post('/astrology/kundli/generate', data);
    return res.data;
  },

  async interpretChart(data: any) {
    const res = await api.post('/astrology/interpret', data);
    return res.data;
  },

  async calculateMuhurat(data: { date: string; latitude?: number; longitude?: number }) {
    const res = await api.post('/astrology/muhurat/calculate', data);
    return res.data;
  },

  async getDailyHoroscope(sign: string) {
    // Returns daily astrological forecast for given zodiac sign
    const signDescriptions: Record<string, string> = {
      aries: "Dynamic day ahead! Mars enhances your courage, enabling breakthrough decisions in career and personal goals.",
      taurus: "Financial stability and warmth at home. Venus fosters harmonious conversations and creative problem-solving.",
      gemini: "High mental agility today. Communication channels open up opportunities for collaborative projects.",
      cancer: "Emotional intuition is at its peak. Deepen bonds with loved ones and focus on peaceful domestic reflection.",
      leo: "Solar radiance brings leadership recognition. Trust your instincts when presenting ideas or managing responsibilities.",
      virgo: "Meticulous organization pays dividends. Health and wellness efforts initiated today will yield long-term gains.",
      libra: "Balance returns to interpersonal dynamics. A favorable time for signing contracts or making mutual agreements.",
      scorpio: "Transformative planetary transits highlight spiritual focus and insight. Meditation brings tremendous peace.",
      sagittarius: "Optimism and expansive thinking define your day. Learning, higher studies, or spiritual discussions inspire you.",
      capricorn: "Disciplined effort brings material clarity. Professional achievements align with your long-term roadmap.",
      aquarius: "Inventive ideas and visionary thinking. Connect with community or friends for impactful brainstorming.",
      pisces: "Spiritual resonance and compassionate connections. Trust your inner guidance for meaningful progress.",
    };

    return {
      sign,
      prediction:
        signDescriptions[sign.toLowerCase()] ||
        "Planetary positions align favorably today. Chant the Gayatri Mantra for clarity and harmony.",
      lucky_number: ((sign.length * 3) % 9) + 1,
      lucky_color: ["Yellow", "Gold", "Saffron", "Emerald Green", "Royal White"][sign.length % 5],
    };
  },

  async getSavedKundlis() {
    const res = await api.get('/users/kundlis');
    return res.data || [];
  },

  async saveKundli(data: any) {
    const res = await api.post('/users/kundlis', data);
    return res.data;
  },
};
