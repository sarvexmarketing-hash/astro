"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react"

export default function BecomeAstrologerRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to astrologer registration portal
    const targetUrl = process.env.NEXT_PUBLIC_ASTROLOGER_WEB_URL || "http://localhost:3002"
    window.location.href = `${targetUrl}/register`
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-[#FDE68A] shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Become an AstroWave Astrologer</h1>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Redirecting to our secure astrologer registration and verification portal...
        </p>
        <div className="pt-2">
          <a
            href="http://localhost:3002/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-xs transition-colors"
          >
            <span>Proceed to Application</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
