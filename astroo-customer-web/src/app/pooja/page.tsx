"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { poojaService } from "@/services/pooja";
import { PoojaService as PoojaItem } from "@/lib/types";
import {
  ArrowLeft,
  Search,
  Calendar,
  X,
  Star,
  CheckCircle,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function PoojaPage() {
  const router = useRouter();
  const [poojas, setPoojas] = useState<PoojaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [bookingModalPooja, setBookingModalPooja] = useState<PoojaItem | null>(null);
  const [gotra, setGotra] = useState("");
  const [sankalp, setSankalp] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const categories = ["All", "Dosha Shanti", "Wealth & Prosperity", "Health & Longevity", "Griha & Vastu"];

  useEffect(() => {
    loadPoojas();
  }, []);

  const loadPoojas = async () => {
    try {
      setIsLoading(true);
      const list = await poojaService.listServices();
      setPoojas(list || []);
    } catch (err) {
      console.error("Failed to load pooja services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPoojas = React.useMemo(() => {
    return poojas.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        p.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        p.description?.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [poojas, searchQuery, selectedCategory]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalPooja) return;

    try {
      setIsBooking(true);
      await poojaService.bookService({
        pooja_service_id: bookingModalPooja.id,
        scheduled_date: preferredDate || new Date().toISOString().split("T")[0],
        devotee_names: ["Seeker"],
        gotra: gotra || "Kashyapa",
        sankalp: sankalp || "Family peace and prosperity",
      });
      setBookingSuccess(`Pooja "${bookingModalPooja.name}" booked successfully!`);
      setTimeout(() => {
        setBookingModalPooja(null);
        setBookingSuccess(null);
        setGotra("");
        setSankalp("");
        setPreferredDate("");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Failed to book pooja.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 py-3 space-y-4">
        {/* Top App Bar (PoojaMarketplaceScreen.kt lines 53-86) */}
        <div className="flex items-center justify-between py-2 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#18181B]">Book a Pooja</h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              {isSearchActive ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <button
              onClick={() => router.push("/bookings")}
              className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#D97706] transition-colors"
              title="My Bookings"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar (Collapsible) */}
        {isSearchActive && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rituals, deities, sankalp..."
              className="w-full px-4 py-2.5 bg-white border border-[#FDE68A] rounded-xl text-xs sm:text-sm text-[#18181B] focus:outline-none focus:border-[#D97706]"
            />
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#FEF08A] border-[#F7C93E] text-[#78350F]"
                    : "bg-white border-[#FDE68A] text-[#71717A] hover:bg-[#FFFBEB]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Pooja Cards List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
            <span className="text-xs text-[#71717A] mt-2">Loading Vedic rituals...</span>
          </div>
        ) : filteredPoojas.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Sparkles className="w-12 h-12 text-[#D97706]/40 mx-auto" />
            <h3 className="text-sm font-bold text-[#18181B]">No rituals found</h3>
            <p className="text-xs text-[#71717A]">Try adjusting your search query or filter category.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredPoojas.map((pooja) => (
              <div
                key={pooja.id}
                className="bg-white rounded-2xl border border-[#FDE68A] p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF08A] border border-[#F7C93E] flex items-center justify-center text-2xl text-[#78350F] flex-shrink-0">
                    ॐ
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#18181B] truncate">{pooja.name}</h3>
                    <p className="text-xs text-[#71717A] line-clamp-2 mt-0.5 leading-relaxed">
                      {pooja.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#A1A1AA] mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                        {pooja.duration_minutes || 60} mins
                      </span>
                      <span>•</span>
                      <span>Verified Vedic Pandit</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#FDE68A]/60">
                  <div>
                    <span className="text-[10px] text-[#71717A] block">Dakshina</span>
                    <span className="text-base font-bold text-[#18181B]">₹{Number(pooja.price || 1100).toFixed(0)}</span>
                  </div>

                  <button
                    onClick={() => setBookingModalPooja(pooja)}
                    className="px-5 py-2 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-xs shadow-2xs hover:shadow-xs transition-all"
                  >
                    Book Pooja
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Dialog Modal */}
        {bookingModalPooja && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#FDE68A] space-y-4">
              <div className="flex items-center justify-between border-b border-[#FDE68A]/60 pb-2">
                <h3 className="text-base font-bold text-[#18181B] truncate">
                  Book {bookingModalPooja.name}
                </h3>
                <button
                  onClick={() => setBookingModalPooja(null)}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-[#16A34A] mx-auto" />
                  <p className="text-sm font-bold text-[#166534]">{bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#18181B] mb-1">Gotra</label>
                    <input
                      type="text"
                      value={gotra}
                      onChange={(e) => setGotra(e.target.value)}
                      placeholder="e.g., Kashyapa, Bharadwaj"
                      className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#18181B] mb-1">Sankalp / Intention</label>
                    <textarea
                      rows={2}
                      value={sankalp}
                      onChange={(e) => setSankalp(e.target.value)}
                      placeholder="Prayers for family health, peace, career progress..."
                      className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl focus:outline-none focus:border-[#D97706] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#18181B] mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isBooking}
                      className="w-full py-2.5 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Reserving Pooja...</span>
                        </>
                      ) : (
                        <span>Confirm & Book (₹{bookingModalPooja.price})</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
