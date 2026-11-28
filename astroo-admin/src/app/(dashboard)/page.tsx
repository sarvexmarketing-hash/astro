"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, IndianRupee, Activity, Star, Loader2, MessageSquare, PhoneCall } from "lucide-react"
import { api } from "@/lib/api-client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TransactionItem {
  id: string
  user_name: string
  astrologer_name: string
  type: string
  state: string
  platform_fee: number
  amount: number
  created_at: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [newUsersThisWeek, setNewUsersThisWeek] = useState(0)
  const [activeAstrologers, setActiveAstrologers] = useState(0)
  const [pendingAstrologers, setPendingAstrologers] = useState(0)
  const [activeConsultations, setActiveConsultations] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [platformEarnings, setPlatformEarnings] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([])
  const [revenueData, setRevenueData] = useState<{ name: string; total: number; label?: string }[]>([])

  useEffect(() => {
    async function fetchDashboardStats() {
      setLoading(true)
      try {
        const res = await api.get('/admin/stats')
        if (res.success && res.data) {
          setTotalUsers(Number(res.data.totalUsers) || 0)
          setNewUsersThisWeek(Number(res.data.newUsersThisWeek) || 0)
          setActiveAstrologers(Number(res.data.activeAstrologers) || 0)
          setPendingAstrologers(Number(res.data.pendingAstrologers) || 0)
          setActiveConsultations(Number(res.data.activeConsultations) || 0)
          setTotalRevenue(Number(res.data.totalRevenue) || 0)
          setPlatformEarnings(Number(res.data.platformEarnings) || 0)

          if (Array.isArray(res.data.revenueTrend) && res.data.revenueTrend.length > 0) {
            setRevenueData(
              res.data.revenueTrend.map((d: any) => ({
                name: d.name,
                total: Number(d.total) || 0,
                label: d.label,
              }))
            )
          } else {
            // Default 7 days initialized to 0
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            const today = new Date().getDay()
            const orderedDays = []
            for (let i = 6; i >= 0; i--) {
              const dIndex = (today - i + 7) % 7
              orderedDays.push({ name: days[dIndex], total: 0 })
            }
            setRevenueData(orderedDays)
          }

          if (Array.isArray(res.data.recentConsultations)) {
            setRecentTransactions(
              res.data.recentConsultations.map((c: any) => ({
                id: c.id,
                user_name: c.customer_name || 'Customer',
                astrologer_name: c.astrologer_name || 'Astrologer',
                type: c.type || 'chat',
                state: c.state || 'COMPLETED',
                platform_fee: Number(c.platform_fee) || 0,
                amount: Number(c.total_amount) || 0,
                created_at: c.created_at,
              }))
            )
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Astrowave Admin Portal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {newUsersThisWeek > 0
                    ? `+${newUsersThisWeek} registered this week`
                    : "Registered seeker accounts"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Astrologers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Astrologers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeAstrologers}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingAstrologers > 0
                    ? `${pendingAstrologers} pending verification`
                    : "Verified practitioners"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Consultations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consultations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeConsultations}</div>
                <p className="text-xs text-muted-foreground">
                  {activeConsultations > 0 ? "Live in-progress sessions" : "No active sessions currently"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-emerald-600 font-medium">
                  ₹{platformEarnings.toFixed(2)} platform fee
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Real 7-Day Revenue Trend Chart */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days consultation & platform turnover</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Live Database
            </span>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Bar dataKey="total" fill="#EAB308" radius={[4, 4, 0, 0]} className="fill-[#EAB308]" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Real Recent Consultations List */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
            <p className="text-xs text-muted-foreground">Latest seeker sessions and fee breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No recent consultations recorded
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isCall = tx.type === 'call'
                  const isSuccess = tx.state === 'ENDED' || tx.state === 'COMPLETED'
                  const isCancelled = tx.state === 'CANCELLED' || tx.state === 'REJECTED'
                  const isActive = tx.state === 'ACTIVE' || tx.state === 'ACCEPTED'

                  return (
                    <div key={tx.id} className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {isCall ? (
                            <PhoneCall className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <p className="text-sm font-semibold leading-none">{tx.user_name}</p>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isActive
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isCancelled
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {tx.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>with {tx.astrologer_name}</span>
                          {tx.created_at && (
                            <>
                              <span>&bull;</span>
                              <span>
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold">₹{tx.amount}</div>
                        <div className="text-[11px] text-emerald-600 font-medium">+₹{tx.platform_fee} fee</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

