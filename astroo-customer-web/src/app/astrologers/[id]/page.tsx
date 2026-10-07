"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { astrologersService } from "@/services/astrologers";
import { walletService } from "@/services/wallet";
import { Astrologer } from "@/lib/types";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  MessageCircle,
  Phone,
  Loader2,
  Shield,
} from "lucide-react";

export default function AstrologerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const astrologerId = resolvedParams.id;

  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Insufficient Balance Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [requiredMinimum, setRequiredMinimum] = useState(0);
  const [pendingMode, setPendingMode] = useState<"chat" | "call">("chat");

  useEffect(() => {
    loadData();
  }, [astrologerId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [astro, w] = await Promise.all([
        astrologersService.getById(astrologerId),
        walletService.getWallet().catch(() => null),
      ]);
      setAstrologer(astro);
      if (w?.balance !== undefined) {
        setWalletBalance(Number(w.balance));
      }
    } catch (err) {
      console.error("Failed to load astrologer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const astrologerName = astrologer?.display_name || "Astrologer";
  const chatPricePerMin = astrologer?.per_minute_rate || 25;
  const callPricePerMin = chatPricePerMin + 10;
  const experience = `${astrologer?.experience_years || 10} Years`;
  const rating = `${Number(astrologer?.rating || 5).toFixed(1)} ⭐`;
  const orders = `${astrologer?.total_consultations || 100}+`;
  const bio =
    astrologer?.bio ||
    "Expert Vedic Astrologer specializing in Kundli matching, horoscope reading, and spiritual guidance.";

  const handleStartConsultation = (mode: "chat" | "call") => {
    const rate = mode === "chat" ? chatPricePerMin : callPricePerMin;
    const minRequired = Math.max(100, rate * 5);

    if (walletBalance < minRequired) {
      setPendingMode(mode);
      setRequiredMinimum(minRequired);
      setShowDialog(true);
    } else {
      if (mode === "call") {
        router.push(`/call/${astrologerId}`);
      } else {
        router.push(`/chat/${astrologerId}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
        <span className="text-xs text-[#71717A] mt-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-28">
      <div className="max-w-md sm:max-w-xl mx-auto px-4 py-3 space-y-6">
        {/* Top App Bar (AstrologerProfileScreen.kt line 99) */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: astrologerName,
                    url: window.location.href,
                  });
                }
              }}
              className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header (AstrologerProfileScreen.kt line 129) */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-28 h-28 rounded-full bg-[#FEF3C7] border-4 border-[#FDE68A] overflow-hidden flex items-center justify-center text-4xl font-bold text-[#B45309] shadow-sm">
            {astrologer?.avatar_url ? (
              <img
                src={astrologer.avatar_url}
                alt={astrologerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{astrologerName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#18181B]">{astrologerName}</h1>
            <p className="text-sm font-semibold text-[#D97706] mt-0.5">
              {astrologer?.specializations?.join(" • ") || "Vedic Astrology • Kundli • Prashna"}
            </p>
            <p className="text-xs text-[#71717A] mt-1">
              {astrologer?.languages?.join(", ") || "English, Hindi, Sanskrit"}
            </p>
          </div>
        </div>

        {/* Stats Row (AstrologerProfileScreen.kt line 178) */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-white rounded-2xl border border-[#FDE68A] text-center shadow-2xs">
          <div>
            <div className="text-base font-bold text-[#18181B]">{experience}</div>
            <div className="text-[11px] text-[#71717A] mt-0.5">Experience</div>
          </div>
          <div className="border-x border-[#FDE68A]/60">
            <div className="text-base font-bold text-[#18181B]">{orders}</div>
            <div className="text-[11px] text-[#71717A] mt-0.5">Consultations</div>
          </div>
          <div>
            <div className="text-base font-bold text-[#18181B]">{rating}</div>
            <div className="text-[11px] text-[#71717A] mt-0.5">Rating</div>
          </div>
        </div>

        {/* Pricing Cards (AstrologerProfileScreen.kt line 192) */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-4 bg-[#FFFBEB] rounded-2xl border border-[#FEF08A] text-center">
            <span className="text-xs text-[#71717A] font-medium">Chat Consultation</span>
            <div className="text-xl font-bold text-[#D97706] mt-1">
              ₹{chatPricePerMin}/min
            </div>
          </div>

          <div className="p-4 bg-[#FFFBEB] rounded-2xl border border-[#FEF08A] text-center">
            <span className="text-xs text-[#71717A] font-medium">Call Consultation</span>
            <div className="text-xl font-bold text-[#D97706] mt-1">
              ₹{callPricePerMin}/min
            </div>
          </div>
        </div>

        {/* About Section (AstrologerProfileScreen.kt line 238) */}
        <div className="bg-white rounded-2xl border border-[#FDE68A] p-5 shadow-2xs space-y-2">
          <h2 className="text-base font-bold text-[#18181B]">About Me</h2>
          <p className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed whitespace-pre-line">
            {bio}
          </p>
        </div>

        {/* Bottom Fixed Action Bar (AstrologerProfileScreen.kt line 261) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#FDE68A] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] p-3">
          <div className="max-w-md sm:max-w-xl mx-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleStartConsultation("chat")}
              className="py-3 px-4 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#18181B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-[#D97706]" />
              <span>Start Chat (₹{chatPricePerMin}/m)</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartConsultation("call")}
              className="py-3 px-4 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4 text-[#18181B]" />
              <span>Start Call (₹{callPricePerMin}/m)</span>
            </button>
          </div>
        </div>

        {/* Insufficient Balance Dialog */}
        {showDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#FDE68A] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] text-[#78350F] flex items-center justify-center text-2xl font-bold mx-auto">
                ₹
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-[#18181B]">Insufficient Balance</h3>
                <p className="text-xs text-[#71717A]">
                  You need a minimum balance of <strong>₹{requiredMinimum}</strong> to consult with{" "}
                  <strong>{astrologerName}</strong>.
                </p>
                <p className="text-xs font-semibold text-[#D97706] pt-1">
                  Current Balance: ₹{walletBalance.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    router.push("/wallet");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] text-xs font-bold shadow-xs"
                >
                  Recharge Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
