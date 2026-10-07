"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { astrologerService } from "@/services/astrologer";
import { AstrologerProfile } from "@/lib/types";
import { User, Mail, Phone, BookOpen, ShieldCheck, CheckCircle, AlertCircle, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AstrologerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form fields
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await astrologerService.getMyProfile();
      setProfile(data);
      setBio(data.bio || "");
      setExperienceYears(data.experience_years || 0);
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      setMessage({ type: "error", text: "Failed to load astrologer profile details." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await astrologerService.updateProfile({
        bio,
        experience_years: Number(experienceYears),
      });
      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
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

  const isVerified = profile?.is_verified;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#D97706] flex items-center gap-2">
          <User className="w-7 h-7 text-amber-500" />
          Astrologer Profile & Credentials
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Your public biography, certification details, and verified credentials presented to seekers.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-rose-50 border-rose-300 text-rose-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Verification Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-center justify-between ${
          isVerified
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-300 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className={`w-8 h-8 ${isVerified ? "text-emerald-600" : "text-amber-600"}`} />
          <div>
            <h3 className="font-bold text-sm text-zinc-900">
              {isVerified ? "Verified Astrologer Credential" : "Verification Pending / Under Review"}
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              {isVerified
                ? "Your identity, certifications, and experience have been verified by Astrowave Admin."
                : "Your profile is under standard KYC and astrological verification. You can still customize your profile."}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isVerified ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
          }`}
        >
          {isVerified ? "Verified" : "Pending"}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Info (Read-only from User table) */}
        <div className="p-6 rounded-2xl bg-white border border-[#FDE68A] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#B45309] flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            Registered Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Full Name</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFDF7] border border-amber-200/80 rounded-xl text-zinc-900 font-medium text-sm">
                <User className="w-4 h-4 text-amber-600" />
                <span>{user?.fullName || "Astrologer"}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email Address</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFDF7] border border-amber-200/80 rounded-xl text-zinc-900 font-medium text-sm">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>{user?.email || "—"}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Phone Number</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFDF7] border border-amber-200/80 rounded-xl text-zinc-900 font-medium text-sm">
                <Phone className="w-4 h-4 text-amber-600" />
                <span>{user?.phone || "—"}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Platform Rating</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-[#FFFDF7] border border-amber-200/80 rounded-xl text-amber-700 font-bold text-sm">
                <span>⭐ {profile?.rating ? Number(profile.rating).toFixed(1) : "5.0"}</span>
                <span className="text-zinc-500 text-xs font-normal">({profile?.total_reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Form */}
        <div className="p-6 rounded-2xl bg-white border border-[#FDE68A] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#B45309] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Professional Details & Biography
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Years of Astrological Practice
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                required
                className="w-full max-w-xs px-4 py-3 bg-[#FFFDF7] border border-amber-300 rounded-xl text-zinc-900 font-semibold text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Astrological Bio & Philosophy
              </label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce your lineage, Gurus, areas of specialization, and your empathetic approach to reading client charts..."
                className="w-full px-4 py-3 bg-[#FFFDF7] border border-amber-300 rounded-xl text-zinc-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-zinc-500 mt-1">This bio will be shown prominently to seekers on your profile page.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Updating..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
