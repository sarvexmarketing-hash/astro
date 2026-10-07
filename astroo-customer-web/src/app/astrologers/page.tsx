"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { astrologersService } from "@/services/astrologers";
import { walletService } from "@/services/wallet";
import { Astrologer } from "@/lib/types";
import WalletModal from "@/components/WalletModal";
import {
  Search,
  Star,
  CheckCircle2,
  MessageSquare,
  Phone,
  Video,
  Languages,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";

// Curated fallbacks in case of initial database hydration
const FALLBACK_ASTROLOGERS: Astrologer[] = [
  {
    id: "deecc343-302f-41a2-8aa0-d2a5509dc1bd",
    display_name: "Pt. Javed Sayed",
    bio: "Senior Vedic Astrologer, Vastu Expert & Kundli Specialist with deep planetary analysis expertise.",
    experience_years: 12,
    hourly_rate: 1500,
    per_minute_rate: 25,
    is_verified: true,
    is_online: true,
    is_busy: false,
    rating: 5.0,
    total_reviews: 420,
    total_consultations: 1250,
    languages: ["English", "Hindi", "Urdu"],
    specializations: ["Vedic", "Kundli", "Numerology", "Career & Wealth"],
  },
  {
    id: "f7d44301-df84-477f-a4c2-e080768d378c",
    display_name: "Acharya Aditya Sharma",
    bio: "Renowned Prashna Kundli, Vedic Marriage compatibility & Love Relationship counselor.",
    experience_years: 15,
    hourly_rate: 1800,
    per_minute_rate: 30,
    is_verified: true,
    is_online: true,
    is_busy: false,
    rating: 4.9,
    total_reviews: 890,
    total_consultations: 2400,
    languages: ["Hindi", "Sanskrit", "English"],
    specializations: ["Vedic", "Marriage", "Love & Relationship", "Kundli"],
  },
  {
    id: "903ddb5f-cf6c-492a-90f0-e3cd330d9b17",
    display_name: "Tarot Reader Meera",
    bio: "Intuitive Tarot Master, Angel Card Healer and Crystal Energy Consultant.",
    experience_years: 8,
    hourly_rate: 1200,
    per_minute_rate: 20,
    is_verified: true,
    is_online: true,
    is_busy: false,
    rating: 4.8,
    total_reviews: 310,
    total_consultations: 950,
    languages: ["English", "Hindi"],
    specializations: ["Tarot", "Love & Relationship", "Career & Wealth"],
  },
  {
    id: "5dadadc0-f71a-4d44-adfd-5587612bdfcb",
    display_name: "Dr. Raman Shastri",
    bio: "PhD in Jyotish Vidya, specialist in Kaal Sarp & Manglik Dosha remedies.",
    experience_years: 20,
    hourly_rate: 2400,
    per_minute_rate: 40,
    is_verified: true,
    is_online: true,
    is_busy: false,
    rating: 5.0,
    total_reviews: 1450,
    total_consultations: 4100,
    languages: ["Hindi", "English", "Gujarati"],
    specializations: ["Vedic", "Kundli", "Vastu", "Marriage"],
  },
  {
    id: "b1c2dc67-988a-4b84-bb5e-5cf62b5aa523",
    display_name: "Numerologist Priya Kapoor",
    bio: "Name correction, Business numerology, and destiny matrix specialist.",
    experience_years: 9,
    hourly_rate: 1500,
    per_minute_rate: 25,
    is_verified: true,
    is_online: true,
    is_busy: false,
    rating: 4.9,
    total_reviews: 520,
    total_consultations: 1600,
    languages: ["English", "Hindi", "Punjabi"],
    specializations: ["Numerology", "Career & Wealth", "Tarot"],
  },
  {
    id: "9a68ac9f-fd01-4f29-be64-fa10f87cc7ec",
    display_name: "Pandit Radhe Mohan",
    bio: "Specialist in Muhurat, Griha Pravesh, Vedic Pooja ritual counseling.",
    experience_years: 14,
    hourly_rate: 1500,
    per_minute_rate: 25,
    is_verified: true,
    is_online: false,
    is_busy: false,
    rating: 4.7,
    total_reviews: 260,
    total_consultations: 780,
    languages: ["Hindi", "Sanskrit"],
    specializations: ["Vedic", "Vastu", "Marriage"],
  },
];

const CATEGORIES = [
  "All",
  "Vedic",
  "Kundli",
  "Tarot",
  "Love & Relationship",
  "Career & Wealth",
  "Marriage",
  "Numerology",
  "Vastu",
];

function AstrologersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChannel = searchParams.get("channel") || "chat"; // 'chat' | 'call' | 'all'

  const { user, isAuthenticated } = useAuth();

  // State
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<"chat" | "call" | "all">(
    initialChannel === "call" ? "call" : "chat"
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "price_asc" | "price_desc">("rating");
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Dialog & Modal State
  const [insufficientDialog, setInsufficientDialog] = useState<{
    show: boolean;
    astrologer: Astrologer | null;
    mode: "chat" | "call";
    requiredAmount: number;
  }>({
    show: false,
    astrologer: null,
    mode: "chat",
    requiredAmount: 100,
  });
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Load Astrologers & Wallet
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedAstrologers, w] = await Promise.all([
        astrologersService.list(),
        walletService.getWallet().catch(() => null),
      ]);

      if (fetchedAstrologers && fetchedAstrologers.length > 0) {
        setAstrologers(fetchedAstrologers);
      } else {
        setAstrologers(FALLBACK_ASTROLOGERS);
      }

      if (w?.balance !== undefined) {
        setWalletBalance(Number(w.balance));
      }
    } catch (err) {
      console.warn("Using fallback astrologers:", err);
      setAstrologers(FALLBACK_ASTROLOGERS);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered & Sorted Astrologers
  const filteredAstrologers = useMemo(() => {
    return astrologers
      .filter((astro) => {
        // Online filter
        if (onlyOnline && !astro.is_online) return false;

        // Category filter
        if (selectedCategory !== "All") {
          const specs = (astro.specializations || []).join(" ").toLowerCase();
          const bio = (astro.bio || "").toLowerCase();
          const target = selectedCategory.toLowerCase();
          const matchesCategory =
            specs.includes(target) ||
            bio.includes(target) ||
            (target.includes("love") && (specs.includes("love") || bio.includes("love") || specs.includes("relationship"))) ||
            (target.includes("career") && (specs.includes("career") || bio.includes("career") || specs.includes("wealth"))) ||
            (target.includes("marriage") && (specs.includes("marriage") || bio.includes("marriage") || specs.includes("kundli")));
          if (!matchesCategory) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const name = (astro.display_name || "").toLowerCase();
          const bio = (astro.bio || "").toLowerCase();
          const specs = (astro.specializations || []).join(" ").toLowerCase();
          const langs = (astro.languages || []).join(" ").toLowerCase();
          if (!name.includes(q) && !bio.includes(q) && !specs.includes(q) && !langs.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "experience") return (b.experience_years || 0) - (a.experience_years || 0);
        if (sortBy === "price_asc") return (a.per_minute_rate || 0) - (b.per_minute_rate || 0);
        if (sortBy === "price_desc") return (b.per_minute_rate || 0) - (a.per_minute_rate || 0);
        return 0;
      });
  }, [astrologers, onlyOnline, selectedCategory, searchQuery, sortBy]);

  // Handle Starting Chat Consultation
  const handleStartChat = (astro: Astrologer) => {
    if (user && user.id === astro.id) {
      alert(
        `You are logged in as this astrologer (${astro.display_name}). You cannot start a consultation with yourself. Please select another certified astrologer to chat as a seeker, or open your Astrologer Portal.`
      );
      return;
    }

    const rate = astro.per_minute_rate || 25;
    const minRequired = Math.max(75, rate * 3); // 3 mins threshold

    if (!isAuthenticated) {
      // Direct redirect to login with return target
      router.push(`/login?redirect=/chat/${astro.id}`);
      return;
    }

    if (walletBalance < minRequired) {
      setInsufficientDialog({
        show: true,
        astrologer: astro,
        mode: "chat",
        requiredAmount: minRequired,
      });
      return;
    }

    // Direct navigation into live chat
    router.push(`/chat/${astro.id}`);
  };

  // Handle Starting Call Consultation
  const handleStartCall = (astro: Astrologer) => {
    if (user && user.id === astro.id) {
      alert(
        `You are logged in as this astrologer (${astro.display_name}). You cannot start a consultation with yourself. Please select another certified astrologer to call.`
      );
      return;
    }

    const rate = (astro.per_minute_rate || 25) + 10;
    const minRequired = Math.max(100, rate * 3);

    if (!isAuthenticated) {
      router.push(`/login?redirect=/call/${astro.id}`);
      return;
    }

    if (walletBalance < minRequired) {
      setInsufficientDialog({
        show: true,
        astrologer: astro,
        mode: "call",
        requiredAmount: minRequired,
      });
      return;
    }

    router.push(`/call/${astro.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-28">
      {/* ── Top Hero / Mode Banner ── */}
      <section className="bg-gradient-to-b from-[#FEF9C3] via-[#FFFBEB] to-[#FFFDF7] border-b border-[#FDE68A]/60 pt-6 pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF08A] text-[#78350F] text-xs font-bold border border-[#F7C93E] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Verified Vedic Practitioners</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
                {activeChannel === "call" ? "Call an Astrologer" : "Chat with Astrologer"}
              </h1>
              <p className="text-xs sm:text-sm text-[#71717A] max-w-2xl mt-1">
                {activeChannel === "call"
                  ? "Talk directly to India's top certified Vedic Pandits, Tarot masters & Numerologists via crystal-clear voice calling."
                  : "Connect instantly with top certified Vedic Astrologers, Kundli Readers & Tarot Masters for 1-on-1 private live chat guidance."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-[#FDE68A] shadow-xs self-start md:self-auto">
              <button
                onClick={() => setActiveChannel("chat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeChannel === "chat"
                    ? "bg-[#FEF08A] text-[#78350F] shadow-2xs border border-[#F7C93E]"
                    : "text-[#71717A] hover:text-[#18181B]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveChannel("call")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeChannel === "call"
                    ? "bg-[#FEF08A] text-[#78350F] shadow-2xs border border-[#F7C93E]"
                    : "text-[#71717A] hover:text-[#18181B]"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>
              <button
                onClick={() => setActiveChannel("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeChannel === "all"
                    ? "bg-[#FEF08A] text-[#78350F] shadow-2xs border border-[#F7C93E]"
                    : "text-[#71717A] hover:text-[#18181B]"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>All Masters</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Quick Filters */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search by name, skill (Vedic, Tarot, Kundli), or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#FDE68A] rounded-2xl text-xs sm:text-sm text-[#18181B] placeholder-[#71717A] focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Online Toggle & Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlyOnline(!onlyOnline)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                  onlyOnline
                    ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]"
                    : "bg-white text-[#71717A] border-[#FDE68A] hover:bg-[#FFFBEB]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${onlyOnline ? "bg-[#16A34A] animate-pulse" : "bg-zinc-400"}`} />
                <span>Online Only</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#FDE68A] text-[#18181B] text-xs font-bold py-2.5 px-3 rounded-2xl focus:outline-none focus:border-[#F7C93E] cursor-pointer shadow-2xs"
              >
                <option value="rating">⭐ Top Rated</option>
                <option value="experience">💼 Experience: High to Low</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💰 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Chips Carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#FEF08A] text-[#78350F] border border-[#F7C93E] shadow-2xs"
                    : "bg-white text-[#71717A] border border-[#FDE68A] hover:bg-[#FEF3C7]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Astrologer Directory Grid ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Count Bar */}
        <div className="flex items-center justify-between pb-4">
          <p className="text-xs font-bold text-[#71717A]">
            Showing <span className="text-[#18181B]">{filteredAstrologers.length}</span> certified astrologers
          </p>
          {(searchQuery || selectedCategory !== "All" || onlyOnline) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setOnlyOnline(false);
              }}
              className="text-xs font-bold text-[#D97706] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-[#FDE68A] shadow-xs animate-pulse space-y-4"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-amber-100 rounded w-3/4" />
                    <div className="h-3 bg-amber-50 rounded w-1/2" />
                    <div className="h-3 bg-amber-50 rounded w-2/3" />
                  </div>
                </div>
                <div className="h-10 bg-amber-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredAstrologers.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-[#FDE68A] shadow-xs max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] mx-auto flex items-center justify-center text-3xl">
              🔮
            </div>
            <h3 className="text-base font-bold text-[#18181B]">No Astrologers Found</h3>
            <p className="text-xs text-[#71717A]">
              We couldn't find any astrologer matching your current filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setOnlyOnline(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#78350F] text-xs font-bold transition-all"
            >
              Show All Astrologers
            </button>
          </div>
        ) : (
          /* Astrologers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAstrologers.map((astro) => (
              <div
                key={astro.id}
                className="bg-white rounded-3xl p-4 sm:p-5 flex flex-col justify-between border border-[#FDE68A] shadow-xs hover:border-[#F7C93E] hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Upper Card Info */}
                <div>
                  <div className="flex gap-3.5 items-start">
                    {/* Avatar with Status Badge */}
                    <div className="relative shrink-0">
                      <Link href={`/astrologers/${astro.id}`}>
                        {astro.avatar_url ? (
                          <img
                            src={astro.avatar_url}
                            alt={astro.display_name}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-amber-300 shadow-xs group-hover:border-[#F7C93E] transition-colors"
                          />
                        ) : (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center text-amber-800 font-bold text-2xl shadow-xs">
                            {astro.display_name.charAt(0)}
                          </div>
                        )}
                      </Link>

                      {/* Online/Offline status indicator */}
                      <span
                        className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border-2 border-white flex items-center gap-1 shadow-xs ${
                          astro.is_busy
                            ? "bg-amber-500 text-white"
                            : astro.is_online
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-400 text-white"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            astro.is_busy
                              ? "bg-white"
                              : astro.is_online
                              ? "bg-white animate-pulse"
                              : "bg-zinc-200"
                          }`}
                        />
                        {astro.is_busy ? "Busy" : astro.is_online ? "Online" : "Offline"}
                      </span>
                    </div>

                    {/* Astrologer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link href={`/astrologers/${astro.id}`}>
                          <h3 className="font-bold text-[#18181B] text-sm sm:text-base truncate hover:text-[#D97706] transition-colors">
                            {astro.display_name}
                          </h3>
                        </Link>
                        {astro.is_verified && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 fill-emerald-100" />
                        )}
                        {user?.id === astro.id && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#FEF08A] text-[#78350F] text-[10px] font-black border border-[#F7C93E]">
                            You (Your Profile)
                          </span>
                        )}
                      </div>

                      {/* Specialization Tags */}
                      <p className="text-xs text-[#71717A] truncate mt-0.5 font-medium">
                        {astro.specializations?.length
                          ? astro.specializations.slice(0, 3).join(", ")
                          : "Vedic, Kundli, Tarot"}
                      </p>

                      {/* Languages */}
                      <div className="flex items-center gap-1 text-[11px] text-[#71717A] mt-1">
                        <Languages className="h-3 w-3 shrink-0 text-[#B45309]" />
                        <span className="truncate">
                          {astro.languages?.join(", ") || "English, Hindi"}
                        </span>
                      </div>

                      {/* Experience & Orders */}
                      <div className="flex items-center gap-1 text-[11px] text-[#71717A] mt-0.5">
                        <Briefcase className="h-3 w-3 shrink-0 text-[#B45309]" />
                        <span>{astro.experience_years || 5}+ yrs</span>
                        <span className="mx-1">•</span>
                        <span>{astro.total_consultations || 150}+ orders</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Rate Per Minute */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#FDE68A]/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 bg-[#FEF08A] border border-[#F7C93E] px-2 py-0.5 rounded-lg shadow-2xs">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold text-[#78350F]">
                          {astro.rating ? Number(astro.rating).toFixed(1) : "5.0"}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71717A]">
                        ({astro.total_reviews || 36} reviews)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#18181B]">
                        ₹{astro.per_minute_rate || 25}
                      </span>
                      <span className="text-[10px] text-[#71717A]">/min</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons: Chat & Call */}
                <div className="mt-3.5 pt-3 border-t border-[#FDE68A]/60 grid grid-cols-2 gap-2">
                  {/* Chat Button (Always prominent) */}
                  <button
                    onClick={() => handleStartChat(astro)}
                    disabled={astro.is_busy || user?.id === astro.id}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all font-bold text-xs shadow-2xs cursor-pointer active:scale-98 disabled:opacity-50 ${
                      user?.id === astro.id
                        ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                        : "bg-[#FEF08A] hover:bg-[#FACC15] text-[#78350F] border border-[#F7C93E]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>{user?.id === astro.id ? "Your Profile" : "Chat"}</span>
                  </button>

                  {/* Call Button */}
                  <button
                    onClick={() => handleStartCall(astro)}
                    disabled={astro.is_busy || user?.id === astro.id}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all font-bold text-xs shadow-2xs cursor-pointer active:scale-98 disabled:opacity-50 ${
                      user?.id === astro.id
                        ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                        : "bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] border border-[#86EFAC]"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{user?.id === astro.id ? "Your Profile" : "Call"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Floating Offer Banner (First Chat Offer) ── */}
      <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-20">
        <div className="bg-[#18181B] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-amber-400/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] text-[#78350F] flex items-center justify-center text-xl shrink-0 font-bold">
              🎁
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                First Chat Offer: 5 Mins Free
              </h4>
              <p className="text-[11px] text-zinc-300 truncate">
                Consult with top verified astrologers with 100% moneyback guarantee
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const onlineMaster =
                filteredAstrologers.find((a) => a.is_online && a.id !== user?.id) ||
                filteredAstrologers.find((a) => a.id !== user?.id) ||
                filteredAstrologers[0];
              if (onlineMaster) handleStartChat(onlineMaster);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black text-xs font-black shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            Chat Now
          </button>
        </div>
      </div>

      {/* ── Insufficient Balance Dialog ── */}
      {insufficientDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-[#FDE68A] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() =>
                setInsufficientDialog({ show: false, astrologer: null, mode: "chat", requiredAmount: 100 })
              }
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 text-[#71717A]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#D97706] border border-[#FDE68A] flex items-center justify-center text-2xl mx-auto">
              💳
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#18181B]">Low Wallet Balance</h3>
              <p className="text-xs text-[#71717A]">
                You need a minimum balance of{" "}
                <span className="font-bold text-[#18181B]">
                  ₹{insufficientDialog.requiredAmount}
                </span>{" "}
                to start a {insufficientDialog.mode} consultation with{" "}
                <span className="font-bold text-[#D97706]">
                  {insufficientDialog.astrologer?.display_name || "this astrologer"}
                </span>
                .
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between text-xs">
              <span className="text-[#71717A]">Current Wallet Balance:</span>
              <span className="font-extrabold text-[#18181B]">₹{walletBalance.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  const astroId = insufficientDialog.astrologer?.id;
                  setInsufficientDialog({ show: false, astrologer: null, mode: "chat", requiredAmount: 100 });
                  if (astroId) router.push(`/chat/${astroId}`);
                }}
                className="py-2.5 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-[#71717A] hover:bg-zinc-50 transition-colors"
              >
                Proceed Anyway
              </button>
              <button
                onClick={() => {
                  setInsufficientDialog({ show: false, astrologer: null, mode: "chat", requiredAmount: 100 });
                  setShowWalletModal(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#FEF08A] hover:bg-[#FACC15] text-[#78350F] border border-[#F7C93E] text-xs font-bold transition-all shadow-xs"
              >
                Recharge Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wallet Recharge Modal ── */}
      {showWalletModal && (
        <WalletModal
          currentBalance={walletBalance}
          onClose={() => setShowWalletModal(false)}
          onSuccess={(newBalance) => {
            setWalletBalance(newBalance);
            setShowWalletModal(false);
          }}
          suggestedAmount={250}
        />
      )}
    </div>
  );
}

export default function AstrologersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
        </div>
      }
    >
      <AstrologersListContent />
    </Suspense>
  );
}
