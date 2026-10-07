"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { consultationsService } from "@/services/consultations";
import { poojaService } from "@/services/pooja";
import { Consultation, PoojaBooking } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function BookingsAndHistoryPage() {
  const router = useRouter();
  const [selectedMainTab, setSelectedMainTab] = useState<"Consultations" | "Pooja">("Consultations");
  const [selectedPoojaTab, setSelectedPoojaTab] = useState<"Upcoming" | "Completed" | "Cancelled">("Upcoming");

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [poojaBookings, setPoojaBookings] = useState<PoojaBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMainTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (selectedMainTab === "Consultations") {
        const list = await consultationsService.getHistory();
        setConsultations(list || []);
      } else {
        const bookings = await poojaService.getMyBookings();
        setPoojaBookings(bookings || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPoojaBookings = React.useMemo(() => {
    return poojaBookings.filter((b) => {
      if (selectedPoojaTab === "Upcoming") return b.status === "pending" || b.status === "confirmed";
      if (selectedPoojaTab === "Completed") return b.status === "completed";
      if (selectedPoojaTab === "Cancelled") return b.status === "cancelled" || b.status === "rejected";
      return true;
    });
  }, [poojaBookings, selectedPoojaTab]);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 py-3 space-y-4">
        {/* Top App Bar */}
        <div className="flex items-center justify-between py-2 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#18181B]">
              {selectedMainTab === "Consultations" ? "Consultation History" : "My Pooja Bookings"}
            </h1>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-[#D97706]" />
          </button>
        </div>

        {/* Main Tab Switcher */}
        <div className="flex border-b border-[#FDE68A]">
          <button
            type="button"
            onClick={() => setSelectedMainTab("Consultations")}
            className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
              selectedMainTab === "Consultations"
                ? "border-[#D97706] text-[#D97706]"
                : "border-transparent text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            Consultations
          </button>
          <button
            type="button"
            onClick={() => setSelectedMainTab("Pooja")}
            className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
              selectedMainTab === "Pooja"
                ? "border-[#D97706] text-[#D97706]"
                : "border-transparent text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            Pooja Bookings
          </button>
        </div>

        {/* Pooja Sub-tabs if Pooja selected (MyPoojaBookingsScreen.kt line 36) */}
        {selectedMainTab === "Pooja" && (
          <div className="flex items-center gap-2">
            {(["Upcoming", "Completed", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedPoojaTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedPoojaTab === tab
                    ? "bg-[#FEF08A] border-[#F7C93E] text-[#78350F]"
                    : "bg-white border-[#FDE68A] text-[#71717A] hover:bg-[#FFFBEB]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
            <span className="text-xs text-[#71717A] mt-2">Loading records...</span>
          </div>
        ) : selectedMainTab === "Consultations" ? (
          /* Consultation History List */
          consultations.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Clock className="w-12 h-12 text-[#D97706]/40 mx-auto" />
              <h3 className="text-sm font-bold text-[#18181B]">No history found</h3>
              <p className="text-xs text-[#71717A]">
                Your past chat and call consultations will be recorded here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-[#FDE68A] p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FEF08A] flex items-center justify-center text-[#78350F]">
                        {c.type === "call" || c.type === "video" ? (
                          <Phone className="w-4 h-4" />
                        ) : (
                          <MessageCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#18181B]">
                          {c.astrologer_name || "Vedic Astrologer"}
                        </h4>
                        <span className="text-[10px] text-[#71717A] capitalize">
                          {c.type} consultation
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        c.state === "ENDED"
                          ? "bg-slate-100 text-slate-700"
                          : c.state === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.state}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#FDE68A]/60 text-[#71717A]">
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    <span className="font-bold text-[#18181B]">
                      {c.total_amount ? `₹${Number(c.total_amount).toFixed(2)}` : `₹${c.rate_per_minute}/min`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Pooja Bookings List */
          filteredPoojaBookings.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Calendar className="w-12 h-12 text-[#D97706]/40 mx-auto" />
              <h3 className="text-sm font-bold text-[#18181B]">No {selectedPoojaTab.toLowerCase()} bookings</h3>
              <p className="text-xs text-[#71717A]">
                Book a personalized ritual with verified Vedic Pandits.
              </p>
              <button
                onClick={() => router.push("/pooja")}
                className="mt-2 px-5 py-2 rounded-xl bg-[#F7C93E] text-[#18181B] font-bold text-xs shadow-xs"
              >
                Browse Poojas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPoojaBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-[#FDE68A] p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#18181B]">{b.service_name || "Vedic Pooja"}</h4>
                      <p className="text-xs text-[#71717A] mt-0.5">Gotra: {b.gotra || "Kashyapa"}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        b.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#FDE68A]/60 text-[#71717A]">
                    <span>Scheduled: {b.booking_date}</span>
                    <span className="font-bold text-[#18181B]">₹{b.total_amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
