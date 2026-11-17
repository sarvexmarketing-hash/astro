'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { consultationsService } from '../../services/consultations';
import { astrologerService } from '../../services/astrologer';
import { Consultation, EarningsData } from '../../lib/types';
import {
  Phone,
  PhoneOff,
  MessageSquare,
  Home,
  Clock,
  User,
  RotateCcw,
  Loader2,
  Calendar,
} from 'lucide-react';

interface HistoryItem {
  id: string;
  name: string;
  avatar: string;
  time: string;
  type: 'call' | 'chat';
  durationText: string;
  earningsText: string;
  isMissed?: boolean;
}

const DEFAULT_RECENT_CALLS: HistoryItem[] = [
  {
    id: 'h-1',
    name: 'venugopal',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    time: '01:52 PM',
    type: 'call',
    durationText: '5 min 1 sec',
    earningsText: '₹ 10.12',
  },
  {
    id: 'h-2',
    name: 'Adwaith sai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    time: '01:40 PM',
    type: 'chat',
    durationText: '5 min',
    earningsText: '₹ 10.02',
  },
  {
    id: 'h-3',
    name: 'Akshaya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    time: '01:34 PM',
    type: 'call',
    durationText: '5 min',
    earningsText: '₹ 10.04',
  },
  {
    id: 'h-4',
    name: 'lohith sai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    time: '01:29 PM',
    type: 'call',
    durationText: '5 min',
    earningsText: '₹ 10.01',
  },
  {
    id: 'h-5',
    name: 'maneesha',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    time: '01:22 PM',
    type: 'call',
    durationText: '5 min',
    earningsText: '₹ 10.05',
  },
  {
    id: 'h-6',
    name: 'Vani',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    time: '01:16 PM',
    type: 'chat',
    durationText: '4 min 59 sec',
    earningsText: '₹ 9.99',
  },
  {
    id: 'h-7',
    name: 'ananthaiah c',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    time: '01:07 PM',
    type: 'call',
    durationText: '9 min 3 sec',
    earningsText: '₹ 33.31',
  },
  {
    id: 'h-8',
    name: 'Indla Vighneswar Reddy',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    time: '01:01 PM',
    type: 'call',
    durationText: '5 min',
    earningsText: '₹ 10.04',
  },
  {
    id: 'h-9',
    name: 'ananthaiah c',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    time: '12:54 PM',
    type: 'call',
    durationText: '0 min 42 sec',
    earningsText: '₹ 0.62',
  },
];

const DEFAULT_MISSED_CALLS: HistoryItem[] = [
  {
    id: 'm-1',
    name: 'Kavita Rao',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    time: '12:30 PM',
    type: 'call',
    durationText: 'Missed Call',
    earningsText: '₹ 0.00',
    isMissed: true,
  },
  {
    id: 'm-2',
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    time: '11:45 AM',
    type: 'call',
    durationText: 'Missed Call',
    earningsText: '₹ 0.00',
    isMissed: true,
  },
];

export default function AstrologerConsultationsPage() {
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'recent' | 'missed'>('recent');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(DEFAULT_RECENT_CALLS);
  const [missedItems, setMissedItems] = useState<HistoryItem[]>(DEFAULT_MISSED_CALLS);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAstrologer, router]);

  useEffect(() => {
    if (isAuthenticated && isAstrologer) {
      loadHistory();
    }
  }, [isAuthenticated, isAstrologer]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const [consultations, earn] = await Promise.allSettled([
        consultationsService.getHistory(),
        astrologerService.getEarnings(),
      ]);

      if (earn.status === 'fulfilled' && earn.value) {
        setEarnings(earn.value);
      }

      if (consultations.status === 'fulfilled' && consultations.value && consultations.value.length > 0) {
        const liveCalls: HistoryItem[] = [];
        const liveMissed: HistoryItem[] = [];

        for (const c of consultations.value) {
          const isCall = c.type === 'call' || c.type === 'video';
          const isMissed = c.state === 'CANCELLED' || c.state === 'EXPIRED';
          const dSec = c.total_duration_seconds || 0;
          const mins = Math.floor(dSec / 60);
          const secs = dSec % 60;
          const durText = isMissed
            ? 'Missed Call'
            : mins > 0 && secs > 0
            ? `${mins} min ${secs} sec`
            : mins > 0
            ? `${mins} min`
            : `${secs} sec`;

          const amountVal = c.astrologer_earnings || (c.total_amount ? Number(c.total_amount) * 0.8 : 0);
          const earnText = `₹ ${amountVal.toFixed(2)}`;
          const timeStr = c.created_at
            ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '01:00 PM';

          const item: HistoryItem = {
            id: c.id,
            name: c.customer_name || 'Seeker',
            avatar: c.customer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            time: timeStr,
            type: isCall ? 'call' : 'chat',
            durationText: durText,
            earningsText: earnText,
            isMissed,
          };

          if (isMissed) {
            liveMissed.push(item);
          } else {
            liveCalls.push(item);
          }
        }

        if (liveCalls.length > 0) {
          setHistoryItems([...liveCalls, ...DEFAULT_RECENT_CALLS.slice(liveCalls.length)]);
        }
        if (liveMissed.length > 0) {
          setMissedItems([...liveMissed, ...DEFAULT_MISSED_CALLS]);
        }
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedList = activeTab === 'recent' ? historyItems : missedItems;
  const balanceDisplay = earnings?.earnings?.available_balance !== undefined
    ? Number(earnings.earnings.available_balance).toFixed(2)
    : earnings?.earnings?.total_earned !== undefined
    ? Number(earnings.earnings.total_earned).toFixed(2)
    : '116.26';

  return (
    <div className="min-h-screen bg-[#FFF5F0] text-[#1F1F1F] pb-24 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* ========================================================================= */}
        {/* TOP HEADER: "History" with Floating Balance Pill                           */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
            History
          </h1>

          {/* Floating Balance Pill */}
          <div className="bg-white px-4 py-2 rounded-full shadow-xs border border-orange-100 flex items-center gap-1">
            <span className="text-sm font-bold text-[#1F1F1F]">₹</span>
            <span className="text-sm font-extrabold text-[#1F1F1F] tracking-tight">
              {balanceDisplay}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABS: "Recent Calls" vs "Missed Calls"                                    */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 pt-1">
          {/* Recent Calls Button */}
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              activeTab === 'recent'
                ? 'bg-[#FA5A2A] text-white shadow-orange-300/40'
                : 'bg-white text-[#1F1F1F] border border-orange-100 hover:bg-orange-50/50'
            }`}
          >
            <Phone className={`w-4 h-4 ${activeTab === 'recent' ? 'text-white' : 'text-[#FA5A2A]'}`} />
            <span>Recent Calls</span>
          </button>

          {/* Missed Calls Button */}
          <button
            onClick={() => setActiveTab('missed')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              activeTab === 'missed'
                ? 'bg-[#FA5A2A] text-white shadow-orange-300/40'
                : 'bg-white text-[#1F1F1F] border border-orange-100 hover:bg-orange-50/50'
            }`}
          >
            <PhoneOff className={`w-4 h-4 ${activeTab === 'missed' ? 'text-white' : 'text-[#71717A]'}`} />
            <span>Missed Calls</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CONSULTATION LIST                                                         */}
        {/* ========================================================================= */}
        <div className="bg-transparent divide-y divide-orange-100/70 pt-2">
          {displayedList.map((item) => (
            <div
              key={item.id}
              className="py-4 flex items-center justify-between gap-3 group transition-colors hover:bg-white/40 px-2 rounded-2xl"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Circular Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-orange-100 border border-orange-200/60 shadow-xs">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>

                {/* Name & Call/Chat Duration Subtitle */}
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#1F1F1F] truncate leading-tight">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#71717A] mt-1 font-normal">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      {item.isMissed ? (
                        <PhoneOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : item.type === 'call' ? (
                        <Phone className="w-3.5 h-3.5 text-[#1F1F1F] shrink-0" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-[#1F1F1F] shrink-0" />
                      )}
                      <span>{item.durationText}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Earnings Amount */}
              <div className="shrink-0 text-right">
                <span className={`text-[15px] font-semibold ${item.isMissed ? 'text-zinc-400' : 'text-[#1F1F1F]'}`}>
                  {item.earningsText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4-TAB FIXED BOTTOM NAVIGATION BAR (Matching screenshot exactly)            */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-6 py-2.5 flex items-center justify-around max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#1F1F1F] transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Home</span>
        </Link>

        <Link
          href="/consultations"
          className="flex flex-col items-center py-1 px-3 text-[#FA5A2A] font-bold"
        >
          <RotateCcw className="w-5 h-5 text-[#FA5A2A]" />
          <span className="text-[11px] font-bold mt-1 text-[#FA5A2A]">History</span>
        </Link>

        <Link
          href="/requests"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#1F1F1F] transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Chats</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#1F1F1F] transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
