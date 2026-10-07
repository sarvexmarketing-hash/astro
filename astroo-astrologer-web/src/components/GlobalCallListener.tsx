'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../context/SocketContext';
import IncomingRequestModal from './IncomingRequestModal';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function GlobalCallListener() {
  const router = useRouter();
  const { incomingRequest, incomingCall, acceptCall, rejectCall } = useSocket();

  return (
    <>
      {/* Incoming Chat/Call Request from Customer */}
      {incomingRequest && <IncomingRequestModal request={incomingRequest} />}

      {/* Incoming WebRTC Call Alert */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl text-center space-y-6">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30">
              {incomingCall.type === 'video' ? <Video className="h-10 w-10" /> : <Phone className="h-10 w-10" />}
              <span className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
                Incoming {incomingCall.type.toUpperCase()}
              </span>
              <h3 className="text-xl font-bold text-white">{incomingCall.callerName}</h3>
              <p className="text-xs text-slate-400 mt-1">Customer is ready to consult</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => rejectCall({ consultationId: incomingCall.consultationId, sessionId: incomingCall.sessionId })}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="h-4 w-4" />
                <span>Decline</span>
              </button>

              <button
                onClick={() => {
                  acceptCall({ consultationId: incomingCall.consultationId, sessionId: incomingCall.sessionId });
                  router.push(`/call/${incomingCall.consultationId}?type=${incomingCall.type}`);
                }}
                className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Phone className="h-4 w-4 fill-slate-950" />
                <span>Answer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
