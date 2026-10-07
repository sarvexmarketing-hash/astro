'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Phone, Mail, User, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone && !email) {
      setError('Please provide either phone number or email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        fullName: fullName.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        email: email.trim() ? email.trim() : undefined,
        password,
      });

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 space-y-6 border border-[#FDE68A] shadow-xl relative">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF9C3] text-[#D97706] border border-[#FDE68A] shadow-xs">
            <Sparkles className="h-7 w-7 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-[#18181B] tracking-tight">Create Customer Account</h2>
          <p className="text-xs text-[#71717A]">Join Astrowave to start your spiritual journey</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-red-300 text-[#991B1B] text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Phone Number (Optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#71717A]">+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-white border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Email Address (Optional)</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-[#18181B]" /> : <span>Sign Up Free</span>}
          </button>
        </form>

        <div className="pt-4 border-t border-[#FDE68A]/60 text-center text-xs text-[#71717A]">
          <span>Already registered? </span>
          <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-[#D97706] font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
