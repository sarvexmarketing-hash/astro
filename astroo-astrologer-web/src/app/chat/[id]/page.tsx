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
  TrendingUp,
  XCircle,
  CheckCheck,
  User,
  Loader2,
  Sparkles,
} from 'lucide-react';

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
  const [endedSummary, setEndedSummary] = useState<any | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAstrologer)) {
      router.push(`/login?redirect=/chat/${consultationId}`);
    }
  }, [authLoading, isAuthenticated, isAstrologer, consultationId]);

  useEffect(() => {
    if (!consultationId || !user) return;

    // 1. Fetch consultation
    consultationsService.getById(consultationId).then((data) => {
      setConsultation(data);
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
        if (msg.consultationId === consultationId || msg.consultation_id === consultationId) {
          setMessages((prev) => {
            const id = msg.id || msg._id;
            if (prev.some((m) => (m.id || m._id) === id)) return prev;
            return [...prev, msg];
          });
        }
      };

      const handleTick = (tick: any) => {
        if (tick.consultationId === consultationId) {
          setElapsedSeconds(tick.elapsedSeconds);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !consultation) return;

    const content = inputText.trim();
    setInputText('');

    const tempId = `temp_${Date.now()}`;
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

    sendMessage({
      consultationId,
      recipientId: consultation.user_id,
      content,
      messageType: 'text',
    });
  };

  const handleEndConsultation = async () => {
    if (!confirm('Are you ready to conclude and settle this consultation session?')) return;
    try {
      setIsEnding(true);
      const res = await consultationsService.end(consultationId);
      setEndedSummary(res.billing || res.data);
      setConsultation((prev) => prev ? { ...prev, state: 'ENDED' } : null);
    } catch (err: any) {
      alert(err.message || 'Error ending consultation');
    } finally {
      setIsEnding(false);
    }
  };

  const isConsultationActive = consultation && !['ENDED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(consultation.state);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col justify-between">
      {/* Header Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-b border-indigo-500/20 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/requests" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Seeker: {consultation?.customer_name || 'Customer'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isConsultationActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {consultation?.state || 'CONNECTING'}
              </span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>Rate: ₹{consultation?.rate_per_minute || 20}/min</span>
              <span>•</span>
              <span className="text-amber-400 flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Elapsed: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</span>
              </span>
            </div>
          </div>
        </div>

        {isConsultationActive && (
          <button
            onClick={handleEndConsultation}
            disabled={isEnding}
            className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
          >
            {isEnding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            <span>End & Settle</span>
          </button>
        )}
      </div>

      {/* Settled Summary Card */}
      {endedSummary && (
        <div className="mb-3 p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">Consultation Completed</span>
            <span className="text-emerald-400 font-bold">Earnings Credited</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
            <div>Duration: <strong className="text-white">{endedSummary.billedMinutes || 1} min</strong></div>
            <div>Gross: <strong className="text-white">₹{endedSummary.grossAmount || 0}</strong></div>
            <div>Net Earned: <strong className="text-emerald-400">₹{endedSummary.astrologerEarnings || (endedSummary.grossAmount ? endedSummary.grossAmount * 0.8 : 0)}</strong></div>
            <div>Platform Fee (20%): <strong className="text-slate-400">₹{endedSummary.platformFee || 0}</strong></div>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 glass-panel rounded-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
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
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-400">
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
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700 text-white rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 px-1">
                  <span>
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                  {isMe && <CheckCheck className="h-3 w-3 text-amber-500" />}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
            <Sparkles className="h-8 w-8 text-amber-400" />
            <p className="text-sm font-semibold text-white">Consultation Active</p>
            <p className="text-xs text-slate-400 max-w-sm">
              You are connected live with the seeker. Share your Vedic astrological insights and recommendations.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3 shrink-0">
        {isConsultationActive ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your astrological advice / remedies..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Send className="h-4 w-4 fill-slate-950" />
              <span>Send</span>
            </button>
          </form>
        ) : (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            This consultation has ended. <Link href="/requests" className="text-amber-400 font-bold hover:underline">Back to Requests Queue &rarr;</Link>
          </div>
        )}
      </div>
    </div>
  );
}
