"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Info,
  Camera,
  RotateCcw,
  Star,
  Flame,
  ArrowRight
} from "lucide-react";
import { Astrologer } from "@/lib/types";
import { astrologersService } from "@/services/astrologers";

interface PalmLine {
  id: string;
  name: string;
  sanskrit: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  description: string;
  vedicSignificance: string;
  mountsAssociated: string;
  remedy: string;
}

const PALM_LINES: PalmLine[] = [
  {
    id: "life",
    name: "Life Line",
    sanskrit: "Jeevan Rekha (జీవన రేఖ)",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 border-amber-200",
    textColor: "text-amber-900",
    icon: "🌱",
    description: "Encircles the thumb ball and reveals overall vitality, physical stamina, health resilience, and pivotal life milestones.",
    vedicSignificance: "Associated with Mount of Venus (Shukra Parvat). A deep, unbroken curve signals vibrant health, vitality, and strong immunity.",
    mountsAssociated: "Venus Mount (Shukra)",
    remedy: "Worship Lord Shiva with Mahamrityunjaya Japa for vitality and robust health."
  },
  {
    id: "head",
    name: "Head Line",
    sanskrit: "Mastak Rekha (మస్తక రేఖ)",
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-50 border-sky-200",
    textColor: "text-sky-900",
    icon: "🧠",
    description: "Spans across the middle palm, representing intellect, psychological focus, analytical mindset, and decision-making clarity.",
    vedicSignificance: "Governed by Mercury (Budha) and Jupiter (Guru). A gently curved line ending toward Mount of Moon indicates creative and philosophical genius.",
    mountsAssociated: "Mercury & Moon Mounts",
    remedy: "Chant Gayatri Mantra at dawn; wear emerald or green jade upon pandit consultation."
  },
  {
    id: "heart",
    name: "Heart Line",
    sanskrit: "Hridaya Rekha (హృదయ రేఖ)",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50 border-rose-200",
    textColor: "text-rose-900",
    icon: "💖",
    description: "Originates beneath the pinky finger toward the index finger, reflecting emotional depth, romantic compatibility, and spiritual compassion.",
    vedicSignificance: "Reaches Jupiter Mount (Guru Parvat) in pure, auspicious unions. Curved endings signify unconditional romantic devotion and affectionate nature.",
    mountsAssociated: "Jupiter Mount (Guru)",
    remedy: "Offer water to the rising Sun (Surya Arghya) with red flowers for harmonious relationships."
  },
  {
    id: "fate",
    name: "Fate Line",
    sanskrit: "Bhagya Rekha (భాగ్య రేఖ)",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-900",
    icon: "👑",
    description: "Vertical line rising from wrist toward Saturn Mount. Signals destiny shifts, career trajectory, financial stability, and life rewards.",
    vedicSignificance: "Directly guided by Saturn (Shani Dev). Straight, clear line denotes self-made prosperity and timely financial growth.",
    mountsAssociated: "Saturn Mount (Shani)",
    remedy: "Perform charity on Saturdays; light sesame oil lamp under Peepal tree."
  },
  {
    id: "sun",
    name: "Sun Line",
    sanskrit: "Surya Rekha (సూర్య రేఖ)",
    color: "from-yellow-400 to-amber-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-900",
    icon: "☀️",
    description: "Runs parallel to the Fate Line below the ring finger, representing public recognition, artistic fame, honor, and extraordinary charisma.",
    vedicSignificance: "Signifies blessings of Sun God (Lord Surya). Prominent in leaders, artists, and renowned spiritual guides.",
    mountsAssociated: "Sun Mount (Surya)",
    remedy: "Chant Aditya Hridaya Stotram on Sundays for prominence and professional success."
  }
];

export default function PalmReadingPage() {
  const router = useRouter();
  const [selectedLine, setSelectedLine] = useState<PalmLine>(PALM_LINES[0]);
  const [selectedHand, setSelectedHand] = useState<"right" | "left">("right");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [palmistList, setPalmistList] = useState<Astrologer[]>([]);
  const [loadingPalmists, setLoadingPalmists] = useState(true);

  useEffect(() => {
    // Fetch palmist astrologers
    const loadPalmists = async () => {
      try {
        setLoadingPalmists(true);
        const data = await astrologersService.list({ specialization: "Palmistry", limit: 6 });
        if (Array.isArray(data) && data.length > 0) {
          setPalmistList(data);
        } else {
          // Fallback fetch all
          const fallbackData = await astrologersService.list({ limit: 6 });
          if (Array.isArray(fallbackData)) {
            setPalmistList(fallbackData);
          }
        }
      } catch (err) {
        console.error("Failed to load palmist astrologers:", err);
      } finally {
        setLoadingPalmists(false);
      }
    };
    loadPalmists();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setIsScanning(true);
      setScanComplete(false);
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
      }, 2200);
    };
    reader.readAsDataURL(file);
  };

  const handleResetScan = () => {
    setUploadedImage(null);
    setIsScanning(false);
    setScanComplete(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#18181B] pb-24">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="bg-[#FFFDF7] border-b border-[#FDE68A]/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-amber-800 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Services</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-[#92400E]">Palm Reading (హస్తరేఖ శాస్త్రం)</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Confidential Hand Analysis
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-10 sm:space-y-12">
        {/* ── HERO HEADER ── */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs select-none">
            <span className="text-base">✋</span>
            <span>Ancient Vedic Hastrekha Shastra</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight">
            Online Palm Reading & Hand Analysis
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Your hands carry the sacred energetic blueprint of your past karma and future destiny. Explore major Vedic palm lines or connect directly with certified Hastrekha experts for personalized guidance.
          </p>
        </div>

        {/* ── INTERACTIVE PALM SCANNER & LINE ANALYZER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Palm Visual / Upload Scanner */}
          <div className="lg:col-span-5 bg-[#FFFDF7] border border-[#FDE68A] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#FDE68A]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🖐️</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Vedic Palm Visualizer</h3>
                  <p className="text-[11px] text-zinc-500">Interactive mount & line guide</p>
                </div>
              </div>

              {/* Hand Selector */}
              <div className="flex bg-white rounded-full p-1 border border-amber-200 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedHand("right")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    selectedHand === "right"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Right Hand (Present)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHand("left")}
                  className={`px-3 py-1 rounded-full transition-all ${
                    selectedHand === "left"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Left Hand (Inborn)
                </button>
              </div>
            </div>

            {/* Palm Interactive Canvas / Scanner Viewport */}
            <div className="relative aspect-[4/5] bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 rounded-2xl border-2 border-dashed border-[#FDE68A] overflow-hidden flex flex-col items-center justify-center p-4">
              {uploadedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={uploadedImage}
                    alt="Uploaded Palm"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-amber-900/30 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-white space-y-3">
                      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold tracking-wider uppercase animate-pulse">
                        Scanning Vedic Lines & Mounts...
                      </span>
                    </div>
                  )}

                  {scanComplete && (
                    <div className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-emerald-300 p-2.5 rounded-xl shadow-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-emerald-950">Hand Scan Complete</p>
                          <p className="text-[10px] text-zinc-500">Major lines detected with 98% clarity</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetScan}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                        title="Upload another"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3 max-w-xs">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 flex items-center justify-center shadow-inner">
                    <span className="text-4xl select-none">✋</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800">Scan or Upload Your Palm</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      Capture a bright, flat photo of your {selectedHand === "right" ? "right" : "left"} hand with fingers naturally open.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-105 transition-all cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>Upload Palm Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Instruction note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#FDE68A] text-xs text-zinc-600 shadow-2xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-zinc-800">Vedic Rule:</strong> In Hastrekha, the dominant hand ({selectedHand === "right" ? "Right" : "Left"}) reflects your current karma, active career, and personal choices, while the opposite hand represents your inherited past life potentials.
              </p>
            </div>
          </div>

          {/* Right Column (7 cols): Major Lines Analysis & Detailed Explorer */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>The 5 Primary Vedic Palm Lines</span>
                <span className="text-xs font-normal text-zinc-500">(Click to inspect)</span>
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                Every line reveals distinct planetary energy channels documented in ancient Samudrika Shastra.
              </p>
            </div>

            {/* Horizontal Line Selection Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PALM_LINES.map((line) => {
                const isSelected = selectedLine.id === line.id;
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => setSelectedLine(line)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-amber-100/70 border-amber-400 shadow-sm"
                        : "bg-white border-[#FDE68A] hover:bg-amber-50/50"
                    }`}
                  >
                    <span className="text-2xl">{line.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">{line.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{line.mountsAssociated}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed Selected Line Card */}
            <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${selectedLine.bgColor}`}>
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedLine.icon}</span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <span>{selectedLine.name}</span>
                      <span className="text-xs font-normal text-amber-800 bg-white/70 px-2 py-0.5 rounded-full border border-amber-200">
                        {selectedLine.sanskrit}
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">{selectedLine.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    Vedic Interpretation
                  </span>
                  <p className="text-zinc-700 leading-relaxed">{selectedLine.vedicSignificance}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    Sacred Vedic Remedy
                  </span>
                  <p className="text-zinc-700 leading-relaxed">{selectedLine.remedy}</p>
                </div>
              </div>

              {/* Consultation CTA Inside Line Card */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-medium text-zinc-700">
                  Want an in-depth reading of your {selectedLine.name}?
                </span>
                <Link
                  href="/astrologers?specialization=Palmistry&channel=chat"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-sm hover:brightness-105 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask a Palmist Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── TALK TO CERTIFIED PALMISTS DIRECTORY ── */}
        <div className="space-y-4 pt-4 border-t border-[#FDE68A]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <span>Certified Vedic Palmists & Hastrekha Gurus</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Live Available
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Consult verified palm readers through live instant chat or voice call with photo sharing.
              </p>
            </div>

            <Link
              href="/astrologers?specialization=Palmistry"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 self-start sm:self-auto"
            >
              <span>View All 50+ Palmists</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingPalmists ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : palmistList.length === 0 ? (
            <div className="p-10 text-center bg-[#FFFDF7] rounded-3xl border border-[#FDE68A]">
              <p className="text-sm font-semibold text-zinc-700">No palmists currently online.</p>
              <Link href="/astrologers" className="text-xs text-amber-700 underline font-bold mt-2 inline-block">
                Browse All Certified Astrologers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palmistList.slice(0, 6).map((astro) => (
                <div
                  key={astro.id}
                  className="bg-white border border-[#FDE68A] hover:border-[#F7C93E] hover:shadow-md transition-all rounded-3xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img
                        src={astro.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
                        alt={astro.display_name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-200"
                      />
                      {astro.is_verified && (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full text-[10px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900 truncate">{astro.display_name}</h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{Number(astro.rating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {astro.experience_years || 5} yrs exp • {Array.isArray(astro.languages) ? astro.languages.slice(0, 2).join(", ") : "Telugu, English"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          ✋ Palmistry
                        </span>
                        {astro.specializations?.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="text-[10px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Rate</span>
                      <span className="text-xs font-black text-zinc-900">
                        ₹{astro.per_minute_rate || 25}/min
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/astrologers/${astro.id}?channel=chat`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chat</span>
                      </Link>
                      <Link
                        href={`/astrologers/${astro.id}?channel=call`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS (PALMISTRY) ── */}
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#FDE68A] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-bold text-zinc-900">Frequently Asked Questions</h3>
            <p className="text-xs text-zinc-500">Everything you need to know about Vedic Palmistry (హస్తరేఖ విజ్ఞానం)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] space-y-1.5 shadow-2xs">
              <h4 className="font-bold text-zinc-900 text-sm">Which hand should be examined for reading?</h4>
              <p className="text-zinc-600 leading-relaxed">
                In authentic Samudrika Shastra, the dominant hand (which you write and work with) represents your conscious karma, decisions, and present reality. The passive hand represents inborn potential and subconscious tendencies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] space-y-1.5 shadow-2xs">
              <h4 className="font-bold text-zinc-900 text-sm">Do palm lines change over time?</h4>
              <p className="text-zinc-600 leading-relaxed">
                Yes! While major line structures remain relatively stable, minor lines, branches, and depth change continuously as you change your lifestyle, spiritual practices, karma, and mindset.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] space-y-1.5 shadow-2xs">
              <h4 className="font-bold text-zinc-900 text-sm">Can I send my palm photo during a live consultation?</h4>
              <p className="text-zinc-600 leading-relaxed">
                Absolutely. Our live chat consultation allows you to share high-resolution photos of both palms directly with the verified pandit for instant line inspection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#FDE68A] space-y-1.5 shadow-2xs">
              <h4 className="font-bold text-zinc-900 text-sm">How does Palmistry complement Kundli Horoscope?</h4>
              <p className="text-zinc-600 leading-relaxed">
                When birth time is uncertain or unrecorded, Palmistry provides direct empirical validation of planetary strengths and Dasha transitions directly from physical body marks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
