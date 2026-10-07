"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, Lock, Mail, Phone, User } from "lucide-react";

export default function AstrologerRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name as on government ID");
      return;
    }
    if (!phone && !email) {
      setErrorMessage("Please provide a phone number or email");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await register({
        fullName: fullName.trim(),
        phone: phone.trim() ? `+91${phone.replace(/\D/g, "")}` : undefined,
        email: email.trim() ? email.trim() : undefined,
        password,
      });

      router.replace("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please check inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col">
      {/* TopAppBar (RegisterScreen.kt line 48) */}
      <header className="h-14 border-b border-[#FDE68A]/60 bg-white/70 backdrop-blur-md px-4 flex items-center gap-3 sticky top-0 z-20">
        <Link href="/login" className="p-2 -ml-2 text-[#18181B] hover:text-[#D97706]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-[#18181B]">Astrologer Application</h1>
      </header>

      {/* Main Container (RegisterScreen.kt lines 60-179) */}
      <div className="flex-1 max-w-sm w-full mx-auto px-6 py-8 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#18181B]">
            Join as a Verified Astrologer
          </h2>
          <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
            Provide genuine consultations, live poojas, and muhurat calculations across India.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#18181B] mb-1">
              Full Name (e.g. Acharya Ramesh Sharma)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Full name as on ID"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F7C93E] focus:ring-1 focus:ring-[#F7C93E]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18181B] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="astrologer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F7C93E] focus:ring-1 focus:ring-[#F7C93E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18181B] mb-1">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-semibold text-[#71717A]">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full h-12 pl-13 pr-4 rounded-xl border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F7C93E] focus:ring-1 focus:ring-[#F7C93E]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18181B] mb-1">
              Create Password (min 6 chars)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-[#E4E4E7] bg-white text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F7C93E] focus:ring-1 focus:ring-[#F7C93E]"
              required
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#1E1E1E] font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Create Profile & Continue</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-[#71717A]">
          <span>Already have an account? </span>
          <Link href="/login" className="font-bold text-[#D97706] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
