"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { astrologyService } from "@/services/astrology";
import {
  ArrowLeft,
  Search,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  Home,
  Baby,
  Car,
  Briefcase,
  GraduationCap,
  Plane,
  Sun,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function MuhuratPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [muhuratData, setMuhuratData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Categories from mobile app (MuhuratScreen.kt line 82)
  const categories = [
    { id: "marriage", title: "Marriage Muhurtham", icon: "💍", desc: "Vivaha Muhurtham for lifelong marital harmony and prosperity." },
    { id: "housewarming", title: "Griha Pravesh", icon: "🏡", desc: "Auspicious timing for entering a new home or house warming rituals." },
    { id: "vehicle", title: "Vehicle Purchase", icon: "🚗", desc: "Vahan Kharidi Muhurat for safe journeys and vehicle longevity." },
    { id: "jobbusiness", title: "Job & Business Opening", icon: "💼", desc: "Shubh Muhurat for new ventures, office opening, or joining job." },
    { id: "naming", title: "Namkaran Ceremony", icon: "👶", desc: "Auspicious naming ceremony timing according to Janma Nakshatra." },
    { id: "education", title: "Vidyaarambh & Study", icon: "🎓", desc: "Commencement of education, admission, or competitive exams." },
    { id: "travel", title: "Yatra & Long Travel", icon: "✈️", desc: "Auspicious departure timing avoiding Disha Shool." },
    { id: "religious", title: "Religious Ceremonies", icon: "🕉️", desc: "Havan, Yagna, Satyanarayan Katha, and spiritual observances." },
  ];

  useEffect(() => {
    loadMuhurat(selectedDate);
  }, [selectedDate]);

  const loadMuhurat = async (date: string) => {
    try {
      setIsLoading(true);
      const data = await astrologyService.calculateMuhurat({ date });
      setMuhuratData(data);
    } catch (err) {
      console.error("Failed to calculate muhurat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 py-3 space-y-4">
        {/* Top App Bar (MuhuratScreen.kt lines 33-49) */}
        <div className="flex items-center justify-between py-2 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#18181B]">Book Muhurtham</h1>
          </div>

          <div className="p-2 text-[#71717A]">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Headline & Description (MuhuratScreen.kt lines 66-78) */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B]">
            Book Your Auspicious Muhurtham
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
            Choose a Muhurat to discover the most favorable date and time for your important life events.
          </p>
        </div>

        {/* Date Selector for Panchang Muhurat */}
        <div className="p-4 bg-white rounded-2xl border border-[#FDE68A] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18181B]">Calculate Daily Shubh Choghadiya</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl text-xs font-semibold text-[#18181B] focus:outline-none"
            />
          </div>

          {isLoading ? (
            <div className="py-6 flex justify-center text-xs text-[#71717A] gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
              <span>Consulting Vedic Panchang...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#DCFCE7] border border-emerald-200">
                <span className="text-[10px] text-[#166534] font-bold block uppercase tracking-wider">
                  Abhijit Muhurat (Auspicious)
                </span>
                <span className="text-sm font-bold text-[#15803D] mt-0.5 block">
                  {muhuratData?.abhijit_muhurat ? `${muhuratData.abhijit_muhurat.start} – ${muhuratData.abhijit_muhurat.end}` : "11:54 AM – 12:46 PM"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FEE2E2] border border-red-200">
                <span className="text-[10px] text-[#991B1B] font-bold block uppercase tracking-wider">
                  Rahu Kaal (Avoid)
                </span>
                <span className="text-sm font-bold text-[#B91C1C] mt-0.5 block">
                  {muhuratData?.rahu_kaal ? `${muhuratData.rahu_kaal.start} – ${muhuratData.rahu_kaal.end}` : "04:30 PM – 06:00 PM"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Categories List (MuhuratScreen.kt lines 81-89) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-[#18181B]">Select Auspicious Event Category</h3>
          <div className="space-y-2.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => router.push(`/astrologers?channel=chat`)}
                className="p-4 bg-white rounded-2xl border border-[#FDE68A] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF08A] border border-[#F7C93E] flex items-center justify-center text-2xl flex-shrink-0">
                    {cat.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#18181B] truncate">{cat.title}</h4>
                    <p className="text-xs text-[#71717A] mt-0.5 leading-tight">{cat.desc}</p>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-[#FEF08A] text-[#78350F] text-xs font-bold flex-shrink-0">
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
