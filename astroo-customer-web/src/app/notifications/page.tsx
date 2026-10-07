"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/services/users";
import { AppNotification } from "@/lib/types";
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Phone,
  Wallet,
  Sparkles,
  Tag,
  Clock,
  Loader2,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("All");

  const tabs = ["All", "Consultations", "Bookings", "Payments", "Offers"];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const list = await usersService.getNotifications();
      setNotifications(list || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
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

  const filteredNotifications = React.useMemo(() => {
    if (selectedTab === "All") return notifications;
    if (selectedTab === "Consultations") {
      return notifications.filter((n) => n.type?.includes("consultation") || n.type?.includes("chat") || n.type?.includes("call"));
    }
    if (selectedTab === "Bookings") {
      return notifications.filter((n) => n.type?.includes("pooja") || n.type?.includes("booking") || n.type?.includes("muhurat"));
    }
    if (selectedTab === "Payments") {
      return notifications.filter((n) => n.type?.includes("payment") || n.type?.includes("wallet") || n.type?.includes("recharge"));
    }
    if (selectedTab === "Offers") {
      return notifications.filter((n) => n.type?.includes("offer") || n.type?.includes("promo") || n.type?.includes("marketing"));
    }
    return notifications;
  }, [notifications, selectedTab]);

  const getIcon = (type: string) => {
    if (type?.includes("chat") || type?.includes("consultation")) {
      return <MessageCircle className="w-5 h-5 text-[#D97706]" />;
    }
    if (type?.includes("call")) {
      return <Phone className="w-5 h-5 text-[#10B981]" />;
    }
    if (type?.includes("payment") || type?.includes("wallet")) {
      return <Wallet className="w-5 h-5 text-[#2563EB]" />;
    }
    if (type?.includes("offer")) {
      return <Tag className="w-5 h-5 text-[#9333EA]" />;
    }
    return <Sparkles className="w-5 h-5 text-[#D97706]" />;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-md sm:max-w-xl mx-auto px-4 py-3 space-y-4">
        {/* Top App Bar (NotificationsScreen.kt lines 51-79) */}
        <div className="flex items-center justify-between py-2 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#18181B]">Notifications</h1>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#D97706] hover:underline"
          >
            Mark all read
          </button>
        </div>

        {/* Category Tabs (NotificationsScreen.kt line 88) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#FEF08A] border-[#F7C93E] text-[#78350F]"
                    : "bg-white border-[#FDE68A] text-[#71717A] hover:bg-[#FFFBEB]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Notifications List (NotificationsScreen.kt) */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
            <span className="text-xs text-[#71717A] mt-2">Loading alerts...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Bell className="w-12 h-12 text-[#D97706]/40 mx-auto" />
            <h3 className="text-sm font-bold text-[#18181B]">No notifications</h3>
            <p className="text-xs text-[#71717A]">
              You're all caught up with your consultation and wallet alerts.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  item.is_read
                    ? "bg-white border-[#FDE68A]/60 shadow-2xs opacity-80"
                    : "bg-[#FFFBEB] border-[#FDE68A] shadow-xs"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center flex-shrink-0">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-[#18181B] truncate">{item.title}</h4>
                    <span className="text-[10px] text-[#71717A] flex-shrink-0">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">{item.body}</p>
                </div>

                {!item.is_read && (
                  <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
