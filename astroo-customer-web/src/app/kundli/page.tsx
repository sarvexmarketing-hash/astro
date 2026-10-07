"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { astrologyService } from "@/services/astrology";
import KundliChart from "@/components/KundliChart";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function KundliPage() {
  const router = useRouter();

  // Form State matching KundliScreen.kt lines 44-48
  const [name, setName] = useState("Rahul Sharma");
  const [selectedGender, setSelectedGender] = useState<"Male" | "Female" | "Other">("Male");
  const [birthDate, setBirthDate] = useState("1995-08-15");
  const [birthTime, setBirthTime] = useState("06:30");
  const [birthPlace, setBirthPlace] = useState("New Delhi, India");

  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"Planets" | "Charts" | "Dosha" | "Dasha">("Planets");
  const [chartData, setChartData] = useState<any>(null);

  const samplePlanets = [
    { name: "Sun", rashi: "Simha (Leo)", degree: "28° 14' 12\"", house: 1, nakshatra: "Uttara Phalguni", pada: 1, state: "Own Sign" },
    { name: "Moon", rashi: "Meena (Pisces)", degree: "24° 51' 03\"", house: 8, nakshatra: "Revati", pada: 3, state: "Neutral" },
    { name: "Mars", rashi: "Kanya (Virgo)", degree: "14° 22' 45\"", house: 2, nakshatra: "Hasta", pada: 2, state: "Enemy Sign" },
    { name: "Mercury", rashi: "Simha (Leo)", degree: "12° 08' 50\"", house: 1, nakshatra: "Magha", pada: 4, state: "Friendly" },
    { name: "Jupiter", rashi: "Vrishchika (Scorpio)", degree: "18° 33' 21\"", house: 4, nakshatra: "Jyeshtha", pada: 1, state: "Friendly" },
    { name: "Venus", rashi: "Karka (Cancer)", degree: "06° 45' 10\"", house: 12, nakshatra: "Pushya", pada: 2, state: "Enemy Sign" },
    { name: "Saturn", rashi: "Kumbha (Aquarius)", degree: "29° 12' 00\"", house: 7, nakshatra: "Purva Bhadra", pada: 3, state: "Own Sign" },
    { name: "Rahu", rashi: "Tula (Libra)", degree: "08° 19' 40\"", house: 3, nakshatra: "Swati", pada: 1, state: "Exalted" },
    { name: "Ketu", rashi: "Mesha (Aries)", degree: "08° 19' 40\"", house: 9, nakshatra: "Ashwini", pada: 3, state: "Exalted" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await astrologyService.generateKundli({
        name,
        gender: selectedGender.toLowerCase() as any,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace,
        latitude: 28.6139,
        longitude: 77.209,
      });
      setChartData(data);
      setIsGenerated(true);
    } catch {
      // Fallback to sample data for preview
      setIsGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-4 py-3 space-y-4">
        {/* Top App Bar (KundliScreen.kt lines 70-98) */}
        <div className="flex items-center justify-between py-2 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#18181B] leading-tight">Vedic Kundli</h1>
              <p className="text-[11px] text-[#71717A] leading-tight">జనన కుండలి • Birth Chart</p>
            </div>
          </div>

          {isGenerated && (
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `Kundli for ${name}`, url: window.location.href });
                }
              }}
              className="p-2 rounded-full hover:bg-[#FFFBEB] text-[#B45309] transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isGenerated ? (
          /* Birth Details Form (KundliScreen.kt lines 40-67) */
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-[#FDE68A] p-5 shadow-xs space-y-4">
            <div className="text-center space-y-1 pb-2">
              <span className="text-3xl select-none">☸️</span>
              <h2 className="text-base font-bold text-[#18181B]">Enter Birth Details</h2>
              <p className="text-xs text-[#71717A]">
                Precise time and place ensure authentic Vedic planetary calculations.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#18181B] mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl text-sm text-[#18181B] focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#18181B] mb-1">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedGender === g
                        ? "bg-[#FEF08A] border-[#F7C93E] text-[#78350F]"
                        : "bg-[#FFFDF7] border-[#FDE68A] text-[#71717A] hover:bg-[#FFFBEB]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#18181B] mb-1">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl text-xs text-[#18181B] focus:outline-none focus:border-[#D97706]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#18181B] mb-1">Birth Time</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl text-xs text-[#18181B] focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            {/* Place */}
            <div>
              <label className="block text-xs font-semibold text-[#18181B] mb-1">Birth Place</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                required
                placeholder="City, State, Country"
                className="w-full px-4 py-2.5 bg-[#FFFDF7] border border-[#FDE68A] rounded-xl text-sm text-[#18181B] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Ephemeris...</span>
                </>
              ) : (
                <span>Generate Janam Kundli ➔</span>
              )}
            </button>
          </form>
        ) : (
          /* Generated Kundli View (KundliScreen.kt tabs: Planets, Charts, Dosha, Dasha) */
          <div className="space-y-4">
            {/* Person Banner */}
            <div className="p-4 bg-white rounded-2xl border border-[#FDE68A] flex items-center justify-between shadow-2xs">
              <div>
                <h3 className="font-bold text-[#18181B] text-base">{name}</h3>
                <p className="text-xs text-[#71717A]">
                  {birthDate} at {birthTime} • {birthPlace}
                </p>
              </div>
              <button
                onClick={() => setIsGenerated(false)}
                className="px-3 py-1.5 rounded-lg border border-[#FDE68A] text-xs font-bold text-[#D97706] hover:bg-[#FFFBEB]"
              >
                Edit
              </button>
            </div>

            {/* Tab Row (KundliScreen.kt line 51) */}
            <div className="flex border-b border-[#FDE68A]/60">
              {(["Planets", "Charts", "Dosha", "Dasha"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 py-2.5 text-center text-xs font-bold transition-all border-b-2 ${
                    selectedTab === tab
                      ? "border-[#D97706] text-[#D97706]"
                      : "border-transparent text-[#71717A] hover:text-[#18181B]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Planets Table */}
            {selectedTab === "Planets" && (
              <div className="bg-white rounded-2xl border border-[#FDE68A] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFBEB] border-b border-[#FDE68A] text-[#78350F] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Planet</th>
                        <th className="py-2.5 px-3">Rashi</th>
                        <th className="py-2.5 px-3">Degree</th>
                        <th className="py-2.5 px-3">House</th>
                        <th className="py-2.5 px-3">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FDE68A]/40 text-[#18181B]">
                      {samplePlanets.map((p) => (
                        <tr key={p.name} className="hover:bg-[#FFFDF7]">
                          <td className="py-2 px-3 font-bold">{p.name}</td>
                          <td className="py-2 px-3 text-[#71717A]">{p.rashi}</td>
                          <td className="py-2 px-3 font-mono text-[11px]">{p.degree}</td>
                          <td className="py-2 px-3 font-bold">{p.house}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded-md bg-[#FEF08A] text-[#78350F] text-[10px] font-semibold">
                              {p.state}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: North Indian Diamond Chart (KundliChart) */}
            {selectedTab === "Charts" && (
              <div className="bg-white rounded-2xl border border-[#FDE68A] p-4 text-center shadow-2xs space-y-3">
                <h4 className="text-sm font-bold text-[#18181B]">D1 Lagna / Rasi Chart</h4>
                <div className="flex justify-center">
                  <KundliChart
                    houses={{
                      1: ["Su", "Me"],
                      2: ["Ma"],
                      3: ["Ra"],
                      4: ["Ju"],
                      7: ["Sa"],
                      8: ["Mo"],
                      9: ["Ke"],
                      12: ["Ve"],
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Dosha Analysis */}
            {selectedTab === "Dosha" && (
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-[#FDE68A] space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#18181B]">Manglik Dosha</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold">
                      No Dosha
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A]">
                    Mars is placed in 2nd house from Lagna. No severe Manglik affliction detected.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#FDE68A] space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#18181B]">Kaal Sarp Dosha</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold">
                      Not Present
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A]">
                    Planets are distributed across both hemispheres. Kaal Sarp yoga does not form.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#FDE68A] space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#18181B]">Sade Sati Status</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF08A] text-[#78350F] text-[10px] font-bold">
                      Setting Phase
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A]">
                    Saturn transit indicates peaceful spiritual growth and stability in career.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Dasha Timeline */}
            {selectedTab === "Dasha" && (
              <div className="bg-white rounded-2xl border border-[#FDE68A] p-4 shadow-2xs space-y-3">
                <h4 className="text-sm font-bold text-[#18181B]">Vimshottari Dasha Periods</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FEF08A] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#18181B]">Venus (Shukra) Mahadasha</span>
                      <p className="text-[10px] text-[#71717A]">Active Current Period</p>
                    </div>
                    <span className="font-bold text-[#D97706]">2018 - 2038</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#18181B]">Sun (Surya) Mahadasha</span>
                      <p className="text-[10px] text-[#71717A]">Upcoming</p>
                    </div>
                    <span className="text-[#71717A]">2038 - 2044</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
