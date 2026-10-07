'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket, IncomingConsultationRequest } from '../../context/SocketContext';
import { consultationsService } from '../../services/consultations';
import { Consultation } from '../../lib/types';
import {
  MessageSquare,
  Phone,
  Video,
  Check,
  X,
  Clock,
  Sparkles,
  Loader2,
  Users,
} from 'lucide-react';

export default function ConsultationRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();
  const { incomingRequest, clearIncomingRequest } = useSocket();

  const [pendingConsultations, setPendingConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAstrologer]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const list = await consultationsService.getHistory();
      const pending = list.filter((c) => ['REQUESTED', 'ACCEPTED'].includes(c.state));
      setPendingConsultations(pending);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAstrologer) {
      loadRequests();
    }
  }, [isAuthenticated, isAstrologer]);

  const handleAccept = async (consultationId: string, type: string) => {
    try {
      setIsProcessingId(consultationId);
      await consultationsService.accept(consultationId);
      clearIncomingRequest();

      if (type === 'chat') {
        router.push(`/chat/${consultationId}`);
      } else {
        router.push(`/call/${consultationId}?type=${type}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error accepting consultation');
      setIsProcessingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#D97706] tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#D97706]" />
          <span>Consultation Requests Queue</span>
        </h1>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Incoming live chat, voice call, and video requests from seekers</p>
      </div>

      {/* Realtime Live Active Notification */}
      {incomingRequest && (
        <div className="rounded-3xl p-6 border-2 border-amber-400 bg-gradient-to-r from-[#FEF9C3] to-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase">
              <span className="h-2 w-2 rounded-full bg-slate-950 animate-ping" />
              Incoming Live Request!
            </span>
            <span className="text-xs text-[#B45309] font-black">₹{incomingRequest.ratePerMinute}/min</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
              {incomingRequest.type === 'video' ? <Video className="h-7 w-7" /> : incomingRequest.type === 'chat' ? <MessageSquare className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#18181B]">{incomingRequest.customerName}</h3>
              <p className="text-xs text-[#71717A]">Requested a live {incomingRequest.type} consultation</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleAccept(incomingRequest.consultationId, incomingRequest.type)}
              disabled={Boolean(isProcessingId)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-400/30 cursor-pointer disabled:opacity-50"
            >
              {isProcessingId === incomingRequest.consultationId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Accept & Connect Live</span>
            </button>

            <button
              onClick={clearIncomingRequest}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#3F3F46] font-bold text-xs cursor-pointer border border-slate-200"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Pending Queue List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FDE68A] shadow-xs space-y-6">
        <h2 className="text-base font-black text-[#D97706] border-b border-[#FDE68A] pb-3">Waiting Queue</h2>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
          </div>
        ) : pendingConsultations.length > 0 ? (
          <div className="divide-y divide-[#FDE68A]/60">
            {pendingConsultations.map((c) => (
              <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] text-[#D97706] flex items-center justify-center shrink-0">
                    {c.type === 'chat' ? <MessageSquare className="h-5 w-5" /> : c.type === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#18181B]">{c.customer_name || 'Customer'}</h4>
                    <p className="text-xs text-[#71717A]">
                      {c.type.toUpperCase()} • Requested {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className="font-bold text-[#B45309]">₹{c.rate_per_minute}/min</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(c.id, c.type)}
                    disabled={Boolean(isProcessingId)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/25 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Accept Request</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#71717A] text-xs space-y-2">
            <Users className="h-8 w-8 mx-auto text-[#A16207]" />
            <p className="text-[#18181B] font-bold text-sm">No Pending Requests</p>
            <p>Your queue is clear. New incoming consultation requests will pop up automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
