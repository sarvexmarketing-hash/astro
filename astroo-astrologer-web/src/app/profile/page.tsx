"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { astrologerService } from "@/services/astrologer";
import { usersService } from "@/services/users";
import { AstrologerProfile } from "@/lib/types";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Save,
  Camera,
  Upload,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setAvatarUrl(data.avatar_url || user?.avatarUrl || user?.avatar_url || "");
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      setMessage({ type: "error", text: "Failed to load astrologer profile details." });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload a valid image file (.jpg, .jpeg, .png, .webp)" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image file size must be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      // Save photo & bio to user profile
      await usersService.updateProfile({
        avatarUrl,
        bio,
      });

      // Save professional details to astrologer profile
      await astrologerService.updateProfile({
        bio,
        experience_years: Number(experienceYears),
      });

      // Refresh auth context so header, sidebar, and dashboard display the new photo
      await refreshUser();

      setMessage({
        type: "success",
        text: "Profile photo and credentials updated successfully! Your updated photo is now live on the Customer Portal.",
      });
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
          Manage your public photo, biography, and verified credentials shown to seekers on the Customer Portal.
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
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
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
                : "Your profile is under standard KYC and astrological verification. You can still customize your profile and photo."}
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
        {/* ========================================================================= */}
        {/* 1. PROFILE PHOTO MANAGEMENT CARD (Change photo whenever you want)         */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white border border-[#FDE68A] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#B45309] flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <span>Practitioner Profile Photo</span>
            </h2>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
              Live on Customer Portal
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Round Avatar Preview */}
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-3 border-[#F7C93E] shadow-sm bg-orange-50 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Practitioner Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-amber-700">
                  <User className="w-10 h-10" />
                  <span className="text-[10px] mt-1 font-bold">No Photo</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-1"
              >
                <Upload className="w-5 h-5" />
                <span>Change</span>
              </button>
            </div>

            {/* Photo Action Controls */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">
                  {user?.fullName || profile?.display_name || "Astrologer"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  This photo is shown on your astrologer card, search listings, live chat headers, and call screens on the Seeker Portal.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#78350F] border border-amber-300 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4 text-[#B45309]" />
                  <span>Upload New Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. REGISTERED ACCOUNT INFORMATION                                         */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white border border-[#FDE68A] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#B45309] flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <span>Registered Account Information</span>
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

        {/* ========================================================================= */}
        {/* 3. PROFESSIONAL DETAILS & BIOGRAPHY                                       */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white border border-[#FDE68A] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#B45309] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Professional Details & Biography</span>
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

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Profile & Photo...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Details & Photo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
