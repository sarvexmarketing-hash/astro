'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from './actions'
import { setToken } from '@/lib/api-client'
import { Sparkles, Loader2, ShieldCheck, KeyRound } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(urlError)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (urlError) {
      setError(urlError)
    }
  }, [urlError])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
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
    <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-xl shadow-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl text-white">Administrator Login</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your super admin or staff credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300" htmlFor="email">Admin Email</label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email address"
              required
              className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300" htmlFor="password">Password</label>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500 rounded-xl"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                Authenticating...
              </>
            ) : (
              "Sign In to Console"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/20 blur-[120px]" />
      
      <div className="z-10 w-full max-w-md p-4 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20 mb-3">
            <Sparkles className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Astrowave Admin</h1>
          <p className="text-zinc-400 mt-1 text-sm">Central Platform Management Portal</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center text-zinc-500">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
