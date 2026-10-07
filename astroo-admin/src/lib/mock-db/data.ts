export type UserStatus = 'active' | 'blocked'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  walletBalance: number
  totalConsultations: number
  totalSpent: number
  lastActive: string
  status: UserStatus
  joinedAt: string
}

export type AstrologerStatus = 'approved' | 'pending' | 'rejected' | 'suspended'

export interface Astrologer {
  id: string
  name: string
  specialization: string[]
  languages: string[]
  rating: number
  reviews: number
  consultations: number
  earnings: number
  pricePerMinute: number
  isOnline: boolean
  status: AstrologerStatus
  joinedAt: string
}

export interface Transaction {
  id: string
  userId: string
  userName: string
  astrologerId: string
  astrologerName: string
  amount: number
  platformFee: number
  astrologerEarning: number
  status: 'completed' | 'failed' | 'refunded'
  date: string
}

export type EnquiryCategory = 'Admin' | 'Payments' | 'Active Astrologers' | 'Shop Items'
export type EnquiryStatus = 'pending' | 'resolved'

export interface Enquiry {
  id: string
  userId: string
  userName: string
  category: EnquiryCategory
  subject: string
  message: string
  status: EnquiryStatus
  date: string
}
export const MOCK_USERS: User[] = []
export const MOCK_ASTROLOGERS: Astrologer[] = []
export const MOCK_TRANSACTIONS: Transaction[] = []
export const MOCK_ENQUIRIES: Enquiry[] = []

