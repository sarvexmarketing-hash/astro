"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { walletService } from "../../services/wallet";
import { Wallet, Transaction } from "../../lib/types";
import { getRazorpayKey } from "../../lib/api-config";
import {
  ArrowLeft,
  Info,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2,
} from "lucide-react";

export default function WalletPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { walletBalance: socketBalance } = useSocket();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Recharge options from WalletScreen.kt: listOf(99, 199, 499, 999, 1999, 4999)
  const rechargeOptions = [99, 199, 499, 999, 1999, 4999];
  const [selectedAmount, setSelectedAmount] = useState<number>(rechargeOptions[1]); // default 199
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/wallet");
    }
  }, [authLoading, isAuthenticated]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [walletData, txList] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(50, 0),
      ]);
      setWallet(walletData);
      setTransactions(txList);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWalletData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof socketBalance === "number" && wallet) {
      setWallet((prev) => (prev ? { ...prev, balance: socketBalance } : null));
    }
  }, [socketBalance]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your connection.");
      }

      // 1. Create order on backend
      const orderData = await walletService.createRechargeOrder(selectedAmount);

      // 2. Open Razorpay options
      const options = {
        key: getRazorpayKey(),
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Astrowave",
        description: `Wallet Recharge: ₹${selectedAmount}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.fullName || "Seeker",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#F7C93E",
        },
        handler: async (response: any) => {
          try {
            const verification = await walletService.verifyPayment({
              orderId: response.razorpay_order_id || orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verification.success) {
              setSuccessMessage(`Payment of ₹${selectedAmount} successful!`);
              await loadWalletData();
            } else {
              setErrorMessage("Payment verification failed. If debited, it will be credited within 24 hours.");
            }
          } catch (err: any) {
            setErrorMessage(err.message || "Payment verification failed.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate recharge.");
      setIsProcessingPayment(false);
    }
  };

  const balance = wallet?.balance !== undefined ? Number(wallet.balance) : 0;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-md sm:max-w-xl mx-auto px-4 py-3 space-y-4">
        {/* Top App Bar (WalletScreen.kt line 61) */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#18181B]">My Wallet</h1>
          </div>
          <button
            onClick={loadWalletData}
            className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message Banner (WalletScreen.kt line 90) */}
        {successMessage && (
          <div className="rounded-xl bg-[#DCFCE7] border border-emerald-300 p-3 flex items-center gap-2.5 text-[#166534]">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#16A34A]" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Message Banner (WalletScreen.kt line 114) */}
        {errorMessage && (
          <div className="rounded-xl bg-[#FEE2E2] border border-red-300 p-3 flex items-center gap-2.5 text-[#991B1B]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#DC2626]" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Balance Card (WalletScreen.kt line 138 - primaryContainer color: #FEF08A) */}
        <div className="rounded-[20px] bg-[#FEF08A] border border-[#FDE68A] p-6 text-center shadow-xs">
          <span className="text-sm font-medium text-[#78350F]/80">Current Balance</span>
          <div className="text-4xl sm:text-5xl font-bold text-[#78350F] tracking-tight my-2">
            ₹{balance.toFixed(2)}
          </div>
          <div className="inline-flex items-center justify-center gap-1.5 text-xs text-[#78350F]/80 font-medium">
            <Shield className="w-4 h-4 text-[#16A34A]" />
            <span>100% Safe & Secure via Razorpay (Test Mode)</span>
          </div>
        </div>

        {/* Recharge Section (WalletScreen.kt line 174) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-[#18181B]">Select Recharge Amount</h2>

          {/* 3-Column Grid (WalletScreen.kt line 182) */}
          <div className="grid grid-cols-3 gap-2.5">
            {rechargeOptions.map((amount) => {
              const isSelected = amount === selectedAmount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-3.5 px-2 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-[#FEF08A] border-[#F7C93E] shadow-xs text-[#18181B] font-bold"
                      : "bg-white border-[#FDE68A] text-[#18181B] hover:bg-[#FFFBEB] font-semibold"
                  }`}
                >
                  <span className="text-sm sm:text-base">₹{amount}</span>
                </button>
              );
            })}
          </div>

          {/* Pay Button / Processing (WalletScreen.kt line 199) */}
          <div className="pt-2">
            {isProcessingPayment ? (
              <div className="w-full h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center gap-3 text-blue-600 font-semibold text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Razorpay Checkout...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePay}
                className="w-full h-12 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-sm shadow-xs hover:shadow transition-all"
              >
                Pay ₹{selectedAmount} via Razorpay
              </button>
            )}
          </div>
        </div>

        {/* Divider (WalletScreen.kt line 238) */}
        <div className="border-b border-[#FDE68A]/60 pt-2" />

        {/* Recent Transactions (WalletScreen.kt line 241) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#18181B]">Recent Transactions</h2>
            <span className="text-xs text-[#71717A]">{transactions.length} entries</span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-[#71717A] text-xs">
              No recent transactions recorded.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isCredit = tx.type === "credit" || (tx.type as string) === "recharge";
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-white rounded-2xl border border-[#FDE68A] flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#18181B]">{tx.purpose || tx.type}</h4>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className={`text-sm font-bold ${isCredit ? "text-[#16A34A]" : "text-[#18181B]"}`}>
                      {isCredit ? "+" : "-"}₹{Number(tx.amount).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
