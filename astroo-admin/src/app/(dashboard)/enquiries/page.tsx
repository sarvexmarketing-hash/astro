"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

type SupportTicket = {
  id: string
  user_id: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  profiles?: {
    full_name: string
  }
}

export default function EnquiriesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      // In centralized backend, tickets are managed via admin support
      setTickets([
        {
          id: 'ticket-101',
          user_id: 'user-1',
          subject: 'Kundli Generation Question',
          description: 'Needed clarification on Vimshottari dasha calculation dates.',
          status: 'resolved',
          priority: 'normal',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          profiles: { full_name: 'Rahul Verma' }
        },
        {
          id: 'ticket-102',
          user_id: 'user-2',
          subject: 'Consultation Chat Reconnect',
          description: 'Chat session was paused during weak network connection.',
          status: 'open',
          priority: 'high',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          profiles: { full_name: 'Pooja Sharma' }
        }
      ])
    } catch (error: any) {
      toast.error("Failed to load enquiries")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = tickets.filter(t => {
    const userName = t.profiles?.full_name || 'Unknown User'
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          userName.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || t.status === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t))
    toast.success("Status Updated", {
      description: `Enquiry has been marked as ${newStatus}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Enquiries</h1>
          <p className="text-muted-foreground">Manage user support requests and platform inquiries.</p>
        </div>
        <Button onClick={fetchTickets}>Refresh</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search enquiries..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading enquiries...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No enquiries found
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.profiles?.full_name || "Anonymous"}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>
                    <Badge variant={t.priority === "high" ? "destructive" : "secondary"}>
                      {t.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "resolved" ? "outline" : "default"}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(t.id, t.status === "open" ? "resolved" : "open")}
                    >
                      {t.status === "open" ? "Resolve" : "Reopen"}
                    </Button>
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
