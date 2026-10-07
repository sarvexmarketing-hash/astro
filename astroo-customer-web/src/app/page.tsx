"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Astrologer } from "@/lib/types";
import { astrologersService } from "@/services/astrologers";
import { astrologyService } from "@/services/astrology";
import {
  CheckCircle,
  Star,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

// ============================================================================
// DATA & CONSTANTS MATCHING HomeScreen.kt
// ============================================================================
const HERO_ASTROLOGERS = [
  {
    name: "Vedic Jyotish",
    title: "Live Horoscope & Kundli",
    rating: "5.0",
    icon: "🕉️",
    image: "/images/astrologer_vedic_1.jpg",
  },
  {
    name: "Tarot & Vastu",
    title: "Relationship & Career Guidance",
    rating: "5.0",
    icon: "☸️",
    image: "/images/astrologer_female_2.jpg",
  },
  {
    name: "Muhurat & Pooja",
    title: "Auspicious Timing & Rituals",
    rating: "5.0",
    icon: "🔮",
    image: "/images/astrologer_jyotish_3.jpg",
  },
];

const ZODIAC_SIGNS = [
  { name: "Aries", sanskrit: "Mesh", icon: "♈", dates: "Mar 21 - Apr 19" },
  { name: "Taurus", sanskrit: "Vrishabh", icon: "♉", dates: "Apr 20 - May 20" },
  { name: "Gemini", sanskrit: "Mithun", icon: "♊", dates: "May 21 - Jun 20" },
  { name: "Cancer", sanskrit: "Kark", icon: "♋", dates: "Jun 21 - Jul 22" },
  { name: "Leo", sanskrit: "Simha", icon: "♌", dates: "Jul 23 - Aug 22" },
  { name: "Virgo", sanskrit: "Kanya", icon: "♍", dates: "Aug 23 - Sep 22" },
  { name: "Libra", sanskrit: "Tula", icon: "♎", dates: "Sep 23 - Oct 22" },
  { name: "Scorpio", sanskrit: "Vrishchik", icon: "♏", dates: "Oct 23 - Nov 21" },
  { name: "Sagittarius", sanskrit: "Dhanu", icon: "♐", dates: "Nov 22 - Dec 21" },
  { name: "Capricorn", sanskrit: "Makar", icon: "♑", dates: "Dec 22 - Jan 19" },
  { name: "Aquarius", sanskrit: "Kumbh", icon: "♒", dates: "Jan 20 - Feb 18" },
  { name: "Pisces", sanskrit: "Meen", icon: "♓", dates: "Feb 19 - Mar 20" },
];

const SAMPLE_BLOGS = [
  {
    title: "How Planet Saturn Influences Your Career in 2026",
    category: "Planetary Transits",
    author: "Acharya V. K. Shastri",
    date: "Oct 2026",
    preview: "Discover how Shani's celestial movement brings discipline, promotions, and auspicious breakthroughs.",
    content: "Saturn (Shani) represents karma, perseverance, and structure. In 2026, major planetary shifts reward honest effort, opening avenues for stable career progression, government promotions, and long-term financial foundations.",
  },
  {
    title: "The Sacred Power of Griha Pravesh & Shubh Muhurat",
    category: "Vedic Rituals",
    author: "Pandit Ram Naresh",
    date: "Oct 2026",
    preview: "Selecting the ideal planetary alignment to invite Goddess Lakshmi and harmony into your new abode.",
    content: "Entering a new home during an auspicious Choghadiya and Nakshatra ensures peace, prosperity, and warding off negative energies. Discover the prime Muhurat dates calculated with classical Vedic precision.",
  },
  {
    title: "Kundli Matching: Understanding the 36 Gunas in Marriage",
    category: "Vedic Astrology",
    author: "Dr. S. K. Shastri",
    date: "Oct 2026",
    preview: "A comprehensive guide to Ashta Kuta matching and spiritual compatibility between soulmates.",
    content: "In Vedic matrimony, Ashtakoota Milan evaluates mental harmony, longevity, emotional temperament, and progeny. Learn how specific doshas like Manglik can be balanced through authentic Vedic remedies.",
  },
];

const SAMPLE_TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    review: "I was extremely anxious about my career transition. Pt. Jyotish Shastri accurately pinpointed my timeline and the guidance gave me immense peace of mind.",
  },
  {
    name: "Rahul Verma",
    city: "Delhi",
    review: "Connecting in under 10 seconds on chat is incredible! The kundli reading was remarkably precise and practical. 10/10 service.",
  },
  {
    name: "Ananya Iyer",
    city: "Bengaluru",
    review: "The Maha Mrityunjaya pooja was performed with pure devotion. The video consultation made my family feel right at the temple.",
  },
];

export default function HomePage() {
  const router = useRouter();

  // Hero carousel state
  const [centerIndex, setCenterIndex] = useState(1);

  // Astrologers state
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Horoscope state
  const [selectedSign, setSelectedSign] = useState("Aries");
  const [horoscopePrediction, setHoroscopePrediction] = useState<string>(
    "Auspicious cosmic energies surround you today. New opportunities in your professional realm bring positive financial returns."
  );
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);

  // Dialogs state (HomeScreen.kt line 290-346)
  const [corporateTitle, setCorporateTitle] = useState<string | null>(null);
  const [corporateContent, setCorporateContent] = useState("");
  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<(typeof SAMPLE_BLOGS)[0] | null>(null);
  const [showAllBlogsDialog, setShowAllBlogsDialog] = useState(false);

  // FAQ Accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Auto-rotate hero images every 2.6s (HomeScreen.kt line 668-673)
  useEffect(() => {
    const timer = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % 3);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  // Fetch astrologers from backend
  useEffect(() => {
    astrologersService
      .list({ limit: 12 })
      .then((data) => {
        if (data && data.length > 0) setAstrologers(data);
      })
      .catch(() => {});
  }, []);

  // Fetch daily horoscope
  useEffect(() => {
    setHoroscopeLoading(true);
    astrologyService
      .getDailyHoroscope(selectedSign.toLowerCase())
      .then((data) => {
        if (data?.prediction) setHoroscopePrediction(data.prediction);
      })
      .catch(() => {})
      .finally(() => setHoroscopeLoading(false));
  }, [selectedSign]);

  const handleCorporateClick = (title: string) => {
    const texts: Record<string, string> = {
      "Refund & Cancellation Policy":
        "We are dedicated to providing the highest quality astrological consultations and sacred pooja services.\n\n1. Consultation Guarantee: If you experience technical dropouts within 60 seconds, wallet funds are automatically restored.\n2. Pooja Bookings: Cancel or reschedule up to 24 hours prior for a 100% refund.\n3. E-commerce Products: Authentic gemstones and yantras can be returned within 7 days if damaged in transit.",
      "Terms & Conditions":
        "Welcome to Astrowave. By using our consultation features, pooja bookings, and spiritual store, you agree to these Terms.\n\n1. User Account: Users must maintain account confidentiality.\n2. Predictions: Astrology readings are faith and tradition-based advisory services.\n3. Wallet Balances: Wallet recharges are non-transferable.",
      "Privacy Policy":
        "Your personal privacy and spiritual inquiries are strictly confidential.\n\n1. Data Encryption: Birth details and chat sessions are end-to-end protected.\n2. No Third-Party Sharing: We never sell or share your phone numbers or transcripts.\n3. Secure Transactions: Payments are processed through RBI-certified payment gateways.",
      "Disclaimer":
        "Astrology, Tarot, Numerology, Palmistry, and Vastu are ancient traditional sciences offering symbolic and psychological insights.\n\n1. Astrological advice does not substitute professional medical, legal, or financial counsel.\n2. Individual results may vary based on personal karma and effort.",
      "About Us":
        "Astrowave is India's leading online spiritual and astrological ecosystem.\n\n• Over 50,000 verified Astrologers, Vedic Pandits, and Tarot Masters.\n• Over 5 Crore happy seekers worldwide.\n• Mission: To bring authentic Vedic wisdom and peace to modern life.",
      "Pricing Policy":
        "Transparent & Honest Pricing:\n\n• First consultation is completely FREE for new seekers!\n• Astrologer rates start from ₹10/minute based on verified experience.\n• Transparent per-second billing with realtime wallet display.",
    };
    setCorporateTitle(title);
    setCorporateContent(texts[title] || "For corporate inquiries, reach out at contact@astrotalk.com.");
  };

  const categories = ["All", "Vedic", "Kundli", "Love", "Career", "Marriage"];

  const filteredAstrologers = astrologers.filter((astro) => {
    if (selectedCategory === "All") return true;
    const str = `${astro.specializations?.join(" ") || ""} ${astro.bio || ""} ${astro.display_name || ""}`.toLowerCase();
    return str.includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white text-[#18181B] relative">
      {/* Radiant sunlit yellow shading at the top (HomeScreen.kt line 139-152) */}
      <div className="absolute top-0 left-0 right-0 h-[520px] bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7]/45 to-white pointer-events-none z-0" />

      {/* Main Container: Mobile friendly + Full Laptop/Desktop Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 space-y-6 sm:space-y-8">
        
        {/* ===================================================================== */}
        {/* 1. HERO SECTION: Responsive 2-Column on Laptop, Centered on Phone      */}
        {/* ===================================================================== */}
        <div className="pt-4 md:pt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
          
          {/* Left Column: Heading, Value Props, CTA, Online Badge & Stats */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-4 sm:space-y-5">
            {/* Online Badge (HomeScreen.kt line 485-520) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FDE68A] shadow-xs select-none">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-semibold text-[#18181B]">
                Verified astrologers online now
              </span>
              <div className="flex -space-x-1.5 ml-1">
                <span className="w-4.5 h-4.5 rounded-full bg-[#EAB308] border border-white inline-block" />
                <span className="w-4.5 h-4.5 rounded-full bg-[#D97706] border border-white inline-block" />
                <span className="w-4.5 h-4.5 rounded-full bg-[#B45309] border border-white inline-block" />
              </div>
            </div>

            {/* Headline Section (HomeScreen.kt line 522-544) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#18181B] leading-tight tracking-tight">
              India&apos;s most accurate <br />
              <span className="text-[#C07B00]">astrology platform</span>
            </h1>

            {/* Features Checkmarks (HomeScreen.kt line 546-575) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm font-medium text-[#3F3F46]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-[#16A34A] flex-shrink-0" />
                <span>Get Free detailed kundli</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-[#16A34A] flex-shrink-0" />
                <span>Average reply under 12 seconds</span>
              </div>
            </div>

            {/* Start Free Chat Button */}
            <div className="pt-1">
              <Link
                href="/astrologers?channel=chat"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-base shadow-sm hover:shadow transition-all"
              >
                <span>Start Free Chat  ➔</span>
              </Link>
            </div>

            {/* Stats Row (HomeScreen.kt line 596-624) */}
            <div className="w-full pt-4 border-t border-[#FEF08A]/80">
              <div className="grid grid-cols-4 gap-2 text-center md:text-left">
                <div>
                  <div className="text-sm sm:text-base font-bold text-[#18181B]">100%</div>
                  <div className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5">Confidential</div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-[#18181B]">Verified</div>
                  <div className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5">Vedic Pandits</div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-[#18181B]">Multi</div>
                  <div className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5">Languages</div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-[#18181B]">24x7</div>
                  <div className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5">Live Guidance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3-Card Carousel (HomeScreen.kt line 635-842) */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] h-[310px] sm:h-[360px] flex items-center justify-center select-none py-2">
              {HERO_ASTROLOGERS.map((astro, idx) => {
                const pos = (idx - centerIndex + 3) % 3; // 0: Center, 1: Right, 2: Left
                const isCenter = pos === 0;
                const isRight = pos === 1;

                return (
                  <div
                    key={astro.name}
                    onClick={() => setCenterIndex(idx)}
                    className={`absolute transition-all duration-700 ease-out cursor-pointer overflow-hidden ${
                      isCenter
                        ? "w-[210px] sm:w-[250px] h-[290px] sm:h-[340px] rounded-[30px] sm:rounded-[36px] border-4 border-[#F7C93E] shadow-2xl z-20 scale-100"
                        : isRight
                        ? "w-[136px] sm:w-[170px] h-[200px] sm:h-[245px] rounded-[22px] sm:rounded-[28px] border-[2.5px] border-[#FDE68A] shadow-lg z-10 translate-x-[75px] sm:translate-x-[115px] translate-y-4 opacity-90 hover:opacity-100"
                        : "w-[136px] sm:w-[170px] h-[200px] sm:h-[245px] rounded-[22px] sm:rounded-[28px] border-[2.5px] border-[#FDE68A] shadow-lg z-10 -translate-x-[75px] sm:-translate-x-[115px] translate-y-4 opacity-90 hover:opacity-100"
                    }`}
                  >
                    {/* Astrologer Photo */}
                    <img
                      src={astro.image}
                      alt={astro.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Bottom Gradient Scrim */}
                    <div
                      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#18181B] to-transparent ${
                        isCenter ? "h-28 opacity-90" : "h-20 opacity-75"
                      }`}
                    />

                    {/* Info Overlay */}
                    {isCenter ? (
                      <div className="absolute inset-x-0 bottom-0 p-3.5 text-center flex flex-col items-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#F7C93E] text-[10px] font-bold text-[#78350F] mb-1 shadow-2xs">
                          ⭐ 5.0 • Top Verified
                        </span>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {astro.name}
                        </h3>
                        <p className="text-[11px] text-[#FEF08A] font-medium leading-tight mt-0.5">
                          {astro.title}
                        </p>
                      </div>
                    ) : (
                      <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#18181B]/80 text-[10px] font-bold text-white truncate max-w-full">
                          {astro.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. RECENT ACTIVITY TICKER (HomeScreen.kt line 932-953)               */}
        {/* ===================================================================== */}
        <div className="p-3 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#92400E] shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg select-none">🛡️</span>
            <span>100% Private, Confidential & Verified Vedic Consultations</span>
          </div>
          <span className="hidden sm:inline text-xs text-[#B45309] font-bold">
            Average Connect &lt; 12s
          </span>
        </div>

        {/* ===================================================================== */}
        {/* 3. SERVICES GRID: 2x3 on Mobile, 6 across on Laptop (HomeScreen.kt)  */}
        {/* ===================================================================== */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#18181B] mb-3">
            Spiritual & Astrological Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Tile 1: Chat with Astrologer */}
            <Link
              href="/astrologers?channel=chat"
              className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-3xl mb-1.5 select-none">💬</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors leading-tight">
                Chat with Astrologer
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Instant Text</span>
            </Link>

            {/* Tile 2: Call Astrologer */}
            <Link
              href="/astrologers?channel=call"
              className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-3xl mb-1.5 select-none">📞</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors leading-tight">
                Call Astrologer
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Voice Audio</span>
            </Link>

            {/* Tile 3: Daily Horoscope */}
            <a
              href="#horoscope"
              className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-3xl mb-1.5 select-none">☀️</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors leading-tight">
                Daily Horoscope
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">12 Zodiacs</span>
            </a>

            {/* Tile 4: Book Muhurtham */}
            <Link
              href="/muhurat"
              className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-3xl mb-1.5 select-none">✨</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors leading-tight">
                Book Muhurtham
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Auspicious Dates</span>
            </Link>

            {/* Tile 5: Get Free Kundli */}
            <Link
              href="/kundli"
              className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-3xl mb-1.5 select-none">☸️</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors leading-tight">
                Get Free Kundli
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Janam Chart</span>
            </Link>

            {/* Tile 6: Astro Shop */}
            <Link
              href="/pooja"
              className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <span className="text-3xl mb-1.5 select-none">🛍️</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors leading-tight">
                Astro Shop & Pooja
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">Rituals & Malas</span>
            </Link>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. ASTROLOGER DIRECTORY: 1-col Phone, 2/3-col Laptop (HomeScreen.kt)  */}
        {/* ===================================================================== */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18181B]">
                Talk to Certified Astrologers
              </h2>
              <p className="text-xs text-[#71717A]">
                Instant consultation with verified Vedic Pandits & Tarot Readers
              </p>
            </div>
            
            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#FEF08A] text-[#78350F] border border-[#F7C93E]"
                      : "bg-[#FFFBEB] text-[#71717A] border border-[#FDE68A] hover:bg-[#FEF3C7]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Astrologers Grid: 1 col on mobile, 2 col on tablet, 3 col on laptop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredAstrologers.slice(0, 6).map((astro) => (
              <div
                key={astro.id}
                className="p-4 bg-white rounded-2xl border border-[#FDE68A] shadow-2xs flex items-center justify-between gap-3 hover:border-[#F7C93E] hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-amber-100 flex-shrink-0 border border-amber-300">
                    {astro.avatar_url ? (
                      <img
                        src={astro.avatar_url}
                        alt={astro.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-amber-800">
                        {astro.display_name[0]}
                      </div>
                    )}
                    {astro.is_online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#18181B] truncate">
                      {astro.display_name}
                    </h4>
                    <p className="text-[11px] text-[#71717A] truncate">
                      {astro.specializations?.join(", ") || "Vedic, Kundli, Tarot"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#52525B]">
                      <span className="flex items-center text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                        {astro.rating ? Number(astro.rating).toFixed(1) : "5.0"}
                      </span>
                      <span>•</span>
                      <span>{astro.experience_years || 5} yrs</span>
                      <span>•</span>
                      <span className="font-bold text-[#18181B]">
                        ₹{astro.per_minute_rate || 25}/min
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/chat/${astro.id}`}
                  className="px-4 py-2 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#1E1E1E] text-xs font-bold shadow-2xs transition-colors flex-shrink-0"
                >
                  Chat
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/astrologers?channel=chat"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D97706] hover:underline"
            >
              <span>View All 50+ Certified Astrologers</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 5. DAILY HOROSCOPE: 12-Zodiac Grid (HomeScreen.kt line 1350-1450)     */}
        {/* ===================================================================== */}
        <div id="horoscope" className="space-y-4 pt-4 border-t border-[#FDE68A]/60">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B]">
              Daily Horoscope Predictions
            </h2>
            <p className="text-xs text-[#71717A]">
              Select your zodiac sign for personalized Vedic planetary forecasts
            </p>
          </div>

          {/* 12 Zodiac Sign Grid: 4 cols Phone, 6 cols Tablet, 12 cols Laptop */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-2.5">
            {ZODIAC_SIGNS.map((z) => (
              <button
                key={z.name}
                onClick={() => setSelectedSign(z.name)}
                className={`p-2.5 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                  selectedSign === z.name
                    ? "bg-[#FEF08A] border-[#F7C93E] shadow-xs scale-105"
                    : "bg-white border-[#FDE68A]/80 hover:bg-[#FFFBEB]"
                }`}
              >
                <span className="text-2xl select-none">{z.icon}</span>
                <span className="text-xs font-bold text-[#18181B] mt-1 truncate w-full">
                  {z.name}
                </span>
                <span className="text-[10px] text-[#71717A] -mt-0.5">{z.sanskrit}</span>
              </button>
            ))}
          </div>

          {/* Forecast Box */}
          <div className="p-5 rounded-3xl bg-[#FEF3C7]/40 border border-[#FDE68A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#78350F]">
                {selectedSign} ({ZODIAC_SIGNS.find((z) => z.name === selectedSign)?.sanskrit}) Today&apos;s Forecast
              </span>
              <span className="text-xs font-bold text-[#92400E] bg-[#FEF08A] px-2.5 py-0.5 rounded-full border border-[#F7C93E]">
                Today
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#1E1E1E] leading-relaxed">
              {horoscopePrediction}
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 6. OUR SERVICES HORIZONTAL/GRID (HomeScreen.kt line 1250-1320)         */}
        {/* ===================================================================== */}
        <div className="space-y-4 pt-2 border-t border-[#FDE68A]/60">
          <h2 className="text-lg sm:text-xl font-bold text-[#18181B]">
            Sacred Rituals & Astrological Reports
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            <Link
              href="/#horoscope"
              className="p-4 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex flex-col items-center text-center hover:bg-[#FEF08A] transition-all group"
            >
              <span className="text-3xl mb-1.5 select-none">☀️</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706]">Daily Horoscope</span>
              <span className="text-[11px] text-[#71717A] mt-0.5">Free Daily Insights</span>
            </Link>

            <Link
              href="/pooja"
              className="p-4 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex flex-col items-center text-center hover:bg-[#FEF08A] transition-all group"
            >
              <span className="text-3xl mb-1.5 text-[#A21CAF] font-bold select-none">ॐ</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706]">Book a Pooja</span>
              <span className="text-[11px] text-[#71717A] mt-0.5">Temple Rituals</span>
            </Link>

            <Link
              href="/kundli"
              className="p-4 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex flex-col items-center text-center hover:bg-[#FEF08A] transition-all group"
            >
              <span className="text-3xl mb-1.5 select-none">☸️</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706]">Free Janam Kundli</span>
              <span className="text-[11px] text-[#71717A] mt-0.5">Birth Chart Analysis</span>
            </Link>

            <Link
              href="/muhurat"
              className="p-4 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex flex-col items-center text-center hover:bg-[#FEF08A] transition-all group"
            >
              <span className="text-3xl mb-1.5 select-none">✨</span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#D97706]">Shubh Muhurat</span>
              <span className="text-[11px] text-[#71717A] mt-0.5">Auspicious Dates 2026</span>
            </Link>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 7. TESTIMONIALS & BLOG: 3 Columns on Laptop (HomeScreen.kt)          */}
        {/* ===================================================================== */}
        <div className="pt-2 border-t border-[#FDE68A]/60 space-y-6">
          {/* Testimonials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[#18181B]">
                What Our Seekers Say
              </h2>
              <button
                onClick={() => setShowReviewsDialog(true)}
                className="text-xs sm:text-sm font-bold text-[#D97706] hover:underline cursor-pointer"
              >
                View All Reviews
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {SAMPLE_TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="p-4 bg-white rounded-2xl border border-[#FDE68A] shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <p className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#FDE68A]/40">
                    <div>
                      <span className="text-xs font-bold text-[#18181B] block">{t.name}</span>
                      <span className="text-[10px] text-[#71717A]">{t.city}</span>
                    </div>
                    <span className="text-amber-500 text-xs font-bold">★★★★★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blogs */}
          <div id="blog" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[#18181B]">
                Astrology Blog & Vedic Wisdom
              </h2>
              <button
                onClick={() => setShowAllBlogsDialog(true)}
                className="text-xs sm:text-sm font-bold text-[#D97706] hover:underline cursor-pointer"
              >
                All Articles
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {SAMPLE_BLOGS.map((b) => (
                <div
                  key={b.title}
                  onClick={() => setSelectedBlog(b)}
                  className="p-4 bg-white rounded-2xl border border-[#FDE68A] shadow-2xs hover:border-[#F7C93E] hover:shadow-sm transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider">
                      {b.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#18181B] mt-1 leading-snug">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-[#71717A] line-clamp-2 mt-1">
                      {b.preview}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#71717A] pt-2 border-t border-[#FDE68A]/40">
                    <span>By {b.author}</span>
                    <span className="text-[#D97706] font-bold">Read Article ➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 8. FAQ ACCORDION                                                      */}
        {/* ===================================================================== */}
        <div className="space-y-3 pt-4 border-t border-[#FDE68A]/60">
          <h2 className="text-lg sm:text-xl font-bold text-[#18181B]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {[
              {
                q: "How does the First Free Chat consultation work?",
                a: "New seekers get an instant introductory session with a certified Vedic astrologer completely free. Simply tap 'Start Free Chat' or 'Chat Now' and connect with any online astrologer.",
              },
              {
                q: "Are the astrologers verified and authentic?",
                a: "Yes. Every astrologer undergoes a strict 4-stage interview, certificate verification, and test consultation process before being onboarded on Astrowave.",
              },
              {
                q: "Is my consultation private and confidential?",
                a: "100%. All chats and audio calls are end-to-end encrypted. We never share your personal birth details with any third parties.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-2xl border border-[#FDE68A] shadow-2xs cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#18181B]">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#71717A] transition-transform ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {expandedFaq === i && (
                  <p className="text-xs sm:text-sm text-[#52525B] mt-2 pt-2 border-t border-[#FDE68A]/60 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 9. 1:1 FOOTER SECTION (HomeScreen.kt line 2318-2454)                  */}
        {/* ===================================================================== */}
        <footer className="pt-8 border-t border-[#FDE68A]/60 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* Column 1: Brand & SEO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FFE814] border border-amber-300 flex items-center justify-center">
                  <img
                    src="/images/app_logo.png"
                    alt="Astrowave Logo"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <div>
                  <span className="text-base font-bold text-[#18181B]">Astrowave</span>
                  <p className="text-[11px] text-[#18181B]/70 -mt-0.5">ఆస్ట్రోవేవ్</p>
                </div>
              </div>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Astrotalk is the best astrology website for online Astrology predictions. Talk to Astrologer on call and get answers to all your worries by seeing the future life through Astrology Kundli Predictions from the best Astrologers from India.
              </p>
            </div>

            {/* Column 2: Horoscope Links */}
            <div>
              <h5 className="font-bold text-[#18181B] tracking-wider uppercase mb-2">
                HOROSCOPE
              </h5>
              <div className="flex flex-col space-y-1.5 text-[#52525B]">
                {["Daily Horoscope", "Yesterday's Horoscope", "Tomorrow's Horoscope", "Weekly Horoscope", "Monthly Horoscope"].map(
                  (l) => (
                    <a key={l} href="#horoscope" className="hover:text-[#18181B]">
                      {l}
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Column 3: Corporate Info */}
            <div>
              <h5 className="font-bold text-[#18181B] tracking-wider uppercase mb-2">
                CORPORATE INFO
              </h5>
              <div className="flex flex-col space-y-1.5 text-[#52525B]">
                {[
                  "Refund & Cancellation Policy",
                  "Terms & Conditions",
                  "Privacy Policy",
                  "Disclaimer",
                  "About Us",
                  "Pricing Policy",
                ].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleCorporateClick(l)}
                    className="text-left hover:text-[#D97706] font-medium cursor-pointer"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 4: Portals & Contact */}
            <div className="space-y-3">
              <div>
                <h5 className="font-bold text-[#18181B] tracking-wider uppercase mb-2">
                  PLATFORM ACCESS
                </h5>
                <div className="space-y-1.5">
                  <Link href="/astrologers" className="block text-[#D97706] font-bold hover:underline">
                    Astrologer Portal & Login ➔
                  </Link>
                  <Link href="/admin" className="block text-purple-700 font-bold hover:underline">
                    Central Admin Console ➔
                  </Link>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#18181B] tracking-wider uppercase mb-1">
                  CONTACT US
                </h5>
                <Link
                  href="/astrologers?channel=chat"
                  className="block text-[#52525B] hover:text-[#18181B]"
                >
                  💬 24x7 Live Chat Support
                </Link>
                <a
                  href="mailto:contact@astrotalk.com"
                  className="block text-[#D97706] font-bold hover:underline mt-0.5"
                >
                  ✉️ contact@astrotalk.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#FDE68A]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#71717A]">
            <p>© {new Date().getFullYear()} Astrowave. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>100% Confidential & Secure</span>
              <span>•</span>
              <span>24x7 Vedic Guidance</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* 10. FLOATING BOTTOM CARD (HomeScreen.kt line 844-930)                    */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto pointer-events-auto">
          <div className="p-3 sm:p-3.5 bg-white rounded-3xl border border-[#FDE68A] shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FFE814] border border-amber-300 flex-shrink-0 flex items-center justify-center shadow-2xs">
                <img
                  src="/images/app_logo.png"
                  alt="Logo"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[#18181B] truncate leading-tight">
                  First Chat Free
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-[#71717A] mt-0.5 truncate">
                  <span className="text-amber-500 font-bold">★★★★★</span>
                  <span className="truncate">| Instant Vedic Connect</span>
                </div>
              </div>
            </div>

            <Link
              href="/astrologers?channel=chat"
              className="px-5 py-2.5 rounded-full bg-[#F7C93E] hover:bg-[#FACC15] text-[#18181B] font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex-shrink-0"
            >
              Chat Now
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CORPORATE INFO MODAL DIALOG (HomeScreen.kt line 291-324)                  */}
      {/* ========================================================================= */}
      {corporateTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#FDE68A] max-h-[85vh] flex flex-col">
            <h3 className="text-base font-bold text-[#D97706]">{corporateTitle}</h3>
            <div className="flex-1 overflow-y-auto text-xs text-[#3F3F46] leading-relaxed whitespace-pre-line pr-1">
              {corporateContent}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setCorporateTitle(null)}
                className="px-4 py-2 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-xs font-bold text-[#78350F] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEWS MODAL DIALOG (HomeScreen.kt line 2618-2699)                       */}
      {/* ========================================================================= */}
      {showReviewsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#FDE68A] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#D97706]">Customer Reviews</h3>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                4.8 ★ Trusted
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {SAMPLE_TESTIMONIALS.map((t) => (
                <div key={t.name} className="p-3 bg-[#FFFBEB] rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{t.name} ({t.city})</span>
                    <span className="text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-[#3F3F46]">{t.review}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowReviewsDialog(false)}
                className="px-4 py-2 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-xs font-bold text-[#78350F] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BLOG DETAIL DIALOG (HomeScreen.kt line 2502-2559)                         */}
      {/* ========================================================================= */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-3 shadow-2xl border border-[#FDE68A] max-h-[85vh] flex flex-col">
            <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider">
              {selectedBlog.category}
            </span>
            <h3 className="text-sm font-bold text-[#18181B]">{selectedBlog.title}</h3>
            <div className="flex justify-between text-[10px] text-[#71717A] pb-2 border-b border-[#FDE68A]/60">
              <span>By {selectedBlog.author}</span>
              <span>{selectedBlog.date}</span>
            </div>
            <div className="flex-1 overflow-y-auto text-xs text-[#3F3F46] leading-relaxed pr-1">
              {selectedBlog.content}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-xs font-bold text-[#78350F] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
