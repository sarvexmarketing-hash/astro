"use client";

import { useEffect, useState } from "react";
import { astrologerService } from "@/services/astrologer";
import { AstrologerProfile } from "@/lib/types";
import { Radio, Clock, DollarSign, Languages, Award, CheckCircle, AlertCircle } from "lucide-react";

const AVAILABLE_SPECIALIZATIONS = [
  "Vedic Astrology",
  "Tarot Reading",
  "Numerology",
  "Vastu Shastra",
  "Palmistry",
  "Nadi Astrology",
  "KP Astrology",
  "Prashna Kundli",
  "Love & Relationships",
  "Career & Business",
];

const AVAILABLE_LANGUAGES = [
  "Hindi",
  "English",
  "Sanskrit",
  "Gujarati",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
];

export default function AvailabilityPage() {
  const [profile, setProfile] = useState<AstrologerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [isOnline, setIsOnline] = useState(false);
  const [perMinuteRate, setPerMinuteRate] = useState<number>(30);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await astrologerService.getMyProfile();
      setProfile(data);
      setIsOnline(data.is_online);
      setPerMinuteRate(data.per_minute_rate || 30);
      setSelectedSpecializations(data.specializations || []);
      setSelectedLanguages(data.languages || []);
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      setMessage({ type: "error", text: "Failed to load current availability settings." });
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
    try {
      setIsOnline(nextStatus);
      await astrologerService.toggleOnline(nextStatus);
      window.dispatchEvent(new CustomEvent('astro_online_status_changed', { detail: { isOnline: nextStatus } }));
      setMessage({
        type: "success",
        text: `You are now ${nextStatus ? "ONLINE — ready to receive consultation calls and chats." : "OFFLINE — no new requests will be routed to you."}`,
      });
    } catch (err: any) {
      setIsOnline(!nextStatus); // rollback
      setMessage({ type: "error", text: err.message || "Failed to update online status." });
    }
  };

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSaveRatesAndExpertise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await astrologerService.updateProfile({
        per_minute_rate: Number(perMinuteRate),
        specializations: selectedSpecializations,
        languages: selectedLanguages,
      });
      setMessage({ type: "success", text: "Availability, consulting rate, and expertise updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update availability profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#D97706] flex items-center gap-2">
          <Clock className="w-7 h-7 text-[#D97706]" />
          Availability & Service Rates
        </h1>
        <p className="text-[#71717A] text-sm mt-1 font-medium">
          Manage your live broadcast status, per-minute consultation charges, languages, and consultation domains.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-[#15803D]"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Online / Offline Quick Toggle Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#FDE68A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isOnline ? "bg-emerald-100 text-[#15803D] border border-emerald-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
            <Radio className={`w-7 h-7 ${isOnline ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-500 shadow-sm" : "bg-slate-400"}`}></span>
              <h2 className="text-lg font-black text-[#18181B]">Status: {isOnline ? "Broadcasting Online" : "Currently Offline"}</h2>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              {isOnline
                ? "Seekers can call or chat with you right now. Ensure your browser stays open."
                : "You will not receive any incoming chat or call requests until switched online."}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer ${
            isOnline
              ? "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200"
              : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-400/25"
          }`}
        >
          {isOnline ? "Switch Offline" : "Go Online Now"}
        </button>
      </div>

      {/* Rate & Expertise Configuration Form */}
      <form onSubmit={handleSaveRatesAndExpertise} className="space-y-6">
        {/* Per Minute Rate */}
        <div className="p-6 rounded-2xl bg-white border border-[#FDE68A] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#D97706]">Per-Minute Consultation Rate</h2>
              <p className="text-xs text-[#71717A]">Continuous authoritative billing tick charges customers every 60 seconds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-2">Rate (₹ per minute)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] font-bold">₹</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  step="1"
                  value={perMinuteRate}
                  onChange={(e) => setPerMinuteRate(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-4 py-3 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl text-[#18181B] font-bold text-lg focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#A16207] mt-1">Recommended range: ₹15 – ₹100 per minute.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] flex flex-col justify-center">
              <span className="text-xs text-[#71717A]">Your Net Earnings (80% after 20% platform fee):</span>
              <span className="text-xl font-black text-[#15803D] mt-1">₹{(perMinuteRate * 0.8).toFixed(2)} / min</span>
              <span className="text-[11px] text-[#71717A] mt-0.5">₹{(perMinuteRate * 0.8 * 15).toFixed(0)} for a 15-minute consultation</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="p-6 rounded-2xl bg-white border border-[#FDE68A] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#D97706]">Astrology Disciplines & Expertise</h2>
              <p className="text-xs text-[#71717A]">Select the domains you actively advise clients in.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_SPECIALIZATIONS.map((spec) => {
              const isSelected = selectedSpecializations.includes(spec);
              return (
                <button
                  type="button"
                  key={spec}
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#FEF08A] border-[#D97706] text-[#78350F] shadow-xs"
                      : "bg-[#FFFDF7] border-[#FDE68A] text-[#71717A] hover:border-[#D97706] hover:text-[#18181B]"
                  }`}
                >
                  {isSelected && <span className="mr-1.5 font-bold">✓</span>}
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div className="p-6 rounded-2xl bg-white border border-[#FDE68A] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#D97706]">Languages You Speak</h2>
              <p className="text-xs text-[#71717A]">Clients filter astrologers by language preference.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguages.includes(lang);
              return (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#FEF08A] border-[#D97706] text-[#78350F] shadow-xs"
                      : "bg-[#FFFDF7] border-[#FDE68A] text-[#71717A] hover:border-[#D97706] hover:text-[#18181B]"
                  }`}
                >
                  {isSelected && <span className="mr-1.5 font-bold">✓</span>}
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-400/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Availability Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
