'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../context/SocketContext';
import IncomingRequestModal from './IncomingRequestModal';
import { Phone, PhoneOff, Video, Bell, X } from 'lucide-react';

export default function GlobalCallListener() {
  const router = useRouter();
  const { incomingRequest, incomingCall, acceptCall, rejectCall, waitingSeekers, dismissWaitingSeeker } = useSocket();

  return (
    <>
      {/* Realtime Waiting Seeker Alert Banner (Non-disruptive reminder during live Chat/Call) */}
      {waitingSeekers.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-amber-400 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30">
                <Bell className="h-5 w-5 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white">
                  {waitingSeekers.length}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                    Next Seeker Waiting
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-0.5">
                  <strong className="text-amber-300">{waitingSeekers[0].customerName}</strong> is waiting for you!
                </h4>
                <p className="text-[11px] text-amber-200/80 truncate">
                  Requested {waitingSeekers[0].type.toUpperCase()} • Please wrap up when ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => dismissWaitingSeeker(waitingSeekers[0].consultationId)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Got It
              </button>
              <button
                onClick={() => dismissWaitingSeeker(waitingSeekers[0].consultationId)}
                className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
