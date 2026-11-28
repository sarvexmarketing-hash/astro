'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/users';
import { walletService } from '../../services/wallet';
import { deriveNameFromEmail, Transaction } from '../../lib/types';
import {
  User as UserIcon,
  Phone,
  Mail,
  Wallet,
  Calendar,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Trash2,
  MapPin,
  Clock,
  Cake,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Receipt,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'transactions' | 'profile'>('transactions');
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingTx, setLoadingTx] = useState(true);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [bio, setBio] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadWalletAndTransactions = async () => {
    try {
      setLoadingTx(true);
      const [walletData, txList] = await Promise.all([
        walletService.getWallet().catch(() => null),
        walletService.getTransactions(100, 0).catch(() => []),
      ]);
      if (walletData) {
        setWalletBalance(Number(walletData.balance || 0));
      }
      if (Array.isArray(txList)) {
        setTransactions(txList);
      }
    } catch (err) {
      console.warn('Failed to load wallet data on profile:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWalletAndTransactions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      const derived = user.email ? deriveNameFromEmail(user.email) : '';
      setFullName(user.fullName || user.full_name || derived || '');
      setAvatarUrl(user.avatarUrl || user.avatar_url || '');
    }
  }, [user]);

  const totalRecharged = transactions
    .filter((tx) => tx.type === 'credit' || (tx.type as string) === 'recharge')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalDebited = transactions
    .filter((tx) => tx.type === 'debit')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const creditTransactions = transactions.filter(
    (tx) => tx.type === 'credit' || (tx.type as string) === 'recharge'
  );
  const debitTransactions = transactions.filter((tx) => tx.type === 'debit');

  const filteredTransactions = transactions.filter((tx) => {
    const isCredit = tx.type === 'credit' || (tx.type as string) === 'recharge';
    if (txFilter === 'credit') return isCredit;
    if (txFilter === 'debit') return !isCredit;
    return true;
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);
      await usersService.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        timeOfBirth: timeOfBirth || undefined,
        placeOfBirth: placeOfBirth.trim() || undefined,
        gender: gender || undefined,
        bio: bio.trim() || undefined,
      });
      await refreshUser();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await usersService.deleteAccount();
      await logout();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#18181B] pb-24 selection:bg-[#F7C93E] selection:text-[#18181B]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors cursor-pointer border border-transparent hover:border-[#FDE68A]"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-[#18181B]" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-[#FEF08A] text-[#78350F] shadow-2xs">
                  <UserIcon className="h-6 w-6 text-[#78350F]" />
                </span>
                <span>My Profile & Account</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-medium">
                Manage your personal credentials, Vedic details, and consultation settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left Column: User Overview Card */}
          <div className="bg-white rounded-3xl p-6 text-center space-y-5 border border-[#FDE68A] shadow-xs">
            {/* Avatar */}
            <div className="relative mx-auto h-24 w-24 rounded-full p-1 bg-gradient-to-tr from-[#F59E0B] to-[#F7C93E] shadow-md">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || 'Avatar'}
                  className="h-full w-full rounded-full object-cover bg-white"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-[#FEF08A] flex items-center justify-center text-[#78350F] text-3xl font-black">
                  {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-[#18181B] text-xl tracking-tight">
                {fullName || (user?.email ? deriveNameFromEmail(user.email) : 'Seeker')}
              </h3>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#FEF08A] text-[#78350F] text-xs font-bold capitalize border border-[#FDE68A]">
                  {user?.role || 'Customer'}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-3 border-t border-[#FDE68A]/60 space-y-2 text-xs">
              {user?.phone ? (
                <div className="flex items-center gap-2 text-[#3F3F46] font-medium justify-center">
                  <Phone className="h-4 w-4 text-[#D97706]" />
                  <span>+91 {user.phone}</span>
                </div>
              ) : null}
              {user?.email ? (
                <div className="flex items-center gap-2 text-[#3F3F46] font-medium justify-center">
                  <Mail className="h-4 w-4 text-[#D97706]" />
                  <span className="truncate max-w-[200px]">{user.email}</span>
                </div>
              ) : null}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-[#FDE68A]/60 space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#FEF08A] border border-[#FDE68A] text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78350F]">Available Balance</span>
                <div className="text-2xl font-black text-[#78350F]">₹{walletBalance.toFixed(2)}</div>
                <Link
                  href="/wallet"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B45309] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Recharge Wallet</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:scale-[1.01] cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-[#F7C93E] border-[#F59E0B] text-[#18181B]'
                    : 'bg-[#FFFBEB] hover:bg-[#FEF08A] border-[#FDE68A] text-[#78350F]'
                }`}
              >
                <Receipt className="h-4 w-4 text-[#D97706]" />
                <span>Recharges & Debits Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:scale-[1.01] cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#F7C93E] border-[#F59E0B] text-[#18181B]'
                    : 'bg-[#FFFBEB] hover:bg-[#FEF08A] border-[#FDE68A] text-[#78350F]'
                }`}
              >
                <Sparkles className="h-4 w-4 text-[#D97706]" />
                <span>Edit Profile Details</span>
              </button>

              <Link
                href="/bookings"
                className="w-full py-2.5 px-4 rounded-2xl bg-[#FFFBEB] hover:bg-[#FEF08A] border border-[#FDE68A] text-[#78350F] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:scale-[1.01]"
              >
                <Calendar className="h-4 w-4 text-[#D97706]" />
                <span>Consultation History</span>
              </Link>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push('/');
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#FEE2E2] hover:bg-rose-100 border border-red-200 text-[#991B1B] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs hover:scale-[1.01]"
              >
                <LogOut className="h-4 w-4 text-[#DC2626]" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tabbed Content (Transactions Ledger & Vedic Profile) */}
          <div className="md:col-span-2 space-y-4">
            {/* Tab Navigation Pill */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-[#F7C93E] text-[#18181B] shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FEF08A]/40'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#78350F]" />
                <span>Recharges & Debits Ledger</span>
                {transactions.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-[#18181B] font-black">
                    {transactions.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#F7C93E] text-[#18181B] shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FEF08A]/40'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#78350F]" />
                <span>Edit Vedic Profile</span>
              </button>
            </div>

            {/* TRANSACTIONS & PASSBOOK TAB */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-[#FDE68A] shadow-xs animate-in fade-in duration-200">
                {/* Header & Refresh */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FDE68A]">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#18181B] flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-[#D97706]" />
                      <span>Wallet Passes & Statement</span>
                    </h2>
                    <p className="text-xs text-[#71717A] font-medium mt-0.5">
                      Complete history of your online wallet recharges and consultation debits
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadWalletAndTransactions}
                      disabled={loadingTx}
                      className="py-1.5 px-3 rounded-xl border border-[#FDE68A] hover:bg-[#FFFBEB] text-[#78350F] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Refresh Ledger"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingTx ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <Link
                      href="/wallet"
                      className="py-1.5 px-3 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Recharge</span>
                    </Link>
                  </div>
                </div>

                {/* Financial Summary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#FEF08A]/60 border border-[#FDE68A] space-y-1">
                    <span className="text-[11px] font-bold text-[#78350F]/80">Current Balance</span>
                    <div className="text-2xl font-black text-[#78350F]">₹{walletBalance.toFixed(2)}</div>
                    <p className="text-[10px] text-[#78350F]/70">Available for live chat & calls</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Total Recharged</span>
                    </span>
                    <div className="text-2xl font-black text-emerald-700">+₹{totalRecharged.toFixed(2)}</div>
                    <p className="text-[10px] text-emerald-600/80">{creditTransactions.length} credit transactions</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                      <span>Total Consulted</span>
                    </span>
                    <div className="text-2xl font-black text-amber-900">-₹{totalDebited.toFixed(2)}</div>
                    <p className="text-[10px] text-amber-700/80">{debitTransactions.length} debit deductions</p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#FDE68A]/60">
                  <button
                    type="button"
                    onClick={() => setTxFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      txFilter === 'all'
                        ? 'bg-[#18181B] text-white shadow-xs'
                        : 'bg-[#FFFBEB] border border-[#FDE68A] text-[#71717A] hover:text-[#18181B]'
                    }`}
                  >
                    All ({transactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('credit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      txFilter === 'credit'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Recharges ({creditTransactions.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('debit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      txFilter === 'debit'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Consultation Debits ({debitTransactions.length})</span>
                  </button>
                </div>

                {/* Transaction Ledger Table / List */}
                <div className="space-y-2">
                  {loadingTx ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin text-[#D97706]" />
                      <span className="text-xs font-medium">Loading wallet transactions ledger...</span>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center space-y-3 bg-[#FFFDF7] rounded-2xl border border-dashed border-[#FDE68A] p-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] text-[#78350F] flex items-center justify-center mx-auto">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[#18181B]">No Transactions Found</h3>
                      <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed">
                        {txFilter === 'credit'
                          ? 'You have not made any wallet recharges yet.'
                          : txFilter === 'debit'
                          ? 'You have no consultation deduction entries yet.'
                          : 'No wallet recharges or debits have been recorded on your account yet.'}
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/wallet"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-xs shadow-xs transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Recharge Wallet via Razorpay</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredTransactions.map((tx: any) => {
                        const isCredit = tx.type === 'credit' || tx.type === 'recharge';
                        const amount = Number(tx.amount || 0);
                        const balanceAfter = tx.balanceAfter !== undefined ? Number(tx.balanceAfter) : (tx.balance_after !== undefined ? Number(tx.balance_after) : null);
                        const dateStr = tx.createdAt || tx.created_at;
                        const purpose = tx.description || tx.purpose || (isCredit ? 'Wallet Recharge via Razorpay' : 'Astrologer Live Consultation');

                        return (
                          <div
                            key={tx.id}
                            className="p-4 rounded-2xl border border-[#FDE68A] bg-white hover:bg-[#FFFBEB]/40 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isCredit
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                    : 'bg-amber-50 border-amber-200 text-amber-700'
                                }`}
                              >
                                {isCredit ? (
                                  <ArrowDownLeft className="w-5 h-5" />
                                ) : (
                                  <ArrowUpRight className="w-5 h-5" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-[#18181B]">{purpose}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                      isCredit
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {isCredit ? 'Recharge' : 'Debit'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#71717A]">
                                  {dateStr && (
                                    <span>
                                      {new Date(dateStr).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}{' '}
                                      &bull;{' '}
                                      {new Date(dateStr).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  )}
                                  {tx.referenceId && (
                                    <span className="font-mono text-zinc-400">Ref: {tx.referenceId.slice(-8)}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div
                                className={`text-base font-black ${
                                  isCredit ? 'text-emerald-600' : 'text-[#18181B]'
                                }`}
                              >
                                {isCredit ? '+' : '-'}₹{amount.toFixed(2)}
                              </div>
                              {balanceAfter !== null && !isNaN(balanceAfter) && (
                                <div className="text-[11px] text-[#71717A] font-medium">
                                  Bal: ₹{balanceAfter.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EDIT VEDIC PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-[#FDE68A] shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#FDE68A]">
                  <h2 className="text-lg font-extrabold text-[#18181B] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#D97706]" />
                    <span>Edit Profile Details</span>
                  </h2>
                  <span className="text-xs text-[#71717A] font-medium">Vedic Account Info</span>
                </div>

            {message && (
              <div className="p-3.5 rounded-2xl bg-[#DCFCE7] border border-emerald-300 text-[#166534] text-xs flex items-center gap-2.5 font-semibold animate-in fade-in">
                <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-red-300 text-[#991B1B] text-xs flex items-center gap-2.5 font-semibold animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all font-medium"
                    required
                  />
                </div>

                {/* Profile Picture URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all font-medium"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-[#18181B] mb-1.5 flex items-center gap-1.5">
                    <Cake className="h-3.5 w-3.5 text-[#D97706]" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#FDE68A] text-[#18181B] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all font-medium"
                  />
                </div>

                {/* Time of Birth */}
                <div>
                  <label className="block text-xs font-bold text-[#18181B] mb-1.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#D97706]" />
                    <span>Time of Birth</span>
                  </label>
                  <input
                    type="time"
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#FDE68A] text-[#18181B] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all font-medium"
                  />
                </div>

                {/* Place of Birth */}
                <div>
                  <label className="block text-xs font-bold text-[#18181B] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
                    <span>Place of Birth</span>
                  </label>
                  <input
                    type="text"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all font-medium"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#FDE68A] text-[#18181B] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all font-medium cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Security Pill */}
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 text-xs text-[#166534] flex items-center gap-2.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0" />
                <span>Account Protected by End-to-End JWT Session Security</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-3 px-8 rounded-full bg-[#F7C93E] hover:bg-[#F59E0B] text-[#18181B] font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#18181B]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>

            {/* Danger Zone: Account Deletion */}
            <div className="pt-6 border-t border-red-200 space-y-3">
              <h3 className="text-sm font-extrabold text-[#991B1B] flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-[#DC2626]" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Permanently delete your profile, saved charts, and personal data. Financial transaction logs are retained in an anonymized format for legal and regulatory compliance.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-5 rounded-full bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#991B1B] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Delete Account?</h3>
                  <p className="text-xs text-gray-500">This action is permanent and cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your profile details, birth details, and saved charts will be permanently deleted, and your active session will be invalidated immediately.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
