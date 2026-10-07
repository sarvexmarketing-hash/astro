'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Astrologer } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { consultationsService } from '../services/consultations';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  Phone,
  Video,
  Languages,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onInsufficientBalance?: (requiredAmount: number, astrologer: Astrologer) => void;
}

export default function AstrologerCard({ astrologer, onInsufficientBalance }: AstrologerCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isInitiating, setIsInitiating] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartConsultation = async (type: 'chat' | 'call' | 'video') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/astrologers/${astrologer.id}`);
      return;
    }

    try {
      setIsInitiating(type);
      setErrorMessage(null);
      const consultation = await consultationsService.create({
        astrologerId: astrologer.id,
        type,
      });

      if (type === 'chat') {
        router.push(`/chat/${consultation.id}`);
      } else {
        router.push(`/call/${consultation.id}?type=${type}&caller=true`);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to start consultation';
      if (msg.includes('Insufficient wallet balance') && onInsufficientBalance) {
        onInsufficientBalance(astrologer.per_minute_rate * 5, astrologer);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsInitiating(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 flex flex-col justify-between border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all relative overflow-hidden group">
      {/* Top Section */}
      <div>
        <div className="flex gap-4 items-start">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            <Link href={`/astrologers/${astrologer.id}`}>
              {astrologer.avatar_url ? (
                <img
                  src={astrologer.avatar_url}
                  alt={astrologer.display_name}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-300 shadow-xs group-hover:border-[#F7C93E] transition-colors"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-amber-800 font-bold text-2xl shadow-xs">
                  {astrologer.display_name.charAt(0)}
                </div>
              )}
            </Link>

            {/* Status Dot */}
            <span
              className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold border-2 border-white flex items-center gap-1 shadow-xs ${
                astrologer.is_busy
                  ? 'bg-amber-500 text-white'
                  : astrologer.is_online
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-400 text-white'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                astrologer.is_busy ? 'bg-white' : astrologer.is_online ? 'bg-white animate-pulse' : 'bg-zinc-200'
              }`} />
              {astrologer.is_busy ? 'Busy' : astrologer.is_online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Link href={`/astrologers/${astrologer.id}`}>
                <h3 className="font-bold text-[#18181B] text-base truncate hover:text-[#D97706] transition-colors">
                  {astrologer.display_name}
                </h3>
              </Link>
              {astrologer.is_verified && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 fill-emerald-100" />
              )}
            </div>

            {/* Specialization Tags */}
            <p className="text-xs text-[#71717A] truncate mt-0.5 font-medium">
              {astrologer.specializations?.length ? astrologer.specializations.slice(0, 3).join(', ') : 'Vedic Astrology'}
            </p>

            {/* Languages */}
            <div className="flex items-center gap-1 text-[11px] text-[#71717A] mt-1">
              <Languages className="h-3 w-3 shrink-0 text-[#B45309]" />
              <span className="truncate">{astrologer.languages?.join(', ') || 'English, Hindi'}</span>
            </div>

            {/* Experience & Consultations */}
            <div className="flex items-center gap-1 text-[11px] text-[#71717A] mt-0.5">
              <Briefcase className="h-3 w-3 shrink-0 text-[#B45309]" />
              <span>{astrologer.experience_years || 5}+ yrs exp</span>
              <span className="mx-1">•</span>
              <span>{astrologer.total_consultations || 100}+ orders</span>
            </div>
          </div>
        </div>

        {/* Rating and Price Row */}
        <div className="mt-4 pt-3 border-t border-[#FDE68A]/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-[#FEF08A] border border-[#F7C93E] px-2 py-0.5 rounded-lg shadow-2xs">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-[#78350F]">
                {astrologer.rating ? Number(astrologer.rating).toFixed(1) : '5.0'}
              </span>
            </div>
            <span className="text-[11px] text-[#71717A]">
              ({astrologer.total_reviews || 24} reviews)
            </span>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-[#18181B]">
              ₹{astrologer.per_minute_rate || 20}
            </span>
            <span className="text-[10px] text-[#71717A]">/min</span>
          </div>
        </div>

        {/* Inline Error if any */}
        {errorMessage && (
          <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-300 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-2 border-t border-[#FDE68A]/60">
        <button
          onClick={() => handleStartConsultation('chat')}
          disabled={Boolean(isInitiating) || astrologer.is_busy}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#78350F] border border-[#FDE68A] transition-all font-bold text-xs gap-1 disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          {isInitiating === 'chat' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4 text-[#D97706]" />
          )}
          <span>Chat</span>
        </button>

        <button
          onClick={() => handleStartConsultation('call')}
          disabled={Boolean(isInitiating) || astrologer.is_busy}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#78350F] border border-[#FDE68A] transition-all font-bold text-xs gap-1 disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          {isInitiating === 'call' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Phone className="h-4 w-4 text-[#16A34A]" />
          )}
          <span>Call</span>
        </button>

        <button
          onClick={() => handleStartConsultation('video')}
          disabled={Boolean(isInitiating) || astrologer.is_busy}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#78350F] border border-[#FDE68A] transition-all font-bold text-xs gap-1 disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          {isInitiating === 'video' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-4 w-4 text-[#A21CAF]" />
          )}
          <span>Video</span>
        </button>
      </div>
    </div>
  );
}
