'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from './actions'
import { setToken } from '@/lib/api-client'
import { 
  Sparkles, 
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
    formData.append('email', email)
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
    <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden">
      {/* Top glowing accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
      
      {/* Subtle interior glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Form Header */}
      <div className="mb-6 space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Administrator Login
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Enter your super admin or staff credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Notification Banner */}
        {activeError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-200 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold text-red-300">Authentication Failed:</span>{' '}
              {activeError}
            </div>
          </div>
        )}

        {/* Admin Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-300" htmlFor="email">
            Admin Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
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
              className="w-full h-11 rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20 hover:border-zinc-700"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-300" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
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
              className="w-full h-11 rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-11 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20 hover:border-zinc-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
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
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_28px_rgba(245,158,11,0.4)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
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
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500/80" />
          <span>Authoritative End-to-End Encrypted Session</span>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-zinc-100 relative overflow-hidden px-4 selection:bg-amber-500 selection:text-black">
      {/* Background Cosmic Glow Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[400px] rounded-full bg-gradient-to-b from-amber-500/15 via-purple-600/10 to-transparent blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-[450px] h-[350px] rounded-full bg-amber-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-900/15 blur-[120px]" />

      {/* Subtle Starfield / Grid Pattern Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-3.5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/25 blur-lg" />
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1px] shadow-xl flex items-center justify-center">
              <div className="h-full w-full rounded-2xl bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            Astrowave <span className="text-amber-400">Admin</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-xs sm:text-sm font-medium">
            Central Platform Management Portal
          </p>
        </div>

        {/* Card Form */}
        <Suspense fallback={
          <div className="h-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="text-xs">Loading secure login console...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer Copyright */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          Astrowave Cosmic Commerce &bull; Version 1.0.0
        </div>
      </div>
    </div>
  )
}
