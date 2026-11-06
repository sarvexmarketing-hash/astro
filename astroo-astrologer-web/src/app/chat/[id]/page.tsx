'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { consultationsService } from '../../../services/consultations';
import { Consultation, ChatMessage } from '../../../lib/types';
import {
  Send,
  ArrowLeft,
  Clock,
  Coins,
  XCircle,
  CheckCheck,
  User,
  Loader2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const QUICK_RESPONSES = [
  '🙏 Pranaam! Please share your birth details (Date, Time, Place).',
  '⭐ Analyzing your Kundli planetary chart positions now...',
  '🪐 Your 10th house indicates strong career and wealth opportunities.',
  '✨ Relationship harmony will improve after the upcoming transit.',
  '🕉️ Recommended remedy: Light a diya and chant Gayatri Mantra.',
];

export default function AstrologerChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const consultationId = resolvedParams.id;
  const router = useRouter();
  const { user, isAuthenticated, isAstrologer, isLoading: authLoading } = useAuth();
  const { socket, joinConsultation, leaveConsultation, sendMessage } = useSocket();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endedSummary, setEndedSummary] = useState<any | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSeekerDetails, setShowSeekerDetails] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push(`/login?redirect=/chat/${consultationId}`);
    }
  }, [authLoading, isAuthenticated, isAstrologer, consultationId]);

  // Load Consultation & Messages
  useEffect(() => {
    if (!consultationId || !user) return;

    // 1. Fetch consultation
    consultationsService.getById(consultationId).then((data) => {
      setConsultation(data);
      const startStr = data?.astrologer_joined_at || data?.start_time;
      if (startStr) {
        const start = new Date(startStr).getTime();
        const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
        setElapsedSeconds(diff);
      }
    }).catch((err) => {
      console.error('Error fetching consultation:', err);
    });

    // 2. Fetch messages
    consultationsService.getMessages(consultationId).then((history) => {
      setMessages(history);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // 3. Join consultation room
    joinConsultation(consultationId);

    if (socket) {
      const handleNewMessage = (msg: any) => {
        const cId = msg.consultationId || msg.consultation_id || msg.conversationId;
        if (cId === consultationId) {
          setMessages((prev) => {
            const id = msg.id || msg._id;
            if (id && prev.some((m) => (m.id || m._id) === id)) return prev;
            return [...prev, msg];
          });
        }
      };

      const handleTick = (tick: any) => {
        if (tick.consultationId === consultationId && tick.elapsedSeconds !== undefined) {
          setElapsedSeconds(Number(tick.elapsedSeconds));
        }
      };

      const handleEnded = () => {
        setConsultation((prev) => prev ? { ...prev, state: 'ENDED' } : null);
      };

      socket.on('new_message', handleNewMessage);
      socket.on('chat_message', handleNewMessage);
      socket.on('receive_message', handleNewMessage);
      socket.on('consultation_tick', handleTick);
      socket.on('call_ended', handleEnded);
      socket.on('call_end', handleEnded);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('chat_message', handleNewMessage);
        socket.off('receive_message', handleNewMessage);
        socket.off('consultation_tick', handleTick);
        socket.off('call_ended', handleEnded);
        socket.off('call_end', handleEnded);
        leaveConsultation(consultationId);
      };
    }
  }, [consultationId, user?.id, socket]);

  // Per-second wall-clock timer increment if active
  useEffect(() => {
    if (consultation && !['ENDED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(consultation.state)) {
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [consultation?.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || !user || !consultation) return;

    setInputText('');

    const tempId = `astro_${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      _id: tempId,
      consultationId,
      senderId: user.id,
      senderRole: 'astrologer',
      content,
      text: content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 1. Emit via socket for instant live chat delivery
    sendMessage({
      consultationId,
      recipientId: consultation.user_id,
      content,
      messageType: 'text',
      id: tempId,
    });

    // 2. Persist via HTTP
    try {
      await consultationsService.sendMessage({
        consultationId,
        recipientId: consultation.user_id,
        content,
      });
    } catch (err) {
      console.warn('HTTP fallback delivery notice:', err);
    }
  };

  const handleQuickChip = (text: string) => {
    setInputText(text);
  };

  const handleEndConsultation = async () => {
    try {
      setIsEnding(true);
      const res = await consultationsService.end(consultationId, elapsedSeconds);
      setEndedSummary(res.billing || res.data);
      setConsultation((prev) => prev ? { ...prev, state: 'ENDED' } : null);
      setShowEndConfirm(false);
    } catch (err: any) {
      alert(err.message || 'Error ending consultation');
    } finally {
      setIsEnding(false);
    }
  };

  const isConsultationActive = consultation && !['ENDED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(consultation.state);
  const ratePerMinute = consultation?.rate_per_minute || 20;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedRemainderSeconds = elapsedSeconds % 60;
  const formattedElapsed = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedRemainderSeconds).padStart(2, '0')}`;
  const billedMinutesCount = Math.max(0, elapsedMinutes + (elapsedRemainderSeconds > 0 ? 1 : 0));
  const estimatedGross = billedMinutesCount * ratePerMinute;
  const estimatedNetEarnings = Math.round(estimatedGross * 0.8);
  const seekerName = consultation?.customer_name || 'Seeker';

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col justify-between p-2 sm:p-4 bg-[#FFFDF7]">
      {/* ── Practitioner Consultation Header ── */}
      <div className="bg-white rounded-3xl border border-[#FDE68A] p-3.5 sm:p-4 shadow-xs mb-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back & Seeker info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/requests"
              className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-[#FEF9C3] transition-colors"
              title="Back to Consultation Queue"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="w-10 h-10 rounded-2xl bg-[#FEF08A] border border-[#FDE68A] flex items-center justify-center font-bold text-sm text-[#78350F] shrink-0 shadow-2xs">
              {seekerName[0]?.toUpperCase() || 'S'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-[#18181B] truncate">
                  {seekerName}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isConsultationActive
                      ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}
                >
                  {isConsultationActive && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
                  <span>{isConsultationActive ? 'Active' : consultation?.state || 'Connecting'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] truncate">
                Live Vedic Chat Consultation
              </p>
            </div>
          </div>

          {/* Right: Metrics & End Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Timer Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs font-bold text-[#92400E]">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{formattedElapsed}</span>
            </div>

            {/* Rate & Net Earned Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-xs font-bold text-[#15803D]">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Earned:</span>
              <span>₹{estimatedNetEarnings}</span>
            </div>

            {/* End Session Button */}
            {isConsultationActive && (
              <button
                onClick={() => setShowEndConfirm(true)}
                disabled={isEnding}
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#FEE2E2] hover:bg-[#EF4444] text-[#DC2626] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-[#FCA5A5] active:scale-98 disabled:opacity-50"
              >
                {isEnding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">End & Settle</span>
                <span className="sm:hidden">End</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Collapsible Seeker Overview Card ── */}
        <div className="mt-3 pt-3 border-t border-[#FDE68A]/60">
          <button
            onClick={() => setShowSeekerDetails(!showSeekerDetails)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-[#78350F] hover:text-amber-900 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Seeker Consultation Context</span>
            </span>
            {showSeekerDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSeekerDetails && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#FFFDF7] p-2.5 rounded-2xl border border-[#FDE68A]/60 text-[#71717A]">
              <div>
                <span className="block text-[10px] font-semibold text-[#A1A1AA] uppercase">Seeker Name</span>
                <span className="font-bold text-[#18181B] truncate">{seekerName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-[#A1A1AA] uppercase">Rate Per Minute</span>
                <span className="font-bold text-[#18181B]">₹{ratePerMinute}/min</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-[#A1A1AA] uppercase">Live Duration</span>
                <span className="font-bold text-[#18181B]">{formattedElapsed}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-[#A1A1AA] uppercase">Platform Payout</span>
                <span className="font-bold text-[#15803D]">80% (₹{Math.round(ratePerMinute * 0.8)}/min)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Settled Summary Card (shown when session concludes) ── */}
      {endedSummary && (
        <div className="mb-3 p-4 rounded-3xl bg-[#DCFCE7] border border-[#86EFAC] text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#15803D] text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Consultation Completed & Settled</span>
            </span>
            <span className="text-[#166534] font-bold text-xs bg-white px-2 py-0.5 rounded-md border border-[#86EFAC]">
              Earnings Credited
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#166534] pt-1">
            <div>Duration: <strong className="text-[#14532D]">{endedSummary.billedMinutes || 1} min</strong></div>
            <div>Gross Charge: <strong className="text-[#14532D]">₹{endedSummary.grossAmount || 0}</strong></div>
            <div>Net Earned: <strong className="text-[#15803D] font-extrabold">₹{endedSummary.astrologerEarnings || (endedSummary.grossAmount ? Math.round(endedSummary.grossAmount * 0.8) : 0)}</strong></div>
            <div>Platform Fee (20%): <strong className="text-[#166534]">₹{endedSummary.platformFee || 0}</strong></div>
          </div>
        </div>
      )}

      {/* ── Chat Messages Feed ── */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 sm:p-4 bg-white rounded-3xl border border-[#FDE68A] shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center h-full space-y-2 flex-col">
            <Loader2 className="h-6 w-6 animate-spin text-[#B45309]" />
            <span className="text-xs font-semibold text-[#71717A]">Loading consultation history...</span>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => {
            const senderId = (msg as any).senderId || (msg as any).sender_id || (msg as any).sender;
            const isCustomerSender =
              (consultation?.user_id && senderId === consultation.user_id) ||
              msg.senderRole === 'customer' ||
              (msg as any).sender === 'customer';
            const isMe =
              !isCustomerSender &&
              Boolean(
                (user?.id && senderId === user.id) ||
                (consultation?.astrologer_id && senderId === consultation.astrologer_id) ||
                msg.senderRole === 'astrologer'
              );
            const isSystem = msg.messageType === 'system' || msg.type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id || msg._id || index} className="text-center my-2">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[11px] font-semibold text-[#92400E] shadow-2xs">
                    {msg.content || msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id || msg._id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-[#B45309] ml-2 mb-0.5">
                    {seekerName}
                  </span>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#FEF08A] text-[#78350F] border border-[#F7C93E] font-medium rounded-tr-xs'
                      : 'bg-white border border-[#FDE68A]/80 text-[#18181B] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#A1A1AA] mt-0.5 px-1.5">
                  <span>
                    {msg.createdAt || (msg as any).timestamp
                      ? new Date(msg.createdAt || (msg as any).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                  {isMe && <CheckCheck className="h-3 w-3 text-[#B45309]" />}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#71717A] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-2xl font-bold text-[#A21CAF] shadow-xs">
              ॐ
            </div>
            <div>
              <p className="text-sm font-black text-[#18181B]">Consultation Chat Ready</p>
              <p className="text-xs text-[#71717A] max-w-sm mt-0.5">
                Connected live with {seekerName}. Greet the seeker or send your initial astrological remedies below.
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Astrological Response Chips ── */}
      {isConsultationActive && (
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {QUICK_RESPONSES.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-[#FEF9C3] border border-[#FDE68A] text-[#78350F] font-semibold transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Practitioner Composer Input ── */}
      <div className="pt-1 shrink-0">
        {isConsultationActive ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your astrological advice, planetary analysis or remedies..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] shadow-2xs transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-[#FEF08A] hover:bg-[#FACC15] text-[#78350F] font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs border border-[#F7C93E] active:scale-98 transition-all shrink-0"
            >
              <Send className="h-4 w-4 text-[#B45309]" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white border border-[#FDE68A] text-center text-xs font-semibold text-[#71717A] shadow-xs">
            This consultation has ended.{' '}
            <Link href="/requests" className="text-[#B45309] font-bold hover:underline ml-1">
              Back to Requests Queue &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* ── End Consultation Confirmation Modal ── */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#FDE68A] p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center text-[#DC2626]">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-[#18181B]">
                Conclude Consultation?
              </h3>
              <p className="text-xs text-[#71717A] mt-1">
                Ending will stop the active session timer and automatically credit your earnings.
              </p>
            </div>

            <div className="bg-[#FFFDF7] p-3 rounded-2xl border border-[#FDE68A]/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#A1A1AA] block text-[10px]">Elapsed Time</span>
                <span className="font-black text-[#18181B]">{formattedElapsed}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] block text-[10px]">Net Earnings</span>
                <span className="font-black text-[#15803D]">₹{estimatedNetEarnings}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold text-xs cursor-pointer"
              >
                Continue Chat
              </button>
              <button
                type="button"
                onClick={handleEndConsultation}
                disabled={isEnding}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isEnding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm End</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
