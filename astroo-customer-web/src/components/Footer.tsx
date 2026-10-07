"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide on homepage (which has its own 1:1 FooterSection) and on admin portal
  if (pathname === "/" || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#FFFBEB] border-t border-[#FDE68A] text-[#18181B] py-10 px-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs border border-amber-300 flex-shrink-0 bg-[#FFE814] flex items-center justify-center">
              <img
                src="/images/app_logo.png"
                alt="Astrowave Logo"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#18181B]">
                Astrowave
              </span>
              <p className="text-[10px] text-[#71717A]">
                100% Private, Confidential & Verified Vedic Consultations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#52525B]">
            <Link href="/astrologers" className="hover:text-[#18181B]">Astrologers</Link>
            <Link href="/kundli" className="hover:text-[#18181B]">Free Kundli</Link>
            <Link href="/muhurat" className="hover:text-[#18181B]">Muhurat</Link>
            <Link href="/pooja" className="hover:text-[#18181B]">Pooja</Link>
            <Link href="/admin" className="hover:text-purple-700 font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-sm">Admin</Link>
          </div>
        </div>

        <div className="pt-4 border-t border-[#FDE68A]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#71717A]">
          <p>© {new Date().getFullYear()} Astrowave. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Confidential & Secure</span>
            <span>•</span>
            <span>24x7 Vedic Guidance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
