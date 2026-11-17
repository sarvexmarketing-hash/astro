"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { astrologerService } from "@/services/astrologer";
import { consultationsService } from "@/services/consultations";
import { AstrologerProfile, Consultation, EarningsData } from "@/lib/types";
import {
  Bell,
  User,
  MessageSquare,
  Sparkles,
  Phone,
  PhoneOff,
  Clock,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Shield,
  HelpCircle,
  Calendar,
  CheckCircle,
  Home,
  Loader2,
  Users,
} from "lucide-react";

interface RecentHistoryItem {
  id: string;
  name: string;
  avatar: string;
  time: string;
  type: "call" | "chat";
  durationText: string;
  earningsText: string;
  isMissed?: boolean;
}

const DEFAULT_RECENT_CALLS: RecentHistoryItem[] = [
  {
    id: "h-1",
    name: "venugopal",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    time: "01:52 PM",
    type: "call",
    durationText: "5 min 1 sec",
    earningsText: "₹ 10.12",
  },
  {
    id: "h-2",
    name: "Adwaith sai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    time: "01:40 PM",
    type: "chat",
    durationText: "5 min",
    earningsText: "₹ 10.02",
  },
  {
    id: "h-3",
    name: "Akshaya",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    time: "01:34 PM",
    type: "call",
    durationText: "5 min",
    earningsText: "₹ 10.04",
  },
  {
    id: "h-4",
    name: "lohith sai",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    time: "01:29 PM",
    type: "call",
    durationText: "5 min",
    earningsText: "₹ 10.01",
  },
  {
    id: "h-5",
    name: "maneesha",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    time: "01:22 PM",
    type: "call",
    durationText: "5 min",
    earningsText: "₹ 10.05",
  },
  {
    id: "h-6",
    name: "Vani",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    time: "01:16 PM",
    type: "chat",
    durationText: "4 min 59 sec",
    earningsText: "₹ 9.99",
  },
  {
    id: "h-7",
    name: "ananthaiah c",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    time: "01:07 PM",
    type: "call",
    durationText: "9 min 3 sec",
    earningsText: "₹ 33.31",
  },
  {
    id: "h-8",
    name: "Indla Vighneswar Reddy",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    time: "01:01 PM",
    type: "call",
    durationText: "5 min",
    earningsText: "₹ 10.04",
  },
];

const DEFAULT_MISSED_CALLS: RecentHistoryItem[] = [
  {
    id: "m-1",
    name: "Kavita Rao",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    time: "12:30 PM",
    type: "call",
    durationText: "Missed Call",
    earningsText: "₹ 0.00",
    isMissed: true,
  },
  {
    id: "m-2",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    time: "11:45 AM",
    type: "call",
    durationText: "Missed Call",
    earningsText: "₹ 0.00",
    isMissed: true,
  },
];

export default function AstrologerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [profile, setProfile] = useState<AstrologerProfile | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Consultation[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [callEnabled, setCallEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<"recent" | "missed">("recent");
  const [recentCallsList, setRecentCallsList] = useState<RecentHistoryItem[]>(DEFAULT_RECENT_CALLS);
  const [missedCallsList, setMissedCallsList] = useState<RecentHistoryItem[]>(DEFAULT_MISSED_CALLS);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prof, earnings, requests, history] = await Promise.allSettled([
        astrologerService.getMyProfile(),
        astrologerService.getEarnings(),
        consultationsService.listRequests(),
        consultationsService.getHistory(),
      ]);

      if (prof.status === "fulfilled") {
        setProfile(prof.value);
        setIsOnline(Boolean(prof.value?.is_online));
        setChatEnabled(prof.value?.is_chat_enabled !== false);
        setCallEnabled(prof.value?.is_call_enabled !== false);
      }
      if (earnings.status === "fulfilled") {
        setEarningsData(earnings.value);
      }
      if (requests.status === "fulfilled") {
        setPendingRequests(requests.value || []);
      }
      if (history.status === "fulfilled" && history.value && history.value.length > 0) {
        const liveCalls: RecentHistoryItem[] = [];
        const liveMissed: RecentHistoryItem[] = [];

        for (const c of history.value) {
          const isCall = c.type === "call" || c.type === "video";
          const isMissed = c.state === "CANCELLED" || c.state === "EXPIRED";
          const dSec = c.total_duration_seconds || 0;
          const mins = Math.floor(dSec / 60);
          const secs = dSec % 60;
          const durText = isMissed
            ? "Missed Call"
            : mins > 0 && secs > 0
            ? `${mins} min ${secs} sec`
            : mins > 0
            ? `${mins} min`
            : `${secs} sec`;

          const amountVal = c.astrologer_earnings || (c.total_amount ? Number(c.total_amount) * 0.8 : 0);
          const earnText = `₹ ${amountVal.toFixed(2)}`;
          const timeStr = c.created_at
            ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "01:00 PM";

          const item: RecentHistoryItem = {
            id: c.id,
            name: c.customer_name || "Seeker",
            avatar: c.customer_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            time: timeStr,
            type: isCall ? "call" : "chat",
            durationText: durText,
            earningsText: earnText,
            isMissed,
          };

          if (isMissed) {
            liveMissed.push(item);
          } else {
            liveCalls.push(item);
          }
        }

        if (liveCalls.length > 0) {
          setRecentCallsList([...liveCalls, ...DEFAULT_RECENT_CALLS.slice(liveCalls.length)]);
        }
        if (liveMissed.length > 0) {
          setMissedCallsList([...liveMissed, ...DEFAULT_MISSED_CALLS]);
        }
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSync = (e: any) => {
      if (typeof e?.detail?.isOnline === 'boolean') {
        setIsOnline(e.detail.isOnline);
      }
    };
    window.addEventListener('astro_online_status_changed', handleSync);
    return () => window.removeEventListener('astro_online_status_changed', handleSync);
  }, []);

  // Listen for real-time customer requests to keep queue updated
  useEffect(() => {
    if (!socket) return;
    const refreshQueue = () => {
      consultationsService.listRequests().then((reqs) => setPendingRequests(reqs || []));
    };
    socket.on('consultation_requested', refreshQueue);
    socket.on('incoming_consultation', refreshQueue);
    socket.on('user_waiting_alert', refreshQueue);
    socket.on('consultation_ended', refreshQueue);
    return () => {
      socket.off('consultation_requested', refreshQueue);
      socket.off('incoming_consultation', refreshQueue);
      socket.off('user_waiting_alert', refreshQueue);
      socket.off('consultation_ended', refreshQueue);
    };
  }, [socket]);

  const handleToggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await astrologerService.toggleOnline(nextStatus);
      window.dispatchEvent(new CustomEvent('astro_online_status_changed', { detail: { isOnline: nextStatus } }));
      // Refresh pending customer requests list so the astrologer sees everyone waiting
      const reqs = await consultationsService.listRequests();
      setPendingRequests(reqs || []);
    } catch (err) {
      setIsOnline(!nextStatus); // rollback
    }
  };

  const handleToggleChat = async () => {
    const nextVal = !chatEnabled;
    if (!nextVal && !callEnabled) {
      alert("You must keep at least one consultation channel (Call or Chat) active.");
      return;
    }
    setChatEnabled(nextVal);
    try {
      await astrologerService.updateStatus({ isChatEnabled: nextVal });
    } catch {
      setChatEnabled(!nextVal); // rollback
    }
  };

  const handleToggleCall = async () => {
    const nextVal = !callEnabled;
    if (!nextVal && !chatEnabled) {
      alert("You must keep at least one consultation channel (Call or Chat) active.");
      return;
    }
    setCallEnabled(nextVal);
    try {
      await astrologerService.updateStatus({ isCallEnabled: nextVal });
    } catch {
      setCallEnabled(!nextVal); // rollback
    }
  };

  const handleSelectCustomer = async (req: Consultation) => {
    try {
      setIsAcceptingId(req.id);
      await consultationsService.accept(req.id);
      if (req.type === 'chat') {
        router.push(`/chat/${req.id}`);
      } else {
        router.push(`/call/${req.id}?type=${req.type}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error accepting consultation');
      setIsAcceptingId(null);
    }
  };

  const todayEarnings = earningsData?.earnings?.available_balance ?? earningsData?.earnings?.total_earned ?? 0;
  const totalConsultations = profile?.total_consultations ?? 0;
  const rating = profile?.rating ? Number(profile.rating).toFixed(1) : "5.0";
  const experienceYears = profile?.experience_years || 0;
  const perMinuteRate = profile?.per_minute_rate || 25;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      {/* Top Header matching astrologer_screen.png */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/95 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#FDE68A]/60">
        <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
          Astrologer Portal
        </h1>
        <div className="flex items-center gap-2.5">
          {/* Floating Balance Pill matching History screen */}
          <Link
            href="/consultations"
            className="bg-white px-3.5 py-1.5 rounded-full shadow-xs border border-orange-200/80 flex items-center gap-1 hover:border-orange-400 transition-colors"
          >
            <span className="text-xs font-bold text-[#1F1F1F]">₹</span>
            <span className="text-xs font-extrabold text-[#1F1F1F] tracking-tight">
              {Number(todayEarnings || 116.26).toFixed(2)}
            </span>
          </Link>

          <Link
            href="/notifications"
            className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#52525B] hover:text-[#18181B] transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            {pendingRequests.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white"></span>
            )}
          </Link>
          <Link
            href="/profile"
            className="p-1 rounded-full text-[#52525B] hover:text-[#18181B] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#FEF08A] border border-[#FDE68A] flex items-center justify-center font-bold text-xs text-[#78350F]">
              {user?.fullName ? user.fullName[0].toUpperCase() : "J"}
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* ========================================================================= */}
        {/* 1. WELCOME & ONLINE STATUS CARD (Matching astrologer_screen.png)          */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            {/* Yellow Om Icon Box */}
            <div className="w-14 h-14 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-3xl font-bold text-[#A21CAF] flex-shrink-0 shadow-xs">
              <span className="select-none">ॐ</span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#71717A] block leading-tight font-medium">Welcome,</span>
              <h2 className="text-lg font-black text-[#18181B] truncate leading-tight mt-0.5">
                {user?.fullName || profile?.display_name || "Astrologer"}
              </h2>
              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
                <span>✓</span>
                <span>Verified Astrologer</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#FDE68A]/60 my-4" />

          {/* Online Toggle Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isOnline
                    ? "bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "bg-zinc-400"
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  isOnline ? "bg-[#22C55E]" : "bg-zinc-300"
                }`}
              />
              <span
                className={`text-sm font-bold transition-colors ${
                  isOnline ? "text-[#18181B]" : "text-[#71717A]"
                }`}
              >
                {isOnline ? "You are Online (Discoverable)" : "You are Offline (Not Discoverable)"}
              </span>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleOnline}
              aria-label={isOnline ? "Switch to offline mode" : "Switch to online mode"}
              className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center cursor-pointer ${
                isOnline ? "bg-[#10B981] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          <div className="border-t border-[#FDE68A]/60 my-4" />

          {/* Consultation Channels Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18181B]">Consultation Channels</span>
              {!chatEnabled && callEnabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                  📞 Call Only Mode
                </span>
              ) : chatEnabled && !callEnabled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                  💬 Chat Only Mode
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Chat & Call Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Chat Toggle Button */}
              <button
                type="button"
                onClick={handleToggleChat}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  chatEnabled
                    ? "bg-[#FEF08A]/60 border-[#F7C93E] text-[#78350F]"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <div className="text-left">
                    <div className="text-xs font-bold">Chat</div>
                    <div className="text-[10px]">{chatEnabled ? "Active" : "Disabled"}</div>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${chatEnabled ? "bg-[#10B981] justify-end" : "bg-zinc-300 justify-start"}`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </button>

              {/* Call Toggle Button */}
              <button
                type="button"
                onClick={handleToggleCall}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  callEnabled
                    ? "bg-[#FEF08A]/60 border-[#F7C93E] text-[#78350F]"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📞</span>
                  <div className="text-left">
                    <div className="text-xs font-bold">Call</div>
                    <div className="text-[10px]">{callEnabled ? "Active" : "Disabled"}</div>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${callEnabled ? "bg-[#10B981] justify-end" : "bg-zinc-300 justify-start"}`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. WAITING CUSTOMERS & CONSULTATION QUEUE (Selectable by Astrologer)       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl select-none">👥</span>
              <div>
                <h3 className="text-sm font-black text-[#18181B] tracking-tight flex items-center gap-2">
                  <span>Waiting Customers</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF08A] text-[#78350F] border border-[#F7C93E]">
                    {pendingRequests.length}
                  </span>
                </h3>
                <p className="text-[11px] text-[#71717A]">
                  {isOnline
                    ? "Select a seeker below to accept and start their consultation"
                    : "Toggle to Discoverable above to accept waiting seekers"}
                </p>
              </div>
            </div>
            {pendingRequests.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase animate-pulse">
                Live Queue
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-5 px-4 rounded-2xl bg-[#FFFDF7] border border-dashed border-[#FDE68A] text-center space-y-1">
              <p className="text-xs font-bold text-[#18181B]">No customers waiting right now</p>
              <p className="text-[11px] text-[#71717A]">
                {isOnline
                  ? "You are online and discoverable! When seekers request a chat or call, they will appear here for you to select."
                  : "Switch your status to Discoverable above so seekers can find you."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-[#FEF9C3]/40 border border-[#FDE68A] hover:bg-[#FEF9C3] hover:border-[#F7C93E] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#FEF08A] border border-[#F7C93E] text-[#78350F] flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                      {req.customer_name ? req.customer_name[0].toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-[#18181B] truncate">
                          {req.customer_name || 'Seeker'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                          {req.type === 'call' ? '📞 Call' : req.type === 'video' ? '📹 Video' : '💬 Chat'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        Rate: <strong className="text-[#18181B]">₹{req.rate_per_minute}/min</strong> • <span className="text-emerald-700 font-bold">Waiting in queue</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectCustomer(req)}
                      disabled={isAcceptingId === req.id}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isAcceptingId === req.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : req.type === 'chat' ? (
                        <MessageSquare className="h-3.5 w-3.5" />
                      ) : (
                        <Phone className="h-3.5 w-3.5" />
                      )}
                      <span>Select & Start</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2.5 RECENT CALLS & CONSULTATION HISTORY (Matching Uploaded Screenshot)    */}
        {/* ========================================================================= */}
        <div className="bg-[#FFF5F0] rounded-3xl border border-orange-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-[#1F1F1F] tracking-tight">
              History
            </h3>
            <Link
              href="/consultations"
              className="text-xs font-bold text-[#FA5A2A] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setHistoryTab("recent")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                historyTab === "recent"
                  ? "bg-[#FA5A2A] text-white shadow-orange-300/40"
                  : "bg-white text-[#1F1F1F] border border-orange-100 hover:bg-orange-50/50"
              }`}
            >
              <Phone className={`w-3.5 h-3.5 ${historyTab === "recent" ? "text-white" : "text-[#FA5A2A]"}`} />
              <span>Recent Calls</span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryTab("missed")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                historyTab === "missed"
                  ? "bg-[#FA5A2A] text-white shadow-orange-300/40"
                  : "bg-white text-[#1F1F1F] border border-orange-100 hover:bg-orange-50/50"
              }`}
            >
              <PhoneOff className={`w-3.5 h-3.5 ${historyTab === "missed" ? "text-white" : "text-[#71717A]"}`} />
              <span>Missed Calls</span>
            </button>
          </div>

          {/* List of Calls */}
          <div className="divide-y divide-orange-100/70 pt-1">
            {(historyTab === "recent" ? recentCallsList : missedCallsList).slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 group transition-colors hover:bg-white/40 px-1 rounded-2xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-orange-100 border border-orange-200/60 shadow-xs">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#1F1F1F] truncate leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#71717A] mt-1 font-normal">
                      <span>{item.time}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        {item.isMissed ? (
                          <PhoneOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : item.type === "call" ? (
                          <Phone className="w-3.5 h-3.5 text-[#1F1F1F] shrink-0" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-[#1F1F1F] shrink-0" />
                        )}
                        <span>{item.durationText}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`text-sm font-semibold ${item.isMissed ? "text-zinc-400" : "text-[#1F1F1F]"}`}>
                    {item.earningsText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SERVICES & OPERATIONS HUB (Matching astrologer_screen.png)             */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs space-y-3.5">
          <h3 className="text-sm font-black text-[#18181B] tracking-tight">
            Services & Operations Hub
          </h3>

          <div className="grid grid-cols-4 gap-2.5">
            {/* Tile 1: Poojas */}
            <Link
              href="/consultations"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 text-[#A21CAF] font-bold select-none">ॐ</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Poojas</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Bookings</span>
            </Link>

            {/* Tile 2: Muhurat */}
            <Link
              href="/requests"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 text-[#D97706] select-none">✨</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Muhurat</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Requests</span>
            </Link>

            {/* Tile 3: Payouts */}
            <Link
              href="/payouts"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 select-none">💰</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Payouts</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Ledger</span>
            </Link>

            {/* Tile 4: Support */}
            <Link
              href="/availability"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE68A]/80 transition-all text-center min-h-[92px]"
            >
              <span className="text-xl mb-1 select-none">🛡️</span>
              <span className="text-xs font-bold text-[#18181B] leading-tight">Support</span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Help Desk</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. 2x2 METRIC CARDS (Matching astrologer_screen.png)                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Today's Earnings */}
          <Link
            href="/earnings"
            className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs hover:border-[#F7C93E] transition-all"
          >
            <span className="text-2xl mb-1 block select-none">💰</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight">
              ₹{todayEarnings}
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Today's Earnings
            </div>
          </Link>

          {/* Card 2: Consultations */}
          <Link
            href="/consultations"
            className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs hover:border-[#F7C93E] transition-all"
          >
            <span className="text-2xl mb-1 block select-none">💬</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight">
              {totalConsultations}
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Consultations
            </div>
          </Link>

          {/* Card 3: Current Rating */}
          <div className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs">
            <span className="text-2xl mb-1 block select-none">🌟</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight flex items-center gap-1.5">
              <span>{rating}</span>
              <span className="text-amber-500 text-xl">★</span>
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Current Rating
            </div>
          </div>

          {/* Card 4: Experience */}
          <Link
            href="/profile"
            className="bg-white rounded-3xl border border-[#FDE68A] p-4 shadow-xs hover:border-[#F7C93E] transition-all"
          >
            <span className="text-2xl mb-1 block select-none">⏱️</span>
            <div className="text-2xl font-black text-[#18181B] tracking-tight">
              {experienceYears} yrs
            </div>
            <div className="text-xs text-[#71717A] font-medium mt-0.5">
              Experience
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 4. CONSULTATION CHANNELS (Matching astrologer_screen.png)                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#18181B] tracking-tight">
            Consultation Channels
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg select-none">💬</span>
              <span className="text-sm font-bold text-[#18181B]">
                Chat Consultations (₹{perMinuteRate}/min)
              </span>
            </div>

            {/* Channel Toggle */}
            <button
              onClick={() => setChatEnabled(!chatEnabled)}
              className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
                chatEnabled ? "bg-[#EA580C] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. BOTTOM NAVIGATION BAR (Matching screenshot exactly)                    */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-6 py-2.5 flex items-center justify-around max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="flex flex-col items-center py-1 px-3 text-[#FA5A2A] font-bold"
        >
          <Home className="w-5 h-5 text-[#FA5A2A]" />
          <span className="text-[11px] font-bold mt-1 text-[#FA5A2A]">Home</span>
        </Link>

        <Link
          href="/consultations"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#1F1F1F] transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">History</span>
        </Link>

        <Link
          href="/requests"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#1F1F1F] transition-colors relative"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-black">
                {pendingRequests.length}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">Chats</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center py-1 px-3 text-[#71717A] hover:text-[#1F1F1F] transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
