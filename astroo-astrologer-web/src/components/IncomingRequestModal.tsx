'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, IncomingConsultationRequest } from '../context/SocketContext';
import { consultationsService } from '../services/consultations';
import { MessageSquare, Phone, Video, Check, X, Loader2, Sparkles } from 'lucide-react';

interface ModalProps {
  request: IncomingConsultationRequest;
}

export default function IncomingRequestModal({ request }: ModalProps) {
  const router = useRouter();
  const { clearIncomingRequest } = useSocket();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await consultationsService.accept(request.consultationId);
      clearIncomingRequest();

      if (request.type === 'chat') {
        router.push(`/chat/${request.consultationId}`);
      } else {
        router.push(`/call/${request.consultationId}?type=${request.type}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error accepting consultation');
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    clearIncomingRequest();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/30">
          {request.type === 'chat' ? (
            <MessageSquare className="h-9 w-9 fill-slate-950" />
          ) : request.type === 'video' ? (
            <Video className="h-9 w-9 fill-current" />
          ) : (
            <Phone className="h-9 w-9 fill-current" />
          )}
          <span className="absolute inset-0 rounded-3xl border-2 border-amber-400 animate-ping" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-2">
            New {request.type.toUpperCase()} Request
          </span>
          <h3 className="text-xl font-black text-white">{request.customerName}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Earn ₹{request.ratePerMinute}/min during consultation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDecline}
            disabled={isAccepting}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Decline</span>
          </button>

          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>Accept Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}
