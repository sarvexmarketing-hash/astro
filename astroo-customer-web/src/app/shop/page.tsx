"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { poojaService } from "@/services/pooja";
import {
  Search,
  Gem,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Filter,
  Package,
  Award,
  Compass,
  X,
  PhoneCall,
  MessageCircle,
  Lock,
} from "lucide-react";

export interface AstroProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  duration_minutes: number; // Used as MRP
  price: number;
  image_url: string;
  benefits?: string[];
  samagri_included?: boolean;
}

const CATEGORIES = [
  "All",
  "Gemstones",
  "Crystals",
  "Rudraksha",
  "Yantras",
];

const PLANETARY_FILTERS = [
  { name: "All Planets", key: "all" },
  { name: "Jupiter (Pukhraj)", key: "jupiter" },
  { name: "Saturn (Neelam)", key: "saturn" },
  { name: "Sun (Manikya)", key: "sun" },
  { name: "Mercury (Panna)", key: "mercury" },
  { name: "Mars (Moonga)", key: "mars" },
  { name: "Moon (Moti)", key: "moon" },
  { name: "Venus (Zircon)", key: "venus" },
  { name: "Rahu / Ketu", key: "shadow" },
];

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AstroProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlanet, setSelectedPlanet] = useState("all");

  // Buy / Energisation Modal State
  const [selectedProduct, setSelectedProduct] = useState<AstroProduct | null>(null);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [sankalpGotra, setSankalpGotra] = useState("");
  const [rashiNakshatra, setRashiNakshatra] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await poojaService.listServices();
      // Only keep shop-suitable items: Gemstones, Crystals, Rudraksha, Yantras, or items with high price/benefit profiles
      const mapped: AstroProduct[] = (res || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        description: p.description || "",
        category: p.category || (p.name.toLowerCase().includes("pooja") ? "Pooja" : "Gemstones"),
        duration_minutes: Number(p.duration_minutes) || Math.round(Number(p.price) * 1.5),
        price: Number(p.price) || 0,
        image_url: p.image_url || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80",
        benefits: Array.isArray(p.benefits) ? p.benefits : [],
        samagri_included: p.samagri_included ?? true,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load shop products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Exclude pure temple poojas from gem shop unless searching
      if (selectedCategory === "All" && p.category === "Pooja" && !searchQuery) {
        return false;
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.benefits && p.benefits.some((b) => b.toLowerCase().includes(q)));

      const matchesCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      let matchesPlanet = true;
      if (selectedPlanet !== "all") {
        const textToScan = `${p.name} ${p.description} ${(p.benefits || []).join(" ")}`.toLowerCase();
        if (selectedPlanet === "jupiter") matchesPlanet = textToScan.includes("jupiter") || textToScan.includes("guru") || textToScan.includes("pukhraj") || textToScan.includes("citrine");
        else if (selectedPlanet === "saturn") matchesPlanet = textToScan.includes("saturn") || textToScan.includes("shani") || textToScan.includes("neelam") || textToScan.includes("amethyst");
        else if (selectedPlanet === "sun") matchesPlanet = textToScan.includes("sun") || textToScan.includes("surya") || textToScan.includes("ruby") || textToScan.includes("manik");
        else if (selectedPlanet === "mercury") matchesPlanet = textToScan.includes("mercury") || textToScan.includes("budh") || textToScan.includes("emerald") || textToScan.includes("panna");
        else if (selectedPlanet === "mars") matchesPlanet = textToScan.includes("mars") || textToScan.includes("mangal") || textToScan.includes("coral") || textToScan.includes("moonga");
        else if (selectedPlanet === "moon") matchesPlanet = textToScan.includes("moon") || textToScan.includes("chandra") || textToScan.includes("pearl") || textToScan.includes("moti");
        else if (selectedPlanet === "venus") matchesPlanet = textToScan.includes("venus") || textToScan.includes("shukra") || textToScan.includes("zircon") || textToScan.includes("diamond");
        else if (selectedPlanet === "shadow") matchesPlanet = textToScan.includes("rahu") || textToScan.includes("ketu") || textToScan.includes("gomed") || textToScan.includes("cat's eye") || textToScan.includes("lehsuniya");
      }

      return matchesSearch && matchesCategory && matchesPlanet;
    });
  }, [products, searchQuery, selectedCategory, selectedPlanet]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!shippingName || !shippingPhone || !shippingAddress || !shippingPincode) {
      alert("Please provide your delivery name, phone, address, and pincode.");
      return;
    }

    try {
      setIsOrdering(true);
      // Create booking / order via existing pooja service endpoint
      await poojaService.bookService({
        pooja_service_id: selectedProduct.id,
        scheduled_date: new Date().toISOString().split("T")[0],
        devotee_names: [shippingName],
        gotra: sankalpGotra || "Vedic Kashyapa",
        sankalp: `Astro Gemstone Order: ${selectedProduct.name} - Consecrated for ${rashiNakshatra || "Prosperity & Protection"} - Shipping to ${shippingAddress}, ${shippingCity} - ${shippingPincode}`,
      });

      setOrderSuccess(`Order Placed! Your authentic "${selectedProduct.name}" will be Vedic Energised and dispatched to ${shippingCity || "your address"}.`);
      setTimeout(() => {
        setOrderSuccess(null);
        setSelectedProduct(null);
        setShippingAddress("");
      }, 3500);
    } catch (err: any) {
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#18181B] pb-24">
      {/* Hero Astromall Banner */}
      <div className="bg-gradient-to-b from-[#FEF3C7]/80 to-[#FFFDF5] border-b border-[#FDE68A]/60 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/90 text-amber-900 border border-amber-300 rounded-full text-xs font-semibold shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            100% Certified Astrological Gemstones & Energised Stones
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#18181B]">
            Sacred Astro Gems & Planetary Stones
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600">
            Handpicked, lab-certified Navratna gemstones, energised crystals, and consecrated malas prescribed by Vedic astrologers to harmonize planetary doshas and attract abundance.
          </p>

          {/* Quick Consult Astrologer CTA */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <Link
              href="/astrologers?channel=chat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Not sure which Gem suits you? Ask Astrologer
            </Link>
            <Link
              href="/kundli"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:bg-amber-50 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              Check Planetary Rashi in Kundli
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search & Planetary Filters */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search gemstones (e.g. Pukhraj, Neelam, Panna, Ruby, Pyrite, Rudraksha)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-white border border-zinc-200 text-zinc-700 hover:border-amber-300 hover:bg-amber-50/50"
                }`}
              >
                {cat === "Gemstones" && "💎 "}
                {cat === "Crystals" && "🔮 "}
                {cat === "Rudraksha" && "📿 "}
                {cat === "Yantras" && "🕉️ "}
                {cat}
              </button>
            ))}
          </div>

          {/* Planetary Specific Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-zinc-400 font-medium whitespace-nowrap pl-1">Planetary Filter:</span>
            {PLANETARY_FILTERS.map((pf) => (
              <button
                key={pf.key}
                onClick={() => setSelectedPlanet(pf.key)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedPlanet === pf.key
                    ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                    : "bg-white text-zinc-600 border border-zinc-150 hover:bg-zinc-50"
                }`}
              >
                {pf.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">Loading authentic astrological gems & stones...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs">
            <Gem className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-700">No gemstones or products found</h3>
            <p className="text-xs sm:text-sm text-zinc-500">
              Try adjusting your search query or selecting a different planetary category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedPlanet("all");
              }}
              className="mt-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const mrp = product.duration_minutes || Math.round(product.price * 1.5);
              const discount = Math.round(((mrp - product.price) / mrp) * 100);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
                >
                  {/* Top Image Box */}
                  <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        {product.category}
                      </span>
                      {product.samagri_included && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3" />
                          Lab Certified & Energised
                        </span>
                      )}
                    </div>

                    {discount > 0 && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-extrabold shadow-xs">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {/* Astrologer Recommendation Pill */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Astrologer Prescribed Vedic Stone
                      </div>

                      <h3 className="text-base font-bold text-[#18181B] line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Benefits Bullets */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {product.benefits.slice(0, 3).map((b, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded-md"
                            >
                              ✓ {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price and Action Footer */}
                    <div className="pt-3 border-t border-zinc-150 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-[#18181B]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {mrp > product.price && (
                            <span className="text-xs text-zinc-400 line-through">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>5.0 (Vedic Verified)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Astrologer Consultation Guarantee Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              100% Astrological Purity Guarantee
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Need a personalized Gemstone recommendation for your Kundli?
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Wearing the wrong gemstone can agitate malefic planetary doshas. Consult our verified Jyotish Acharyas to analyze your Lagna, Janma Rashi, and planetary Mahadasha before selecting your stone.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/astrologers?channel=chat"
              className="px-5 py-2.5 bg-white text-amber-900 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-amber-50 transition-all text-center flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-amber-600" />
              Chat with Astrologer
            </Link>
            <Link
              href="/astrologers?channel=call"
              className="px-5 py-2.5 bg-amber-900/40 border border-white/40 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-amber-900/60 transition-all text-center flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Call Astrologer
            </Link>
          </div>
        </div>
      </div>

      {/* Buy & Consecration Order Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 my-8 space-y-4 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-lg font-extrabold text-zinc-800">Order Placed Successfully!</h3>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-md mx-auto">
                  {orderSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="flex items-start gap-3.5 pb-3 border-b border-zinc-150">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 leading-snug pt-0.5">
                      {selectedProduct.name}
                    </h3>
                    <div className="text-sm font-extrabold text-amber-600 pt-0.5">
                      ₹{selectedProduct.price.toLocaleString("en-IN")}
                      <span className="text-xs text-zinc-400 font-normal line-through ml-1.5">
                        ₹{(selectedProduct.duration_minutes || Math.round(selectedProduct.price * 1.5)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Vedic Consecration & Energisation Included
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90">
                    Our verified Vedic Pandits will perform Pran Pratishtha and chant planetary mantras in your name & gotra before courier dispatch.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Seeker Name"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 Mobile Number"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Gotra (For Sankalp)</label>
                      <input
                        type="text"
                        placeholder="e.g. Kashyapa, Bharadwaj"
                        value={sankalpGotra}
                        onChange={(e) => setSankalpGotra(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Rashi / Nakshatra</label>
                      <input
                        type="text"
                        placeholder="e.g. Mithun, Rohini"
                        value={rashiNakshatra}
                        onChange={(e) => setRashiNakshatra(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Street address, Flat / House No, Landmark"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">City / Town *</label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        placeholder="6 Digit PIN"
                        value={shippingPincode}
                        onChange={(e) => setShippingPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-semibold hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isOrdering}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {isOrdering ? "Placing Order..." : `Confirm Order (₹${selectedProduct.price.toLocaleString("en-IN")})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
