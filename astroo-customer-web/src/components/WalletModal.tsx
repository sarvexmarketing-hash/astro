'use client';

import React, { useState } from 'react';
import { walletService } from '../services/wallet';
import { useAuth } from '../context/AuthContext';
import { openRazorpayStandardCheckout } from '../lib/razorpay';
import { X, Wallet as WalletIcon, CheckCircle2, ShieldCheck, Zap, Loader2, AlertCircle } from 'lucide-react';

interface WalletModalProps {
  currentBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  suggestedAmount?: number;
}

export default function WalletModal({
  currentBalance,
  onClose,
  onSuccess,
  suggestedAmount,
}: WalletModalProps) {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmount || 250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const rechargePacks = [100, 250, 500, 1000, 2500];

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleRecharge = async () => {
    if (!effectiveAmount || effectiveAmount < 10) {
      setError('Please enter a recharge amount of at least ₹10');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await openRazorpayStandardCheckout({
        amount: Math.round(effectiveAmount * 100),
        currency: 'INR',
        name: 'Astrowave Consultation',
        description: `Wallet Recharge: ₹${effectiveAmount}`,
        prefill: {
          name: user?.fullName || 'Customer',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          userId: user?.id || '',
          purpose: 'wallet_recharge',
        },
        themeColor: '#f59e0b',
        onSuccess: async () => {
          setIsSuccess(true);
          const updatedWallet = await walletService.getWallet();
          setTimeout(() => {
            onSuccess(Number(updatedWallet.balance));
          }, 1200);
          setIsLoading(false);
        },
        onError: (errMessage: string) => {
          setError(errMessage);
          setIsLoading(false);
        },
        onDismiss: () => {
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.message || 'Could not initiate recharge');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#FDE68A] bg-white p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#71717A] hover:text-[#18181B] rounded-full hover:bg-[#FFFBEB] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D] border border-emerald-300">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-[#18181B]">Recharge Successful!</h3>
            <p className="text-sm text-[#71717A]">
              ₹{effectiveAmount} has been credited to your Astrowave wallet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shadow-2xs flex-shrink-0">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18181B]">Recharge Astrowave Wallet</h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Current Balance:{" "}
                  <span className="font-bold text-[#78350F] bg-[#FEF08A] px-2 py-0.5 rounded-full border border-[#F7C93E] ml-1">
                    ₹{currentBalance.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-red-300 text-[#991B1B] text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            {/* Predefined Recharge Packs */}
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-2">
                Select Recharge Amount
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {rechargePacks.map((amount) => {
                  const isSelected = selectedAmount === amount && !customAmount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#F7C93E] bg-[#FEF08A] shadow-xs text-[#78350F] font-bold scale-[1.02]'
                          : 'border border-[#FDE68A] bg-[#FFFDF7] hover:bg-[#FFFBEB] hover:border-[#F7C93E] text-[#18181B] font-semibold'
                      }`}
                    >
                      <div className="font-bold text-base sm:text-lg">
                        ₹{amount}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Or Enter Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#71717A] font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 750"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A]"
                />
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-xs text-[#71717A] pt-1 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0" />
              <span>100% Encrypted & Safe Razorpay Payment Gateway (UPI, Cards, Netbanking)</span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRecharge}
              disabled={isLoading || !effectiveAmount || effectiveAmount < 10}
              className="w-full py-3.5 rounded-full bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#18181B]" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current text-[#18181B]" />
                  <span>Pay & Recharge ₹{effectiveAmount || 0}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
