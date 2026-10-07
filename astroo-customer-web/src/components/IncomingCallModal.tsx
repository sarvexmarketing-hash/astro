'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, IncomingCallData } from '../context/SocketContext';
import { Phone, Video, PhoneOff, Sparkles } from 'lucide-react';

interface IncomingCallModalProps {
  incomingCall: IncomingCallData;
}

export default function IncomingCallModal({ incomingCall }: IncomingCallModalProps) {
  const router = useRouter();
  const { acceptCall, rejectCall } = useSocket();

  const handleAccept = () => {
    acceptCall({
      consultationId: incomingCall.consultationId,
      sessionId: incomingCall.sessionId,
    });
    router.push(`/call/${incomingCall.consultationId}?type=${incomingCall.type}&incoming=true&session=${incomingCall.sessionId}`);
  };

  const handleReject = () => {
    rejectCall({
      consultationId: incomingCall.consultationId,
      sessionId: incomingCall.sessionId,
      reason: 'declined',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-[#FDE68A] bg-white p-6 shadow-2xl text-center space-y-6">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FEF08A] text-[#78350F] border-2 border-[#F7C93E] shadow-xl">
          {incomingCall.type === 'video' ? (
            <Video className="h-10 w-10 animate-bounce text-[#78350F]" />
          ) : (
            <Phone className="h-10 w-10 animate-bounce text-[#78350F]" />
          )}
          <span className="absolute inset-0 rounded-full border-4 border-[#F7C93E]/60 animate-ping" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#FEF9C3] border border-[#FDE68A] text-[11px] font-bold text-[#78350F] uppercase tracking-widest mb-2">
            Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call
          </span>
          <h3 className="text-xl font-bold text-[#18181B]">{incomingCall.callerName}</h3>
          <p className="text-xs text-[#71717A] mt-1">Astrologer is calling for consultation</p>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2">
          {/* Reject */}
          <button
            onClick={handleReject}
            className="flex flex-col items-center gap-2 text-xs font-semibold text-rose-600 group cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-300 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
              <PhoneOff className="h-6 w-6" />
            </div>
            <span>Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 text-xs font-semibold text-emerald-700 group cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <Phone className="h-6 w-6" />
            </div>
            <span>Accept Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
