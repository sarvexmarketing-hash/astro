"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applicationsService } from "@/services/applications";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  Copy,
  Clock,
  Award,
  Video,
  FileCheck,
  X,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";

const EXPERTISE_OPTIONS = [
  "Vedic Astrology",
  "Numerology",
  "Face Reading",
  "Palmistry",
  "Vastu Shastra",
  "Prashna Astrology",
  "Horoscope / Jathakam Analysis",
  "Muhurtham",
  "Other",
];

const LANGUAGE_OPTIONS = [
  "Telugu",
  "English",
  "Hindi",
  "Tamil",
  "Kannada",
  "Other",
];

export default function AstrologerRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Vedic Astrology"]);
  const [otherSkill, setOtherSkill] = useState("");

  // Languages
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Telugu", "English"]);
  const [otherLanguage, setOtherLanguage] = useState("");

  // Professional Verification
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("5");
  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [consultationExperience, setConsultationExperience] = useState("");
  const [location, setLocation] = useState("");
  const [introVideo, setIntroVideo] = useState("");

  // Documents
  const [certificates, setCertificates] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ name: string; dataUrl: string }>>([]);

  // Declaration
  const [isConfirmed, setIsConfirmed] = useState(false);

  // UI Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    applicationId: string;
    submittedAt: string;
    status: string;
    fullName: string;
    displayName: string;
    email: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState(false);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (.jpg, .jpeg, .png, .webp)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile photo size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Certificate Upload
  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`Certificate "${file.name}" exceeds 10MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCertificates((prev) => [...prev, { name: file.name, dataUrl: reader.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Document Upload
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`Document "${file.name}" exceeds 10MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setDocuments((prev) => [...prev, { name: file.name, dataUrl: reader.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleCopyApplicationId = () => {
    if (submittedData?.applicationId) {
      navigator.clipboard.writeText(submittedData.applicationId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your legal full name as on government ID");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please provide a valid contact mobile number");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!avatarUrl) {
      setErrorMessage("Profile photo is required. Please upload a clear practitioner portrait.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!displayName.trim()) {
      setErrorMessage("Display name in app is required (e.g. Astro Ravi)");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (selectedSkills.length === 0) {
      setErrorMessage("Please select at least one area of expertise");
      return;
    }

    if (selectedSkills.includes("Other") && !otherSkill.trim()) {
      setErrorMessage("Please specify your other expertise");
      return;
    }

    if (selectedLanguages.length === 0) {
      setErrorMessage("Please select at least one consultation language");
      return;
    }

    if (selectedLanguages.includes("Other") && !otherLanguage.trim()) {
      setErrorMessage("Please specify your other language");
      return;
    }

    if (!isConfirmed) {
      setErrorMessage("You must accept the confirmation declaration before submitting");
      return;
    }

    try {
      setIsLoading(true);

      const cleanPhone = phone.trim().startsWith("+") ? phone.trim() : `+91${phone.replace(/\D/g, "")}`;

      const res = await applicationsService.submitApplication({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        profilePhoto: avatarUrl,
        displayName: displayName.trim(),
        skills: selectedSkills,
        otherSkill: selectedSkills.includes("Other") ? otherSkill.trim() : undefined,
        languages: selectedLanguages,
        otherLanguage: selectedLanguages.includes("Other") ? otherLanguage.trim() : undefined,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        bio: bio.trim(),
        specializations: specializations.trim() || undefined,
        consultationExperience: consultationExperience.trim() || undefined,
        location: location.trim() || undefined,
        introVideo: introVideo.trim() || undefined,
        certificates: certificates.map((c) => c.dataUrl),
        documents: documents.map((d) => d.dataUrl),
        isConfirmed: true,
        password: password.trim() || undefined,
      });

      setSubmittedData({
        applicationId: res.applicationId,
        submittedAt: res.submittedAt || new Date().toISOString(),
        status: res.status || "SUBMITTED",
        fullName: fullName.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Verification application error:", err);
      setErrorMessage(err.message || "Failed to submit application. Please check your network and inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // CONFIRMATION VIEW (When Application is Submitted)
  // =========================================================================
  if (submittedData) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#FFFDF7] via-[#FFFBEB] to-[#FEF3C7] py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-[#FDE68A] shadow-xl p-8 sm:p-10 text-center space-y-6">
          {/* Animated Gold Ring & Icon */}
          <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-[#78350F] border border-amber-300 mb-2">
              Application Under Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Application Submitted Successfully!
            </h1>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Thank you for applying to become an AstroWave astrologer. Your application has been successfully submitted and is now under review by our verification team.
            </p>
          </div>

          {/* Application Details Summary Card */}
          <div className="bg-[#FFFDF7] rounded-2xl border border-[#FDE68A] p-5 text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#FDE68A]">
              <span className="text-xs text-zinc-500 font-medium">Application ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {submittedData.applicationId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyApplicationId}
                  className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copiedId && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-500 font-medium">Practitioner Name</span>
              <span className="text-xs font-bold text-zinc-800">{submittedData.fullName}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-500 font-medium">Display Name in App</span>
              <span className="text-xs font-bold text-amber-800">{submittedData.displayName}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-500 font-medium">Submission Date</span>
              <span className="text-xs text-zinc-700 font-medium">
                {new Date(submittedData.submittedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#FDE68A]">
              <span className="text-xs text-zinc-500 font-medium">Current Status</span>
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Under Review</span>
              </span>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-left text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Verification Policy:</strong> To protect seekers and maintain spiritual authenticity, all practitioner profiles must undergo document & credential checks before appearing publicly on the AstroWave Customer App. You will receive email/SMS updates on review progress.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold text-xs transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-200 transition-all"
            >
              Go to Astrologer Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN REGISTRATION FORM VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFFBEB] to-[#FEF3C7] py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Already applied? Go to Astrologer Login</span>
          </Link>
        </div>

        {/* Header Title & Subtitle */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Astrologer Verification & Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Become an AstroWave Astrologer
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Join AstroWave and connect with clients looking for trusted astrology and spiritual guidance.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2 shadow-xs">
            <X className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ===================================================================== */}
          {/* 1. BASIC INFORMATION                                                  */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-[#FDE68A] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#FDE68A]">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Basic Information</h2>
                <p className="text-xs text-zinc-500">Your personal identity and public practitioner portrait</p>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-amber-300 bg-amber-50 shrink-0 shadow-xs flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Practitioner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-700 text-center p-2">
                    <Camera className="w-7 h-7 text-amber-600" />
                    <span className="text-[10px] font-bold mt-1">Photo *</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1"
                >
                  <Upload className="w-4 h-4" />
                  <span>Change</span>
                </button>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#78350F] border border-amber-300 font-bold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4 text-amber-700" />
                  <span>Upload Profile Photo *</span>
                </button>
                <p className="text-xs text-zinc-500 leading-tight">
                  Upload a clear portrait photo. This image will be shown on your astrologer card and call screens on the Seeker Portal once approved (.jpg or .png, max 5MB).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Full Name (as on Government ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Display Name in App */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Display Name in App <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Sparkles className="w-4 h-4 text-amber-500 absolute left-3.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Astro Ravi, Acharya Ramesh"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">This name will be publicly visible to seekers.</p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Mobile Number (with WhatsApp/SMS) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-zinc-500">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-11 pl-12 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="astrologer@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Password for Astrologer Portal */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Create Astrologer Portal Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password (min 6 characters)"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Used to access your Astrologer Command Center after application approval.
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 2. ASTROLOGY SKILLS / EXPERTISE                                       */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-[#FDE68A] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#FDE68A]">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Your Areas of Expertise</h2>
                <p className="text-xs text-zinc-500">Select all astrology and spiritual domains you practice (multi-select)</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {EXPERTISE_OPTIONS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-xs scale-102"
                        : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:border-amber-300"
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-700 fill-amber-300" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-300" />
                    )}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>

            {/* Other Expertise Text Input */}
            {selectedSkills.includes("Other") && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Please specify your expertise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otherSkill}
                  onChange={(e) => setOtherSkill(e.target.value)}
                  placeholder="e.g. Nadi Astrology, KP System, Lal Kitab, Gemology"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* 3. LANGUAGES                                                          */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-[#FDE68A] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#FDE68A]">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Languages You Are Comfortable With</h2>
                <p className="text-xs text-zinc-500">Languages in which you can conduct live audio and chat consultations</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-xs scale-102"
                        : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:border-amber-300"
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-700 fill-amber-300" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-300" />
                    )}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>

            {/* Other Language Text Input */}
            {selectedLanguages.includes("Other") && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Please specify language <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otherLanguage}
                  onChange={(e) => setOtherLanguage(e.target.value)}
                  placeholder="e.g. Malayalam, Marathi, Bengali, Sanskrit"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* 4. PROFESSIONAL VERIFICATION                                          */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-[#FDE68A] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#FDE68A]">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                4
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Professional Verification</h2>
                <p className="text-xs text-zinc-500">Share your consultation background, experience and credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Years of Experience */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Current Location */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Current Location (City, State)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Specializations / Focus Areas
                </label>
                <input
                  type="text"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="e.g. Marriage Matching, Career Guidance, Business Growth, Gemstone Remedies"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Professional Bio / About You */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Professional Bio / About You <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your background, lineage/parampara, study of astrological scriptures, and consultation philosophy..."
                  className="w-full p-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
                <p className="text-[11px] text-zinc-400 mt-1">This bio will be displayed on your verified practitioner profile.</p>
              </div>

              {/* Consultation Experience */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Consultation Experience (Clients served, past platforms, ashram work)
                </label>
                <textarea
                  rows={2}
                  value={consultationExperience}
                  onChange={(e) => setConsultationExperience(e.target.value)}
                  placeholder="e.g. Over 5,000+ Kundli consultations conducted across temple trust camps and private consultations..."
                  className="w-full p-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Optional Intro Video Link */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-900 mb-1">
                  Optional Introduction Video URL (YouTube, Drive, or Loom link)
                </label>
                <div className="relative flex items-center">
                  <Video className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="url"
                    value={introVideo}
                    onChange={(e) => setIntroVideo(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Optional Certificates Upload */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-zinc-900">
                  Optional Certificates / Awards / Gurukul Credentials
                </label>
                <input
                  ref={certInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleCertUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => certInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-zinc-700 flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Upload Certificates (PDF / Images)</span>
                </button>
                {certificates.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {certificates.map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span className="truncate max-w-[150px]">{cert.name}</span>
                        <button
                          type="button"
                          onClick={() => setCertificates((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Supporting Documents Upload */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-zinc-900">
                  Optional Supporting Documents (ID Card, References)
                </label>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleDocUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-zinc-700 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Upload Supporting Documents (PDF / Images)</span>
                </button>
                {documents.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {documents.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 text-[11px] font-medium"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate max-w-[150px]">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-4 border-t border-[#FDE68A]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 text-amber-600 focus:ring-amber-500 border-zinc-300"
                  required
                />
                <span className="text-xs text-zinc-700 leading-snug">
                  <strong>I confirm that the information provided by me is accurate and complete.</strong> I agree to undergo practitioner credential verification and abide by AstroWave's ethical consultation standards.
                </span>
              </label>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 5. SUBMIT APPLICATION CTA                                             */}
          {/* ===================================================================== */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-amber-300/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Verification Application...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-950" />
                  <span>Apply for Verification</span>
                </div>
              )}
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-2.5">
              🔒 Submitting this form creates a verification application in SUBMITTED status. Your profile will become publicly visible on AstroWave upon Admin approval.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
