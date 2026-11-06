'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import logoImg from '../../../public/logo.png'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from './actions'
import { setToken } from '@/lib/api-client'
import { 
  Loader2, 
  AlertCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const activeError = formError ?? urlError

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setFormError(null)
    
    const formData = new FormData()
    formData.append('email', email.trim())
    formData.append('password', password)

    const result = await login(formData)
    
    if (result?.error) {
      setFormError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      if (result.accessToken) {
        setToken(result.accessToken)
      }
      router.push('/')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Notification Banner */}
      {activeError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-red-900">Authentication Failed:</span>{' '}
            {activeError}
          </div>
        </div>
      )}

      {/* Admin Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#18181B]" htmlFor="email">
          Admin Email
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3.5 text-zinc-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@astroo.com"
            required
            autoComplete="email"
            className="w-full h-12 rounded-xl border border-[#E4E4E7] bg-white pl-10 pr-4 text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-all outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A]"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#18181B]" htmlFor="password">
            Password
          </label>
        </div>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3.5 text-zinc-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            className="w-full h-12 rounded-xl border border-[#E4E4E7] bg-white pl-10 pr-11 text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-all outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#1E1E1E] font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#1E1E1E]" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Console</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Security badge footer */}
      <div className="pt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-medium">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Authorized Super Admin & Staff Portal</span>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7] text-[#18181B] px-4 py-12 relative">
      {/* Subtle warm Vedic background glow */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-amber-200/30 blur-[120px]" />
      
      <div className="z-10 w-full max-w-md">
        {/* Official Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 relative mb-3">
            <Image
              src={logoImg}
              alt="Astrowave Logo"
              width={64}
              height={64}
              priority
              className="w-16 h-16 rounded-2xl shadow-sm object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
            Astrowave <span className="text-[#D97706]">Admin</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Central Platform Management Console
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white rounded-3xl border border-[#FDE68A] shadow-sm p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#18181B]">Administrator Login</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter your verified administrative credentials to manage users, astrologers, and consultations.
            </p>
          </div>

          <Suspense fallback={
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span className="text-xs">Loading admin console...</span>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        {/* Clean Footer */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          Astrowave Cosmic Commerce &bull; Version 1.0.0
        </div>
      </div>
    </div>
  )
}
