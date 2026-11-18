'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from '../lib/api-config';
import { getToken } from '../lib/api-client';
import { useAuth } from './AuthContext';
import { CheckCircle2, Sparkles, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface IncomingConsultationRequest {
  id: string;
  consultationId: string;
  userId: string;
  customerId: string;
  customerName: string;
  type: 'chat' | 'call' | 'video';
  ratePerMinute: number;
  createdAt: string;
}

export interface IncomingCallData {
  consultationId: string;
  sessionId: string;
  callerId: string;
  callerName: string;
  type: 'voice' | 'video';
  status: string;
  timestamp: string;
}

export interface WaitingSeeker {
  consultationId: string;
  customerId: string;
  customerName: string;
  type: string;
  waitingNotice?: string;
  activeType?: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  incomingRequest: IncomingConsultationRequest | null;
  incomingCall: IncomingCallData | null;
  waitingSeekers: WaitingSeeker[];
  clearIncomingRequest: () => void;
  clearIncomingCall: () => void;
  dismissWaitingSeeker: (consultationId: string) => void;
  joinConsultation: (consultationId: string) => void;
  leaveConsultation: (consultationId: string) => void;
  sendMessage: (data: any, callback?: (res: any) => void) => void;
  acceptCall: (data: { consultationId: string; sessionId: string }) => void;
  rejectCall: (data: { consultationId: string; sessionId: string; reason?: string }) => void;
  endCall: (data: { consultationId: string; sessionId: string; durationSeconds?: number }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<IncomingConsultationRequest | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [waitingSeekers, setWaitingSeekers] = useState<WaitingSeeker[]>([]);
  const [approvalAlert, setApprovalAlert] = useState<{ title: string; message: string; link?: string } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const playCelebrationChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (major celebration chord)
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.45);
        osc.start(audioCtx.currentTime + idx * 0.12);
        osc.stop(audioCtx.currentTime + idx * 0.12 + 0.45);
      });
    } catch {
      // Audio context policy
    }
  };

  const playWaitingChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio context policy
    }
  };

  useEffect(() => {
    const token = getToken();
    const socketUrl = getSocketBaseUrl();

    const socketInstance = io(socketUrl, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (token) {
        socketInstance.emit('reauthenticate', { token });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Realtime Incoming Consultation Request (from Customer)
    const handleIncomingRequest = (req: IncomingConsultationRequest) => {
      // If currently engaged in active call or chat page, also add to waiting queue reminder
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.includes('/chat/') || path.includes('/call/')) {
          setWaitingSeekers((prev) => {
            if (prev.some((s) => s.consultationId === req.consultationId)) return prev;
            return [...prev, {
              consultationId: req.consultationId,
              customerId: req.customerId || req.userId,
              customerName: req.customerName,
              type: req.type,
              waitingNotice: `${req.customerName} is waiting for your ${req.type} session!`,
              createdAt: req.createdAt,
            }];
          });
          playWaitingChime();
          return;
        }
      }
      setIncomingRequest(req);
    };

    socketInstance.on('consultation_requested', handleIncomingRequest);
    socketInstance.on('incoming_consultation', handleIncomingRequest);

    // Explicit User Waiting Alert (when astrologer is already busy/in consultation)
    const handleWaitingAlert = (seeker: WaitingSeeker) => {
      setWaitingSeekers((prev) => {
        if (prev.some((s) => s.consultationId === seeker.consultationId)) return prev;
        return [...prev, seeker];
      });
      playWaitingChime();
    };
    socketInstance.on('user_waiting_alert', handleWaitingAlert);

    // Clear waiting seeker when accepted or ended
    const handleStateClear = (data: any) => {
      const cId = data?.consultationId || data?.id;
      if (cId) {
        setWaitingSeekers((prev) => prev.filter((s) => s.consultationId !== cId));
      }
    };
    socketInstance.on('consultation_ended', handleStateClear);
    socketInstance.on('consultation_started', handleStateClear);

    // Realtime Incoming WebRTC Voice / Video Call
    const handleIncomingCall = (call: IncomingCallData) => {
      if (call.callerId !== user?.id) {
        setIncomingCall(call);
      }
    };

    socketInstance.on('incoming_call', handleIncomingCall);
    socketInstance.on('call_invite', handleIncomingCall);

    socketInstance.on('call_ended', () => {
      setIncomingCall(null);
    });

    socketInstance.on('call_rejected', () => {
      setIncomingCall(null);
    });

    // Realtime Astrologer Approval / Verification Alert
    const handleApprovalEvent = (data: any) => {
      console.log('[Socket] Astrologer approval event received:', data);
      playCelebrationChime();
      setApprovalAlert({
        title: data?.title || 'Application Approved! 🎉',
        message: data?.message || data?.body || 'Congratulations! Your AstroWave Astrologer application has been approved. Your profile is now live and verified.',
        link: data?.link || '/profile',
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('astro_verification_status_changed', { detail: { isVerified: true, data } }));
      }
    };

    socketInstance.on('astrologer_approved', handleApprovalEvent);

    const handleGenericNotification = (notif: any) => {
      if (notif?.type === 'astrologer_approved') {
        handleApprovalEvent(notif);
      } else if (notif?.type === 'astrologer_rejected') {
        playWaitingChime();
        setApprovalAlert({
          title: notif?.title || 'Application Status Update',
          message: notif?.message || notif?.body || 'Your application was not approved at this time.',
          link: '/register',
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('astro_verification_status_changed', { detail: { isVerified: false, notif } }));
        }
      }
    };

    socketInstance.on('notification', handleGenericNotification);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  const clearIncomingRequest = () => setIncomingRequest(null);
  const clearIncomingCall = () => setIncomingCall(null);
  const dismissWaitingSeeker = (consultationId: string) => {
    setWaitingSeekers((prev) => prev.filter((s) => s.consultationId !== consultationId));
  };

  const joinConsultation = (consultationId: string) => {
    if (socketRef.current && consultationId) {
      socketRef.current.emit('join_consultation', { consultationId });
    }
  };

  const leaveConsultation = (consultationId: string) => {
    if (socketRef.current && consultationId) {
      socketRef.current.emit('leave_consultation', { consultationId });
    }
  };

  const sendMessage = (data: any, callback?: (res: any) => void) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', data, callback);
    }
  };

  const acceptCall = (data: { consultationId: string; sessionId: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('call_accept', data);
    }
    setIncomingCall(null);
  };

  const rejectCall = (data: { consultationId: string; sessionId: string; reason?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('call_reject', data);
    }
    setIncomingCall(null);
  };

  const endCall = (data: { consultationId: string; sessionId: string; durationSeconds?: number }) => {
    if (socketRef.current) {
      socketRef.current.emit('call_end', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        incomingRequest,
        incomingCall,
        waitingSeekers,
        clearIncomingRequest,
        clearIncomingCall,
        dismissWaitingSeeker,
        joinConsultation,
        leaveConsultation,
        sendMessage,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}

      {/* Real-time Astrologer Approval Toast / Banner Notification */}
      {approvalAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-2.5 bg-white/20 rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-7 h-7 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>{approvalAlert.title}</span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </h4>
              <button
                type="button"
                onClick={() => setApprovalAlert(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              {approvalAlert.message}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={approvalAlert.link || '/profile'}
                onClick={() => setApprovalAlert(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
              >
                <span>View Verified Profile</span>
                <ExternalLink className="w-3 h-3 text-emerald-700" />
              </Link>
              <button
                type="button"
                onClick={() => setApprovalAlert(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-800/80 text-emerald-100 font-medium text-xs hover:bg-emerald-800 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
