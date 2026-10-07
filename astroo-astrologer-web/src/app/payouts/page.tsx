'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { astrologerService } from '../../services/astrologer';
import { payoutsService } from '../../services/payouts';
import { PayoutAccount } from '../../lib/types';
import {
  CreditCard,
  PlusCircle,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function AstrologerPayoutsPage() {
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();

  const [availableBalance, setAvailableBalance] = useState(0);
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Request payout form
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Add account modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accType, setAccType] = useState<'bank_account' | 'upi'>('bank_account');
  const [holderName, setHolderName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isAddingAcc, setIsAddingAcc] = useState(false);
  const [addAccError, setAddAccError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAstrologer]);

  const loadPayoutData = async () => {
    try {
      setIsLoading(true);
      const [eData, accList] = await Promise.all([
        astrologerService.getEarnings(),
        payoutsService.listAccounts(),
      ]);
      setAvailableBalance(Number(eData.earnings?.available_balance || 0));
      setPayoutHistory(eData.payoutRequests || []);
      setAccounts(accList);
      if (accList.length > 0) {
        setSelectedAccountId(accList[0].id);
      }
    } catch (err) {
      console.error('Error loading payouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAstrologer) {
      loadPayoutData();
    }
  }, [isAuthenticated, isAstrologer]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmount);
    if (!amt || amt < 100) {
      setPayoutError('Minimum withdrawal amount is ₹100');
      return;
    }
    if (amt > availableBalance) {
      setPayoutError(`Amount exceeds available balance of ₹${availableBalance.toFixed(2)}`);
      return;
    }

    try {
      setIsRequesting(true);
      setPayoutError(null);
      await payoutsService.requestPayout({
        amount: amt,
        accountId: selectedAccountId || undefined,
      });

      setPayoutSuccess(`Payout request for ₹${amt.toFixed(2)} submitted successfully!`);
      setPayoutAmount('');
      loadPayoutData();
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to submit payout request');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingAcc(true);
      setAddAccError(null);
      const newAcc = await payoutsService.addAccount({
        accountType: accType,
        accountHolderName: holderName.trim(),
        accountNumber: accType === 'bank_account' ? accNumber.trim() : undefined,
        ifscCode: accType === 'bank_account' ? ifsc.trim().toUpperCase() : undefined,
        upiId: accType === 'upi' ? upiId.trim() : undefined,
      });

      setIsAddAccountOpen(false);
      setAccounts((prev) => [...prev, newAcc]);
      setSelectedAccountId(newAcc.id);
    } catch (err: any) {
      setAddAccError(err.message || 'Error saving payment account');
    } finally {
      setIsAddingAcc(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#D97706] tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-[#D97706]" />
          <span>Practitioner Payouts</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-medium">
          Withdraw earned consultation balances directly to your registered bank account or UPI
        </p>
      </div>

      {/* Available Balance & Request Payout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Balance Card */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#FDE68A] shadow-xs space-y-4">
          <span className="text-xs uppercase tracking-wider text-[#71717A] font-bold">Available For Withdrawal</span>
          <div className="text-4xl sm:text-5xl font-black text-[#15803D]">
            ₹{availableBalance.toFixed(2)}
          </div>
          <p className="text-xs text-[#71717A]">
            Payout requests are cleared via IMPS/NEFT within 24 business hours.
          </p>

          <div className="pt-2 border-t border-[#FDE68A]/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span>Minimum Payout:</span>
              <strong className="text-[#18181B]">₹100.00</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-[#71717A]">
              <span>Processing Fee:</span>
              <strong className="text-[#15803D]">₹0 (Free)</strong>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#FDE68A] shadow-xs space-y-5">
          <h2 className="text-base font-black text-[#D97706] border-b border-[#FDE68A] pb-3">Request Withdrawal</h2>

          {payoutSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15803D]" />
              <span className="font-semibold">{payoutSuccess}</span>
            </div>
          )}

          {payoutError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{payoutError}</span>
            </div>
          )}

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">Withdrawal Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-[#71717A]">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  max={availableBalance}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] text-sm focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#18181B]">Disbursement Account</label>
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(true)}
                  className="text-xs text-[#D97706] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Bank/UPI</span>
                </button>
              </div>

              {accounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] text-xs focus:outline-none focus:border-[#D97706]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type === 'upi' ? `UPI: ${acc.upi_id}` : `Bank: ${acc.account_number_masked || 'Account'} (${acc.ifsc_code || ''})`} — {acc.account_holder_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-xs text-[#71717A] flex items-center justify-between">
                  <span>No payout accounts configured yet</span>
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(true)}
                    className="text-[#D97706] font-bold hover:underline"
                  >
                    + Add Account
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isRequesting || availableBalance < 100 || !accounts.length}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Submit Payout Request</span>}
            </button>
          </form>
        </div>
      </div>

      {/* Payout Requests History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FDE68A] shadow-xs space-y-4">
        <h2 className="text-base font-black text-[#D97706] border-b border-[#FDE68A] pb-3">Withdrawal Request History</h2>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          </div>
        ) : payoutHistory.length > 0 ? (
          <div className="divide-y divide-[#FDE68A]/60">
            {payoutHistory.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#18181B]">Withdrawal Request: ₹{Number(req.amount).toFixed(2)}</p>
                  <p className="text-[10px] text-[#71717A]">{new Date(req.created_at).toLocaleString()}</p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    req.status === 'completed'
                      ? 'bg-emerald-100 text-[#15803D]'
                      : req.status === 'rejected'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-[#B45309]'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[#71717A] text-xs">
            No withdrawal requests submitted yet.
          </div>
        )}
      </div>

      {/* Add Bank/UPI Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[#FDE68A] bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsAddAccountOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#71717A] hover:text-[#18181B]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black text-[#D97706]">Add Payout Account</h3>

            {addAccError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {addAccError}
              </div>
            )}

            <div className="flex rounded-xl bg-[#FEF9C3] p-1 border border-[#FDE68A]">
              <button
                type="button"
                onClick={() => setAccType('bank_account')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  accType === 'bank_account' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-[#78350F]'
                }`}
              >
                Bank Account
              </button>
              <button
                type="button"
                onClick={() => setAccType('upi')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  accType === 'upi' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-[#78350F]'
                }`}
              >
                UPI ID
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1">Account Holder Legal Name</label>
                <input
                  type="text"
                  placeholder="As per bank passbook"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] text-xs focus:outline-none focus:border-[#D97706]"
                  required
                />
              </div>

              {accType === 'bank_account' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="Bank account number"
                      value={accNumber}
                      onChange={(e) => setAccNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] text-xs focus:outline-none focus:border-[#D97706]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] text-xs uppercase focus:outline-none focus:border-[#D97706]"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#18181B] mb-1">UPI ID (VPA)</label>
                  <input
                    type="text"
                    placeholder="name@okaxis / mobile@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] text-xs focus:outline-none focus:border-[#D97706]"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingAcc}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-50 shadow-md shadow-amber-400/25"
              >
                {isAddingAcc ? 'Saving Account...' : 'Save Payout Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
