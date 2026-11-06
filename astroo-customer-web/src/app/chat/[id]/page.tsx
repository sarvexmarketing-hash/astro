"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { astrologersService } from "@/services/astrologers";
import { consultationsService } from "@/services/consultations";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { Astrologer, Consultation } from "@/lib/types";
import {
  ArrowLeft,
  Phone,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  ArrowDown,
} from "lucide-react";

interface LocalChatMessage {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: string;
  status: "SENDING" | "SENT" | "FAILED";
  isSystem?: boolean;
}

export default function ChatScreenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const astrologerId = resolvedParams.id;

  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);
  const [hasAstrologerJoined, setHasAstrologerJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const ratePerMin = astrologer?.per_minute_rate || 25;
  const astrologerName = astrologer?.display_name || "Astrologer";

  // Session Duration Timer (CRITICAL: runs ONLY when astrologer has joined the consultation)
  useEffect(() => {
    if (consultation?.id && consultation?.state === "ACTIVE" && hasAstrologerJoined) {
      const timer = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [consultation?.id, consultation?.state, hasAstrologerJoined]);

  useEffect(() => {
    initializeChat();
  }, [astrologerId]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch Astrologer
      const astro = await astrologersService.getById(astrologerId);
      setAstrologer(astro);

      // Self-consultation client-side guard
      if (user && user.id === astrologerId) {
        setError("Cannot initiate consultation with yourself");
        setIsLoading(false);
        return;
      }

      // 2. Request / Start Consultation
      const cons = await consultationsService.request({
        astrologer_id: astrologerId,
        type: "chat",
      });
      setConsultation(cons);

      const isJoined = Boolean(cons?.astrologer_joined_at);
      setHasAstrologerJoined(isJoined);
      if (isJoined && cons.astrologer_joined_at) {
        const elapsed = Math.max(0, Math.floor((Date.now() - new Date(cons.astrologer_joined_at).getTime()) / 1000));
        setSessionDuration(elapsed);
      } else {
        setSessionDuration(0);
      }

      // 3. Load Chat History if exists
      if (cons.id) {
        const history = await consultationsService.getMessages(cons.id);
        const mapped: LocalChatMessage[] = (history || []).map((m: any) => {
          const senderId = m.senderId || m.sender_id || m.sender;
          const isAstrologerSender =
            (cons?.astrologer_id && senderId === cons.astrologer_id) ||
            m.senderRole === "astrologer" ||
            m.sender === "astrologer";
          const isFromMe =
            !isAstrologerSender &&
            Boolean(
              (user?.id && senderId === user.id) ||
              (cons?.user_id && senderId === cons.user_id) ||
              m.senderRole === "customer" ||
              m.sender === "customer"
            );
          return {
            id: m.id || m._id || String(Date.now()),
            text: m.content || m.text || "",
            isFromUser: isFromMe,
            timestamp: m.createdAt || m.timestamp || new Date().toISOString(),
            status: "SENT",
          };
        });
        setMessages(mapped);
      }
    } catch (err: any) {
      if (err.message?.includes("consultation with yourself")) {
        console.warn("Self-consultation guard:", err.message);
      } else {
        console.error("Chat init error:", err);
      }
      setError(err.message || "Failed to establish consultation chat.");
    } finally {
      setIsLoading(false);
    }
  };

  // Socket.IO message listening (ChatScreen.kt line 200)
  useEffect(() => {
    if (!socket || !consultation?.id) return;

    socket.emit("join_consultation", { consultationId: consultation.id });

    const handleNewMessage = (payload: any) => {
      if (payload.text?.startsWith("STATUS:") || payload.sender === "system") {
        const isEnd = payload.text.includes("ended") || payload.text.includes("left");
        const statusText = isEnd
          ? `${astrologerName} left the consultation. Consultation ended.`
          : `${astrologerName} joined the consultation`;

        setMessages((prev) => [
          ...prev,
          {
            id: payload.id || `sys_${Date.now()}`,
            text: statusText,
            isFromUser: false,
            timestamp: new Date().toISOString(),
            status: "SENT",
            isSystem: true,
          },
        ]);
        return;
      }

      const senderId = payload.senderId || payload.sender_id || payload.sender;
      const isAstrologerSender =
        (consultation?.astrologer_id && senderId === consultation.astrologer_id) ||
        payload.senderRole === "astrologer" ||
        payload.sender === "astrologer";
      const isFromMe =
        !isAstrologerSender &&
        Boolean(
          (user?.id && senderId === user.id) ||
          (consultation?.user_id && senderId === consultation.user_id) ||
          payload.senderRole === "customer" ||
          payload.sender === "customer"
        );

      setMessages((prev) => [
        ...prev,
        {
          id: payload.id || `msg_${Date.now()}`,
          text: payload.text || payload.content || "",
          isFromUser: isFromMe,
          timestamp: payload.timestamp || new Date().toISOString(),
          status: "SENT",
        },
      ]);
    };

    socket.on("chat_message", handleNewMessage);
    socket.on("new_message", handleNewMessage);
    socket.on("receive_message", handleNewMessage);
    socket.on("consultation_ended", () => {
      router.push("/astrologers");
    });

    const handleAstrologerJoined = (payload: any) => {
      if (
        payload.consultationId === consultation?.id ||
        payload.id === consultation?.id ||
        payload.astrologerId === astrologerId
      ) {
        setHasAstrologerJoined(true);
        setConsultation((prev) => (prev ? { ...prev, state: "ACTIVE", astrologer_joined_at: payload.astrologerJoinedAt || new Date().toISOString() } : prev));
        setAstrologer((prev) => (prev ? { ...prev, is_online: true } : prev));
        setSessionDuration(0);
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_join_${Date.now()}`,
            text: `✨ ${astrologerName} joined the chat. Consultation and billing started!`,
            isFromUser: false,
            timestamp: new Date().toISOString(),
            status: "SENT",
            isSystem: true,
          },
        ]);
      }
    };

    const handleUserJoinedRoom = (payload: any) => {
      if (
        payload.consultationId === consultation?.id &&
        (payload.userRole === "astrologer" || payload.eventType === "astrologer_joined")
      ) {
        setHasAstrologerJoined(true);
        setConsultation((prev) => (prev ? { ...prev, state: "ACTIVE" } : prev));
        setAstrologer((prev) => (prev ? { ...prev, is_online: true } : prev));
      }
    };

    const handleConsultationStatus = (payload: any) => {
      if (payload.consultationId === consultation?.id) {
        if (payload.astrologerJoined) {
          setHasAstrologerJoined(true);
          setConsultation((prev) => (prev ? { ...prev, state: "ACTIVE" } : prev));
          if (payload.astrologerJoinedAt) {
            const elapsed = Math.max(0, Math.floor((Date.now() - new Date(payload.astrologerJoinedAt).getTime()) / 1000));
            setSessionDuration(elapsed);
          }
        }
      }
    };

    const handleConsultationStarted = (payload: any) => {
      if (
        payload.consultationId === consultation?.id ||
        payload.id === consultation?.id ||
        payload.astrologerId === astrologerId
      ) {
        setAstrologer((prev) => (prev ? { ...prev, is_online: true } : prev));
        if (payload.astrologerJoined) {
          setHasAstrologerJoined(true);
          setConsultation((prev) => (prev ? { ...prev, state: "ACTIVE" } : prev));
        }
      }
    };

    const handlePresenceChanged = (payload: any) => {
      if (payload.astrologerId === astrologerId) {
        setAstrologer((prev) => (prev ? { ...prev, is_online: Boolean(payload.isOnline) } : prev));
      }
    };

    const handleConsultationTick = (tick: any) => {
      if (tick.consultationId === consultation?.id && tick.elapsedSeconds !== undefined) {
        setHasAstrologerJoined(true);
        setSessionDuration(Number(tick.elapsedSeconds));
      }
    };

    socket.on("astrologer_joined", handleAstrologerJoined);
    socket.on("user_joined_room", handleUserJoinedRoom);
    socket.on("consultation_status", handleConsultationStatus);
    socket.on("consultation_started", handleConsultationStarted);
    socket.on("astrologer_presence_changed", handlePresenceChanged);
    socket.on("consultation_tick", handleConsultationTick);

    return () => {
      socket.off("chat_message", handleNewMessage);
      socket.off("new_message", handleNewMessage);
      socket.off("receive_message", handleNewMessage);
      socket.off("astrologer_joined", handleAstrologerJoined);
      socket.off("user_joined_room", handleUserJoinedRoom);
      socket.off("consultation_status", handleConsultationStatus);
      socket.off("consultation_started", handleConsultationStarted);
      socket.off("astrologer_presence_changed", handlePresenceChanged);
      socket.off("consultation_tick", handleConsultationTick);
    };
  }, [socket, consultation?.id, astrologerId, astrologerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !consultation?.id) return;

    const msgId = `client_${Date.now()}`;
    const newMsg: LocalChatMessage = {
      id: msgId,
      text: trimmed,
      isFromUser: true,
      timestamp: new Date().toISOString(),
      status: "SENDING",
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");

    // 1. Instant Socket.IO emission to room and astrologer
    if (socket) {
      socket.emit("send_message", {
        consultationId: consultation.id,
        recipientId: astrologerId,
        content: trimmed,
        messageType: "text",
        id: msgId,
      });
    }

    // 2. HTTP persistence
    try {
      await consultationsService.sendMessage({
        consultationId: consultation.id,
        recipientId: astrologerId,
        content: trimmed,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: "SENT" } : m))
      );
    } catch {
      // If socket is connected, keep message as SENT
      if (isConnected) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, status: "SENT" } : m))
        );
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, status: "FAILED" } : m))
        );
      }
    }
  };

  const handleEndSession = async () => {
    if (consultation?.id) {
      try {
        await consultationsService.end(consultation.id, sessionDuration);
      } catch (err) {
        console.error("Error ending session:", err);
      }
    }
    router.push("/astrologers");
  };

  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const currentCost = hasAstrologerJoined ? Math.max(0, (minutes + (seconds > 0 ? 1 : 0)) * ratePerMin) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
        <span className="text-sm font-semibold text-[#18181B]">
          Connecting with {astrologerName}...
        </span>
      </div>
    );
  }

  if (error) {
    const isSelfError = error.toLowerCase().includes("consultation with yourself");
    const isAuthError =
      error.toLowerCase().includes("unauthorized") ||
      error.toLowerCase().includes("token") ||
      error.toLowerCase().includes("auth") ||
      error.toLowerCase().includes("login");

    if (isSelfError) {
      return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-3xl shadow-xs">
            👤
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#18181B]">
              You Cannot Consult with Yourself
            </h2>
            <p className="text-xs text-[#71717A] leading-relaxed">
              You are currently logged in as this astrologer (<strong className="text-[#18181B]">{astrologerName}</strong>). Astrologers cannot book or chat with their own account. Please choose another certified astrologer to chat as a seeker, or open your practitioner portal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-3">
            <button
              onClick={() => router.push("/astrologers")}
              className="w-full py-3 px-4 rounded-xl bg-[#FEF08A] hover:bg-[#FACC15] text-[#78350F] border border-[#F7C93E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Browse Available Astrologers
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-[#FDE68A] flex items-center justify-center text-3xl">
          {isAuthError ? "🔐" : "⚠️"}
        </div>
        <h2 className="text-base font-bold text-[#18181B]">{error}</h2>
        <div className="flex gap-2 w-full pt-2">
          <button
            onClick={() => router.push("/astrologers")}
            className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-300 text-xs font-semibold text-[#71717A] hover:bg-zinc-50 transition-colors"
          >
            All Astrologers
          </button>
          {isAuthError ? (
            <button
              onClick={() => router.push(`/login?redirect=/chat/${astrologerId}`)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FEF08A] hover:bg-[#FACC15] text-[#78350F] border border-[#F7C93E] text-xs font-bold transition-all"
            >
              Log In
            </button>
          ) : (
            <button
              onClick={() => initializeChat()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FEF08A] hover:bg-[#FACC15] text-[#78350F] border border-[#F7C93E] text-xs font-bold transition-all"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] flex flex-col">
      {/* ── Chat Header (ChatScreen.kt line 390) ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#FDE68A] px-3 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={handleEndSession}
            className="p-1.5 -ml-1 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#FDE68A] overflow-hidden flex items-center justify-center font-bold text-sm text-[#B45309] flex-shrink-0">
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

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#18181B] truncate">{astrologerName}</h2>
            {consultation?.state === "ACTIVE" || astrologer?.is_online ? (
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Online (₹{ratePerMin}/min)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Offline &bull; Request Queued</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/call/${astrologerId}`)}
            className="p-2 rounded-full bg-[#DCFCE7] text-[#166534] hover:bg-emerald-200 transition-colors"
            title="Switch to Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
          >
            End
          </button>
        </div>
      </header>

      {/* ── Timer and Billing Bar (ChatScreen.kt line 470) ── */}
      <div className="bg-[#FEF3C7] border-b border-[#FDE68A] px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-bold text-[#92400E]">
        <div className="flex items-center gap-1.5">
          {hasAstrologerJoined ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Time: {formattedTime}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Waiting for {astrologerName} to join...</span>
            </>
          )}
        </div>

        <div>
          {hasAstrologerJoined ? (
            <span className="text-emerald-900 font-extrabold">Cost: ₹{currentCost}</span>
          ) : (
            <span className="text-amber-900 font-semibold">
              ₹0.00 billed <span className="opacity-75 font-normal text-[11px]">(₹{ratePerMin}/min once joined)</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Waiting for Astrologer to Join Banner ── */}
      {!hasAstrologerJoined && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 shadow-xs flex items-start gap-3 max-w-2xl sm:mx-auto sm:w-full animate-in fade-in">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-900">
                Waiting for {astrologerName} to enter the chat
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                No amount deducted
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your wallet will <strong>not be deducted</strong> until the astrologer enters this chat. You can type your questions or birth details below in advance.
            </p>
          </div>
        </div>
      )}

      {/* ── Messages List (ChatScreen.kt line 493) ── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl w-full mx-auto"
      >
        {messages.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-xs sm:text-sm font-medium text-[#71717A]">
              🕉️ Start your consultation with {astrologerName}
            </p>
            <button
              onClick={() => handleSendMessage("Namaste Pandit Ji 🙏")}
              className="px-4 py-2 rounded-full bg-white border border-[#FDE68A] hover:bg-[#FFFBEB] text-xs font-bold text-[#18181B] shadow-2xs transition-all"
            >
              Namaste Pandit Ji 🙏
            </button>
          </div>
        ) : (
          messages.map((message) => {
            if (message.isSystem) {
              return (
                <div key={message.id} className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FEF08A] text-[11px] font-semibold text-[#78350F]">
                    {message.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex flex-col ${message.isFromUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[280px] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    message.isFromUser
                      ? "bg-[#D97706] text-white rounded-br-xs shadow-xs"
                      : "bg-[#FFFBEB] border border-[#FEF08A] text-[#18181B] rounded-bl-xs shadow-2xs"
                  }`}
                >
                  <p>{message.text}</p>
                </div>

                {message.isFromUser && message.status === "SENDING" && (
                  <span className="text-[10px] text-[#A1A1AA] mr-1 mt-0.5">Sending...</span>
                )}
                {message.isFromUser && message.status === "FAILED" && (
                  <span className="text-[10px] text-rose-500 mr-1 mt-0.5">Not delivered</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Fixed Input Bar (ChatScreen.kt line 593) ── */}
      <div className="sticky bottom-0 bg-white border-t border-[#FDE68A] p-2.5 sm:p-3 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(messageText);
          }}
          className="max-w-2xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-[#FFFDF7] border border-[#FDE68A] focus:border-[#D97706] rounded-full text-xs sm:text-sm text-[#18181B] focus:outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="w-10 h-10 rounded-full bg-[#D97706] hover:bg-[#B45309] disabled:opacity-40 text-white flex items-center justify-center transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
