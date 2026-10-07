import { api } from '../lib/api-client';
import { PayoutAccount } from '../lib/types';

export const payoutsService = {
  async listAccounts(): Promise<PayoutAccount[]> {
    const res = await api.get('/payouts/accounts');
    return res.data || [];
  },

  async addAccount(data: {
    accountType: 'bank_account' | 'upi';
    accountHolderName: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  }): Promise<PayoutAccount> {
    const res = await api.post('/payouts/accounts', data);
    return res.data;
  },

  async requestPayout(data: { amount: number; accountId?: string }) {
    const res = await api.post('/payouts/request', data);
    return res.data;
  },
};
