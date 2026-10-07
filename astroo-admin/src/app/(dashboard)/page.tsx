"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, IndianRupee, Activity, Star, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TransactionItem {
  id: string
  user_name: string
  astrologer_name: string
  platform_fee: number
  amount: number
  created_at: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeAstrologers, setActiveAstrologers] = useState(0)
  const [activeConsultations, setActiveConsultations] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([])
  const [revenueData] = useState<{ name: string; total: number }[]>([
    { name: "Mon", total: 4500 },
    { name: "Tue", total: 6200 },
    { name: "Wed", total: 5800 },
    { name: "Thu", total: 7400 },
    { name: "Fri", total: 9100 },
    { name: "Sat", total: 12500 },
    { name: "Sun", total: 11200 },
  ])

  useEffect(() => {
    async function fetchDashboardStats() {
      setLoading(true)
      try {
        const res = await api.get('/admin/stats')
        if (res.success && res.data) {
          setTotalUsers(res.data.totalUsers || 0)
          setActiveAstrologers(res.data.totalAstrologers || 0)
          setActiveConsultations(res.data.activeConsultations || 0)
          setTotalRevenue(res.data.totalRevenue || 0)

          if (res.data.recentConsultations) {
            setRecentTransactions(
              res.data.recentConsultations.map((c: any) => ({
                id: c.id,
                user_name: c.customer_name || 'Customer',
                astrologer_name: c.astrologer_name || 'Astrologer',
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
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </>
            )}
          </CardContent>
        </Card>

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
                <p className="text-xs text-muted-foreground">+4 new this week</p>
              </>
            )}
          </CardContent>
        </Card>

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
                <p className="text-xs text-muted-foreground">Live chat & call sessions</p>
              </>
            )}
          </CardContent>
        </Card>

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
                <p className="text-xs text-muted-foreground">+18.2% from last month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No recent consultations
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{tx.user_name}</p>
                      <p className="text-xs text-muted-foreground">with {tx.astrologer_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">₹{tx.amount}</div>
                      <div className="text-xs text-emerald-500 font-semibold">+₹{tx.platform_fee} fee</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
