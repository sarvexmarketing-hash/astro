"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface PaymentTransaction {
  id: string
  wallet_id: string
  amount: number
  type: string
  description: string | null
  status: string
  created_at: string
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/stats')
      if (res.success && res.data?.recentConsultations) {
        setTransactions(
          res.data.recentConsultations.map((c: any) => ({
            id: c.id,
            wallet_id: c.user_id,
            amount: Number(c.total_amount) || 0,
            type: 'debit',
            description: `Consultation with ${c.astrologer_name || 'Astrologer'}`,
            status: c.state || 'COMPLETED',
            created_at: c.created_at,
          }))
        )
      } else {
        setTransactions([])
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Ledger</h1>
          <p className="text-muted-foreground">Track all transactions, platform fees, and astrologer payouts.</p>
        </div>
        <Button onClick={fetchPayments}>Refresh</Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions...
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions recorded yet
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id.slice(0, 8)}...</TableCell>
                  <TableCell>{t.description || "Wallet Transaction"}</TableCell>
                  <TableCell>
                    <Badge variant={t.type === "credit" ? "default" : "secondary"}>
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{t.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
