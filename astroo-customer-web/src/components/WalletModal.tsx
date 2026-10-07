'use client';

import React, { useState } from 'react';
import { walletService } from '../services/wallet';
import { getRazorpayKey } from '../lib/api-config';
import { useAuth } from '../context/AuthContext';
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

  const rechargePacks = [
    { amount: 100, bonus: '₹0 Bonus', tag: null },
    { amount: 250, bonus: '+₹25 Extra', tag: 'Popular' },
    { amount: 500, bonus: '+₹75 Extra', tag: 'Recommended' },
    { amount: 1000, bonus: '+₹200 Extra', tag: 'Best Value' },
    { amount: 2500, bonus: '+₹600 Extra', tag: 'VIP' },
  ];

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async () => {
    if (!effectiveAmount || effectiveAmount < 10) {
      setError('Please enter a recharge amount of at least ₹10');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Create order on backend
      const order = await walletService.createRechargeOrder(effectiveAmount);

      // 2. Load script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please check internet connection.');
        setIsLoading(false);
        return;
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: getRazorpayKey(),
        amount: Math.round(effectiveAmount * 100),
        currency: 'INR',
        name: 'Astrowave Consultation',
        description: `Wallet Recharge: ₹${effectiveAmount}`,
        order_id: order.orderId,
        prefill: {
          name: user?.fullName || 'Customer',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#f59e0b',
        },
        handler: async (response: any) => {
          try {
            setIsLoading(true);
            const verifyRes = await walletService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            setIsSuccess(true);
            const updatedWallet = await walletService.getWallet();
            setTimeout(() => {
              onSuccess(Number(updatedWallet.balance));
            }, 1200);
          } catch (verifyErr: any) {
            setError(verifyErr.message || 'Payment verification failed');
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (failedRes: any) => {
        setError(failedRes.error?.description || 'Payment was unsuccessful');
        setIsLoading(false);
      });
      razorpay.open();
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
                Select Recharge Pack
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {rechargePacks.map((pack) => {
                  const isSelected = selectedAmount === pack.amount && !customAmount;
                  return (
                    <button
                      key={pack.amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(pack.amount);
                        setCustomAmount('');
                      }}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#F7C93E] bg-[#FEF08A] shadow-xs scale-[1.02]'
                          : 'border border-[#FDE68A] bg-[#FFFDF7] hover:bg-[#FFFBEB] hover:border-[#F7C93E]'
                      }`}
                    >
                      {pack.tag && (
                        <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-[#F7C93E] text-[9px] font-black text-[#78350F] uppercase border border-amber-300 shadow-2xs">
                          {pack.tag}
                        </span>
                      )}
                      <div className={`font-bold text-base ${isSelected ? 'text-[#78350F]' : 'text-[#18181B]'}`}>
                        ₹{pack.amount}
                      </div>
                      <div className="text-[11px] text-[#15803D] font-bold mt-0.5">
                        {pack.bonus}
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
