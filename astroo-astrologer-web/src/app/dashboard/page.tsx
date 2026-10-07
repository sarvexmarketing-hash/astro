"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { astrologerService } from "@/services/astrologer";
import { consultationsService } from "@/services/consultations";
import { AstrologerProfile, Consultation, EarningsData } from "@/lib/types";
import {
  Bell,
  User,
  MessageSquare,
  Sparkles,
  Phone,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  HelpCircle,
  Calendar,
  CheckCircle,
  Home,
} from "lucide-react";

export default function AstrologerDashboard() {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  const [profile, setProfile] = useState<AstrologerProfile | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Consultation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prof, earnings, requests] = await Promise.allSettled([
        astrologerService.getMyProfile(),
        astrologerService.getEarnings(),
        consultationsService.listRequests(),
      ]);

      if (prof.status === "fulfilled") {
        setProfile(prof.value);
        setIsOnline(prof.value.is_online ?? true);
      }
      if (earnings.status === "fulfilled") {
        setEarningsData(earnings.value);
      }
      if (requests.status === "fulfilled") {
        setPendingRequests(requests.value || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (typeof e?.detail?.isOnline === 'boolean') {
        setIsOnline(e.detail.isOnline);
      }
    };
    window.addEventListener('astro_online_status_changed', handleSync);
    return () => window.removeEventListener('astro_online_status_changed', handleSync);
  }, []);

  const handleToggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await astrologerService.toggleOnline(nextStatus);
      window.dispatchEvent(new CustomEvent('astro_online_status_changed', { detail: { isOnline: nextStatus } }));
    } catch (err) {
      setIsOnline(!nextStatus); // rollback
    }
  };

  const todayEarnings = earningsData?.earnings?.available_balance ?? earningsData?.earnings?.total_earned ?? 0;
  const totalConsultations = profile?.total_consultations ?? 0;
  const rating = profile?.rating ? Number(profile.rating).toFixed(1) : "5.0";
  const experienceYears = profile?.experience_years || 0;
  const perMinuteRate = profile?.per_minute_rate || 25;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      {/* Top Header matching astrologer_screen.png */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/95 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#FDE68A]/60">
        <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
          Astrologer Portal
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#52525B] hover:text-[#18181B] transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            {pendingRequests.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white"></span>
            )}
          </Link>
          <Link
            href="/profile"
            className="p-1 rounded-full text-[#52525B] hover:text-[#18181B] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#FEF08A] border border-[#FDE68A] flex items-center justify-center font-bold text-xs text-[#78350F]">
              {user?.fullName ? user.fullName[0].toUpperCase() : "J"}
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* ========================================================================= */}
        {/* 1. WELCOME & ONLINE STATUS CARD (Matching astrologer_screen.png)          */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            {/* Yellow Om Icon Box */}
            <div className="w-14 h-14 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-3xl font-bold text-[#A21CAF] flex-shrink-0 shadow-xs">
              <span className="select-none">ॐ</span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#71717A] block leading-tight font-medium">Welcome,</span>
              <h2 className="text-lg font-black text-[#18181B] truncate leading-tight mt-0.5">
                {user?.fullName || profile?.display_name || "Astrologer"}
              </h2>
              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
                <span>✓</span>
                <span>Verified Astrologer</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#FDE68A]/60 my-4" />

          {/* Online Toggle Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
              <span className="text-sm font-bold text-[#18181B]">
                You are Online (Discoverable)
              </span>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleOnline}
              className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
                isOnline ? "bg-[#10B981] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SERVICES & OPERATIONS HUB (Matching astrologer_screen.png)             */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs space-y-3.5">
          <h3 className="text-sm font-black text-[#18181B] tracking-tight">
            Services & Operations Hub
          </h3>

          <div className="grid grid-cols-4 gap-2.5">
            {/* Tile 1: Poojas */}
            <Link
              href="/consultations"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 text-[#A21CAF] font-bold select-none">ॐ</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Poojas</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Bookings</span>
            </Link>

            {/* Tile 2: Muhurat */}
            <Link
              href="/requests"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 text-[#D97706] select-none">✨</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Muhurat</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Requests</span>
            </Link>

            {/* Tile 3: Payouts */}
            <Link
              href="/payouts"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 select-none">💰</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Payouts</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Ledger</span>
            </Link>

            {/* Tile 4: Support */}
            <Link
              href="/availability"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 select-none">🛡️</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Support</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Help Desk</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. 2x2 METRIC CARDS (Matching astrologer_screen.png)                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Today's Earnings */}
          <Link
            href="/earnings"
            className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs hover:border-[#F7C93E] transition-all"
          >
            <span className="text-2xl mb-1 block select-none">💰</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight">
              ₹{todayEarnings}
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Today's Earnings
            </div>
          </Link>

          {/* Card 2: Consultations */}
          <Link
            href="/consultations"
            className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs hover:border-[#F7C93E] transition-all"
          >
            <span className="text-2xl mb-1 block select-none">💬</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight">
              {totalConsultations}
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Consultations
            </div>
          </Link>

          {/* Card 3: Current Rating */}
          <div className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs">
            <span className="text-2xl mb-1 block select-none">🌟</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight flex items-center gap-1.5">
              <span>{rating}</span>
              <span className="text-amber-500 text-xl">★</span>
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Current Rating
            </div>
          </div>

          {/* Card 4: Experience */}
          <Link
            href="/profile"
            className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs hover:border-[#F7C93E] transition-all"
          >
            <span className="text-2xl mb-1 block select-none">⏱️</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight">
              {experienceYears} yrs
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Experience
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 4. CONSULTATION CHANNELS (Matching astrologer_screen.png)                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#18181B] tracking-tight">
            Consultation Channels
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg select-none">💬</span>
              <span className="text-sm font-bold text-[#18181B]">
                Chat Consultations (₹{perMinuteRate}/min)
              </span>
            </div>

            {/* Channel Toggle */}
            <button
              onClick={() => setChatEnabled(!chatEnabled)}
              className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
                chatEnabled ? "bg-[#EA580C] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. BOTTOM NAVIGATION BAR (Matching astrologer_screen.png)                 */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#FDE68A] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-4 py-2 flex items-center justify-around max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="flex flex-col items-center py-1 px-3 text-[#D97706] font-bold"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          href="/requests"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#18181B] relative"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-black">
                {pendingRequests.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Requests</span>
        </Link>

        <Link
          href="/availability"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#18181B]"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Calendar</span>
        </Link>

        <Link
          href="/earnings"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#18181B]"
        >
          <span className="text-base font-black leading-none">₹</span>
          <span className="text-[10px] font-bold mt-0.5">Earnings</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#18181B]"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
