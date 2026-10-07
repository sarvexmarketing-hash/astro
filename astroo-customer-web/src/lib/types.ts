export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'astrologer' | 'admin' | 'super_admin';
  fullName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface Astrologer {
  id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  experience_years: number;
  hourly_rate: number;
  per_minute_rate: number;
  is_verified: boolean;
  is_online: boolean;
  is_busy: boolean;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  languages: string[];
  specializations: string[];
  reviews?: Review[];
  availability?: Availability[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_avatar?: string | null;
}

export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
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
  astrologer_name?: string;
  astrologer_avatar?: string;
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

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'credit' | 'debit';
  purpose: string;
  reference_id?: string;
  balance_after: number;
  created_at: string;
}

export interface PoojaService {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url?: string;
  benefits?: string[];
  is_active: boolean;
}

export interface PoojaBooking {
  id: string;
  user_id: string;
  pooja_service_id: string;
  service_name?: string;
  service_image?: string;
  pandit_name?: string;
  booking_date: string;
  booking_time: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gotra?: string;
  nakshatra?: string;
  total_amount: number;
  status: string;
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

export interface AstrologerProfile {
  id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  experience_years: number;
  hourly_rate: number;
  per_minute_rate: number;
  is_verified: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
  is_online: boolean;
  is_busy: boolean;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  languages: string[];
  specializations: string[];
}

export interface EarningsData {
  earnings: {
    total_earned: number;
    available_balance: number;
    withdrawn_amount: number;
    pending_payout_amount: number;
  };
  commissions?: Array<{
    id: string;
    gross_amount: number;
    commission_rate: number;
    platform_fee: number;
    net_payout: number;
    created_at: string;
  }>;
  payoutRequests?: Array<{
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
