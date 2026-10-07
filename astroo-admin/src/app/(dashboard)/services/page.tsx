"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShoppingBag, Flame, Sparkles, Plus, RefreshCw, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const [poojaServices, setPoojaServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchServices() {
    setLoading(true)
    try {
      const res = await api.get('/pooja/services')
      setPoojaServices(res.data || [])
    } catch (e) {
      console.error('Error fetching pooja services:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services & Pooja Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Manage Vedic Poojas, Havans, Rituals, and Spiritual Offerings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/shop">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Manage Shop & Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-amber-100 bg-amber-50/50">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Vedic Poojas & Rituals
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-900">
              {poojaServices.length} Poojas Active
            </CardTitle>
          </CardHeader>
        </Card>

        <Link href="/shop">
          <Card className="border-border hover:border-amber-400 transition-colors cursor-pointer group">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Astromall Products
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold group-hover:text-amber-600 transition-colors">
                    Shop Catalog →
                  </CardTitle>
                </div>
                <ShoppingBag className="h-8 w-8 text-amber-500" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Pooja Services Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Available Pooja Services
          </h2>
          <Button variant="outline" size="sm" onClick={fetchServices} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Pooja Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Samagri</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Loading services...
                </TableCell>
              </TableRow>
            ) : poojaServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No pooja services registered yet.
                </TableCell>
              </TableRow>
            ) : (
              poojaServices.map(service => (
                <TableRow key={service.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold text-foreground">{service.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                      {service.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.category}</Badge>
                  </TableCell>
                  <TableCell>{service.duration_minutes} mins</TableCell>
                  <TableCell className="font-bold">₹{service.base_price}</TableCell>
                  <TableCell>
                    {service.samagri_included ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        Included
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Included</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        service.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
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
