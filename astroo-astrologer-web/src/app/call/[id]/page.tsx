'use client';

import React, { useEffect, useState, useRef, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { consultationsService } from '../../../services/consultations';
import { WebRTCClient } from '../../../lib/webrtc';
import { Consultation } from '../../../lib/types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Clock,
  TrendingUp,
  Volume2,
  Sparkles,
  Loader2,
} from 'lucide-react';

function AstrologerCallContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const consultationId = resolvedParams.id;
  const searchParams = useSearchParams();
  const callType = (searchParams.get('type') || 'voice') as 'voice' | 'video';

  const router = useRouter();
  const { user, isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();
  const { socket, endCall } = useSocket();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [endedSummary, setEndedSummary] = useState<any | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const webrtcClientRef = useRef<WebRTCClient | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push(`/login?redirect=/call/${consultationId}`);
    }
  }, [authLoading, isAuthenticated, isAstrologer, consultationId]);

  useEffect(() => {
    if (!consultationId || !user || !socket) return;

    let isCleanedUp = false;
    const sessionId = `cses_${consultationId}_${Date.now()}`;

    consultationsService.getById(consultationId).then((data) => {
      if (isCleanedUp) return;
      setConsultation(data);

      const client = new WebRTCClient({
        consultationId,
        sessionId,
        type: callType,
        socket,
        isInitiator: false, // Customer initiated
        onRemoteStream: (stream) => {
          if (callType === 'video' && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
          }
          setCallState('connected');
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') setCallState('connected');
          if (state === 'disconnected' || state === 'failed') setCallState('ended');
        },
      });

      webrtcClientRef.current = client;

      client.initialize().then((localStream) => {
        if (callType === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }).catch((err) => {
        console.error('WebRTC astrologer init error:', err);
      });
    });

    const handleCallEnd = () => {
      setCallState('ended');
      if (webrtcClientRef.current) {
        webrtcClientRef.current.dispose();
      }
    };

    socket.on('call_end', handleCallEnd);
    socket.on('call_ended', handleCallEnd);

    return () => {
      isCleanedUp = true;
      if (webrtcClientRef.current) {
        webrtcClientRef.current.dispose();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      socket.off('call_end', handleCallEnd);
      socket.off('call_ended', handleCallEnd);
    };
  }, [consultationId, user?.id, socket, callType]);

  useEffect(() => {
    if (callState === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [callState]);

  const handleToggleAudio = () => {
    if (webrtcClientRef.current) {
      webrtcClientRef.current.toggleAudio(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcClientRef.current) {
      webrtcClientRef.current.toggleVideo(isVideoDisabled);
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const handleEndCall = async () => {
    try {
      if (webrtcClientRef.current) {
        webrtcClientRef.current.dispose();
      }
      endCall({
        consultationId,
        sessionId: `cses_${consultationId}`,
        durationSeconds: callDuration,
      });

      const res = await consultationsService.end(consultationId, callDuration);
      setEndedSummary(res.billing || res.data);
      setCallState('ended');
    } catch {
      setCallState('ended');
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[85vh] flex flex-col justify-between">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-b border-indigo-500/20">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Customer: {consultation?.customer_name || 'Seeker'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold uppercase tracking-wider">
              {callType.toUpperCase()} CONSULTATION
            </span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
            <span className="flex items-center gap-1 text-white font-bold">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{formatTime(callDuration)}</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Rate: ₹{consultation?.rate_per_minute}/min</span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            callState === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {callState === 'connected' ? 'Connected' : callState === 'ended' ? 'Ended' : 'Connecting...'}
        </span>
      </div>

      {/* Video / Audio Stage */}
      <div className="my-4 flex-1 relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[420px] shadow-2xl">
        {callType === 'video' ? (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 w-36 h-48 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-900 z-20">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-2xl shadow-amber-500/30">
              <Volume2 className="h-16 w-16" />
              {callState === 'connected' && (
                <span className="absolute inset-0 rounded-full border-4 border-amber-400/40 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{consultation?.customer_name || 'Seeker'}</h3>
              <p className="text-xs text-amber-300 mt-1">Live Audio Consultation In Progress</p>
            </div>
          </div>
        )}

        {/* Ended Overlay */}
        {callState === 'ended' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Call Completed & Settled</h3>
            {endedSummary && (
              <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <strong className="text-white">{endedSummary.billedMinutes || 1} min</strong>
                </div>
                <div className="flex justify-between">
                  <span>Net Earnings:</span>
                  <strong className="text-emerald-400">
                    ₹{endedSummary.astrologerEarnings || (endedSummary.grossAmount ? endedSummary.grossAmount * 0.8 : 0)}
                  </strong>
                </div>
              </div>
            )}
            <div className="pt-2">
              <Link href="/requests" className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                Back to Queue
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {callState !== 'ended' && (
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-center gap-6">
          <button
            onClick={handleToggleAudio}
            className={`p-4 rounded-full border transition-all cursor-pointer ${
              isAudioMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
            }`}
          >
            {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={`p-4 rounded-full border transition-all cursor-pointer ${
                isVideoDisabled ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
            >
              {isVideoDisabled ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="px-6 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-xl shadow-rose-600/30 cursor-pointer"
          >
            <PhoneOff className="h-6 w-6" />
            <span className="text-sm">End Call</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AstrologerCallPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      }
    >
      <AstrologerCallContent {...props} />
    </Suspense>
  );
}
