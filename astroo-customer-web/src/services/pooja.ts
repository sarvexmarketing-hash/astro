import { api } from '../lib/api-client';
import { PoojaService, PoojaBooking } from '../lib/types';

export const poojaService = {
  async listServices(): Promise<PoojaService[]> {
    const res = await api.get('/pooja/services');
    return res.data || [];
  },

  async getBySlug(slug: string): Promise<PoojaService> {
    const res = await api.get(`/pooja/services/${slug}`);
    return res.data;
  },

  async bookPooja(data: {
    poojaServiceId: string;
    bookingDate: string;
    bookingTime: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gotra?: string;
    nakshatra?: string;
    specialInstructions?: string;
  }): Promise<PoojaBooking> {
    const res = await api.post('/pooja/book', data);
    return res.data;
  },

  async bookService(data: {
    serviceId?: string;
    pooja_service_id?: string;
    bookingDate?: string;
    scheduled_date?: string;
    bookingTime?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gotra?: string;
    nakshatra?: string;
    specialInstructions?: string;
    devotee_names?: string[];
    sankalp?: string;
    [key: string]: any;
  }): Promise<PoojaBooking> {
    const res = await api.post('/pooja/book', {
      poojaServiceId: data.serviceId || data.pooja_service_id,
      bookingDate: data.bookingDate || data.scheduled_date,
      bookingTime: data.bookingTime || "09:00",
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      gotra: data.gotra,
      nakshatra: data.nakshatra,
      specialInstructions: data.specialInstructions || data.sankalp,
      ...data,
    });
    return res.data;
  },

  async getMyBookings(): Promise<PoojaBooking[]> {
    const res = await api.get('/pooja/my-bookings');
    return res.data || [];
  },
};
