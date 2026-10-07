import { api } from '../lib/api-client';
import { Wallet, Transaction } from '../lib/types';

export const walletService = {
  async getWallet(): Promise<Wallet> {
    const res = await api.get('/wallet');
    return res.data;
  },

  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    const res = await api.get(`/wallet/transactions?limit=${limit}&offset=${offset}`);
    return res.data || [];
  },

  async createRechargeOrder(amount: number) {
    const res = await api.post('/payments/create-order', {
      amount,
      currency: 'INR',
      purpose: 'wallet_recharge',
      description: `Wallet recharge of ₹${amount}`,
      idempotencyKey: `rech_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });
    return res.data;
  },

  async verifyPayment(data: { orderId: string; paymentId: string; signature: string }) {
    const res = await api.post('/payments/verify', {
      ...data,
      idempotencyKey: `ver_${data.orderId}_${Date.now()}`,
    });
    return res;
  },
};
