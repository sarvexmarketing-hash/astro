'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { consultationsService } from '../../services/consultations';
import { Consultation } from '../../lib/types';
import {
  History,
  MessageSquare,
  Phone,
  Video,
  Clock,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AstrologerConsultationsPage() {
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAstrologer]);

  useEffect(() => {
    if (isAuthenticated && isAstrologer) {
      consultationsService.getHistory().then((list) => {
        setConsultations(list);
      }).catch((err) => {
        console.error('Error fetching consultations:', err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isAuthenticated, isAstrologer]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#D97706] tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-[#D97706]" />
          <span>Consultation History</span>
        </h1>
        <p className="text-xs text-[#71717A] mt-1 font-medium">
          Complete archive of past chat, voice, and video consultation sessions
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FDE68A] shadow-xs space-y-4">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          </div>
        ) : consultations.length > 0 ? (
          <div className="divide-y divide-[#FDE68A]/60">
            {consultations.map((c) => {
              const isActive = ['REQUESTED', 'ACCEPTED', 'ACTIVE', 'IN_PROGRESS'].includes(c.state);
              return (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] text-[#D97706] flex items-center justify-center shrink-0">
                      {c.type === 'chat' ? (
                        <MessageSquare className="h-6 w-6 text-[#D97706]" />
                      ) : c.type === 'video' ? (
                        <Video className="h-6 w-6 text-[#D97706]" />
                      ) : (
                        <Phone className="h-6 w-6 text-[#D97706]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-[#18181B] text-base">{c.customer_name || 'Seeker'}</h3>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isActive ? 'bg-emerald-100 text-[#15803D] border border-emerald-200' : 'bg-slate-100 text-[#71717A]'
                          }`}
                        >
                          {c.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#71717A] mt-1 font-medium">
                        <span className="capitalize">{c.type}</span>
                        <span>•</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-bold text-[#B45309]">₹{c.rate_per_minute}/min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <Link
                        href={c.type === 'chat' ? `/chat/${c.id}` : `/call/${c.id}?type=${c.type}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/25 cursor-pointer"
                      >
                        <span>Resume Session</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <div className="text-right">
                        <div className="text-sm font-black text-[#18181B]">₹{c.total_amount || 0}</div>
                        <div className="text-[10px] text-[#15803D] font-black">
                          Net: ₹{c.total_amount ? (Number(c.total_amount) * 0.8).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-[#71717A] text-xs">
            No consultations recorded yet. Go online to begin taking client sessions.
          </div>
        )}
      </div>
    </div>
  );
}
