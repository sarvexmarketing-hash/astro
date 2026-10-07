'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { astrologerService } from '../../services/astrologer';
import { EarningsData } from '../../lib/types';
import {
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AstrologerEarningsPage() {
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAstrologer]);

  useEffect(() => {
    if (isAuthenticated && isAstrologer) {
      astrologerService.getEarnings().then((data) => {
        setEarningsData(data);
      }).catch((err) => {
        console.error('Error fetching earnings:', err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isAuthenticated, isAstrologer]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#D97706] tracking-tight flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#D97706]" />
            <span>Earnings & Commissions Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-1">
            Authoritative breakdown of consultation revenues, 20% platform fee, and net earnings
          </p>
        </div>

        <Link
          href="/payouts"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/25 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <CreditCard className="h-4 w-4" />
          <span>Request Payout</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#FDE68A] shadow-xs space-y-1">
          <span className="text-xs text-[#71717A] font-semibold">Total Earned</span>
          <div className="text-3xl font-black text-[#18181B]">
            ₹{earningsData?.earnings?.total_earned !== undefined ? Number(earningsData.earnings.total_earned).toFixed(2) : '0.00'}
          </div>
          <p className="text-[10px] text-[#A16207] font-medium">Cumulative revenue</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#FDE68A] shadow-xs space-y-1">
          <span className="text-xs text-[#71717A] font-semibold">Available for Payout</span>
          <div className="text-3xl font-black text-[#15803D]">
            ₹{earningsData?.earnings?.available_balance !== undefined ? Number(earningsData.earnings.available_balance).toFixed(2) : '0.00'}
          </div>
          <p className="text-[10px] text-[#15803D] font-medium">Ready to transfer</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#FDE68A] shadow-xs space-y-1">
          <span className="text-xs text-[#71717A] font-semibold">Pending Payouts</span>
          <div className="text-3xl font-black text-[#D97706]">
            ₹{earningsData?.earnings?.pending_payout_amount !== undefined ? Number(earningsData.earnings.pending_payout_amount).toFixed(2) : '0.00'}
          </div>
          <p className="text-[10px] text-[#A16207]">Under bank clearance</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#FDE68A] shadow-xs space-y-1">
          <span className="text-xs text-[#71717A] font-semibold">Total Withdrawn</span>
          <div className="text-3xl font-black text-[#71717A]">
            ₹{earningsData?.earnings?.withdrawn_amount !== undefined ? Number(earningsData.earnings.withdrawn_amount).toFixed(2) : '0.00'}
          </div>
          <p className="text-[10px] text-[#71717A]">Credited to bank</p>
        </div>
      </div>

      {/* Commission Structure Explainer */}
      <div className="p-4 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center gap-3 text-xs text-[#78350F]">
        <ShieldCheck className="h-5 w-5 text-[#D97706] shrink-0" />
        <span>
          Astrowave Transparent Commission Policy: 80% Net Practitioner Payout on every minute of consultation. 20% covers platform maintenance, WebRTC infrastructure, and payment gateway costs.
        </span>
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FDE68A] shadow-xs space-y-6">
        <h2 className="text-base font-black text-[#D97706] border-b border-[#FDE68A] pb-3">Consultation Commissions Ledger</h2>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          </div>
        ) : earningsData?.commissions && earningsData.commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#FDE68A] text-[#71717A] pb-2 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Gross Fee</th>
                  <th className="pb-3">Platform Fee (20%)</th>
                  <th className="pb-3 text-right">Net Practitioner Payout (80%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDE68A]/60 text-[#18181B]">
                {earningsData.commissions.map((comm) => {
                  const gross = Number(comm.gross_amount) || 0;
                  const fee = Number(comm.platform_fee) || 0;
                  const rawNet = (comm as any).provider_net_amount ?? comm.net_payout ?? (gross - fee);
                  const netPayout = isNaN(Number(rawNet)) ? Math.max(0, gross - fee) : Number(rawNet);
                  return (
                    <tr key={comm.id} className="hover:bg-[#FFFDF7]">
                      <td className="py-3 text-[#71717A]">{new Date(comm.created_at).toLocaleString()}</td>
                      <td className="py-3 font-bold text-[#18181B]">₹{gross.toFixed(2)}</td>
                      <td className="py-3 text-rose-600 font-semibold">-₹{fee.toFixed(2)}</td>
                      <td className="py-3 text-right font-black text-[#15803D]">+₹{netPayout.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-[#71717A] text-xs">
            No commission transactions recorded yet. Complete consultations to build your earnings ledger.
          </div>
        )}
      </div>
    </div>
  );
}
