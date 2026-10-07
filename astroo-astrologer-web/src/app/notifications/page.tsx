"use client";

import { useEffect, useState } from "react";
import { usersService } from "@/services/users";
import { AppNotification } from "@/lib/types";
import { Bell, CheckCheck, Clock, ShieldAlert, Sparkles, MessageSquare, Phone, Wallet } from "lucide-react";

export default function AstrologerNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await usersService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await usersService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await usersService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "consultation_request":
      case "call":
        return <Phone className="w-5 h-5 text-amber-400" />;
      case "chat":
        return <MessageSquare className="w-5 h-5 text-sky-400" />;
      case "payout":
      case "earnings":
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case "security":
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#D97706] flex items-center gap-2">
            <Bell className="w-7 h-7 text-amber-500" />
            Notifications
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            Real-time alerts for incoming consultation calls, completed sessions, and payout settlements.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-amber-500" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#FDE68A] rounded-3xl shadow-sm">
          <Bell className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#B45309] mb-1">No notifications yet</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            When seekers request consultations or your earnings are transferred, updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && handleMarkOneRead(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.is_read
                  ? "bg-white/70 border-amber-100 text-zinc-600"
                  : "bg-white border-amber-300 shadow-sm text-zinc-900"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold truncate ${item.is_read ? "text-zinc-700" : "text-[#B45309]"}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.body || (item as any).message}</p>
              </div>

              {!item.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0 self-center"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
