export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'astrologer' | 'admin' | 'super_admin';
  fullName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface AstrologerProfile {
  id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  experience_years: number;
  hourly_rate: number;
  per_minute_rate: number;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_online: boolean;
  is_busy: boolean;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  languages: string[];
  specializations: string[];
}

export interface Consultation {
  id: string;
  user_id: string;
  astrologer_id: string;
  type: 'chat' | 'call' | 'video';
  state: 'REQUESTED' | 'ACCEPTED' | 'ACTIVE' | 'IN_PROGRESS' | 'ENDED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  rate_per_minute: number;
  start_time?: string | null;
  end_time?: string | null;
  total_amount?: number;
  customer_name?: string;
  customer_avatar?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  _id?: string;
  consultationId: string;
  senderId: string;
  senderRole?: string;
  recipientId?: string;
  content?: string;
  text?: string;
  messageType?: string;
  type?: string;
  mediaUrl?: string;
  status?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface EarningsData {
  earnings: {
    total_earned: number;
    available_balance: number;
    withdrawn_amount: number;
    pending_payout_amount: number;
  };
  commissions: Array<{
    id: string;
    gross_amount: number;
    commission_rate: number;
    platform_fee: number;
    net_payout: number;
    created_at: string;
  }>;
  payoutRequests: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    created_at: string;
  }>;
}

export interface PayoutAccount {
  id: string;
  user_id: string;
  account_type: 'bank_account' | 'upi';
  account_holder_name: string;
  account_number_masked?: string;
  ifsc_code?: string;
  upi_id?: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}
