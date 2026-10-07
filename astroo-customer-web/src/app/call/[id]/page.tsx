"use client";

import React, { useEffect, useState, useRef, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { astrologersService } from "@/services/astrologers";
import { consultationsService } from "@/services/consultations";
import { useSocket } from "@/context/SocketContext";
import { Astrologer, Consultation } from "@/lib/types";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

function CallScreenContent({ astrologerId }: { astrologerId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVideo = searchParams.get("type") === "video" || searchParams.get("isVideo") === "true";

  const { socket } = useSocket();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [callState, setCallState] = useState<"Ringing" | "Connecting" | "Connected" | "Ended">("Ringing");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const ratePerMin = (astrologer?.per_minute_rate || 25) + (isVideo ? 10 : 0);
  const astrologerName = astrologer?.display_name || "Astrologer";

  useEffect(() => {
    loadAstrologer();
  }, [astrologerId]);

  const loadAstrologer = async () => {
    try {
      const data = await astrologersService.getById(astrologerId);
      setAstrologer(data);
      initiateCall(data);
    } catch (err) {
      console.error("Failed to load astrologer:", err);
    }
  };

  const initiateCall = async (astro: Astrologer) => {
    try {
      const cons = await consultationsService.request({
        astrologer_id: astro.id,
        type: isVideo ? "video" : "call",
      });
      setConsultation(cons);

      // Start local media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallState("Connected");
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket && cons.id) {
          socket.emit("webrtc_ice_candidate", {
            consultationId: cons.id,
            candidate: event.candidate,
          });
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket && cons.id) {
        socket.emit("webrtc_offer", {
          consultationId: cons.id,
          offer,
        });
      }

      // Simulate connection timeout or connected
      setTimeout(() => {
        setCallState("Connected");
      }, 3000);
    } catch (err) {
      console.error("WebRTC initiation failed:", err);
      setCallState("Connected"); // Fallback to timer mode
    }
  };

  // Live Timer when Connected (CallScreen.kt line 371)
  useEffect(() => {
    let timer: any = null;
    if (callState === "Connected") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleEndCall = async () => {
    setCallState("Ended");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (consultation?.id) {
      try {
        await consultationsService.end(consultation.id, callDuration);
      } catch (err) {
        console.error("Error ending call:", err);
      }
    }
    router.push("/astrologers");
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // Toggle
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const minutes = Math.floor(callDuration / 60);
  const seconds = callDuration % 60;
  const formattedTime =
    callState === "Connected"
      ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : callState;
  const currentCost = (minutes + (seconds > 0 ? 1 : 0)) * ratePerMin;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] text-white flex flex-col items-center justify-between p-6">
      {/* Video Streams if video call */}
      {isVideo && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Picture-in-picture local preview */}
          <div className="absolute top-6 right-6 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </div>
      )}

      {/* Top Bar with security notice */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between py-2 text-white/60 text-xs">
        <span>Vedic Audio/Video Call</span>
        <span>End-to-End Encrypted</span>
      </div>

      {/* Middle: Astrologer Avatar & Caller Info (CallScreen.kt lines 350-385) */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 my-auto">
        {!isVideo && (
          <div className="relative">
            <div className="w-36 h-36 rounded-full bg-[#FEF3C7] border-4 border-[#FDE68A] overflow-hidden flex items-center justify-center text-5xl font-bold text-[#B45309] shadow-2xl animate-pulse">
              {astrologer?.avatar_url ? (
                <img
                  src={astrologer.avatar_url}
                  alt={astrologerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{astrologerName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {astrologerName}
          </h2>
          <p
            className={`text-base font-semibold ${
              callState === "Connected" ? "text-[#10B981]" : "text-white/70"
            }`}
          >
            {formattedTime}
          </p>

          {callState === "Connected" && (
            <p className="text-xs font-bold text-[#FBBF24] pt-0.5">
              Cost: ₹{currentCost} (₹{ratePerMin}/min)
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar (CallScreen.kt lines 389-450) */}
      <div className="relative z-10 w-full max-w-md pb-6 flex items-center justify-around">
        {/* Mute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
            isMuted ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Toggle Button (if video enabled) */}
        {isVideo && (
          <button
            type="button"
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
              !isVideoEnabled ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* End Call Button (72x72 red circle with Close icon - CallScreen.kt line 417) */}
        <button
          type="button"
          onClick={handleEndCall}
          className="w-18 h-18 rounded-full bg-[#EF4444] hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95"
        >
          <X className="w-9 h-9 stroke-[2.5]" />
        </button>

        {/* Speaker Button */}
        <button
          type="button"
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${
            !isSpeakerOn ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}

export default function CallScreenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white text-xs">Loading call...</div>}>
      <CallScreenContent astrologerId={resolvedParams.id} />
    </Suspense>
  );
}
