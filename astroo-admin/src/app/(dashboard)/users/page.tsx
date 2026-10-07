"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  status: string
  created_at: string
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users')
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data)
      } else {
        setUsers([])
      }
    } catch (err: any) {
      console.error("Error fetching users:", err)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active'
    try {
      const res = await api.put(`/admin/users/${user.id}`, { status: newStatus })
      if (res.success) {
        toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`)
        fetchUsers()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status')
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.phone || "").includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage platform users and their accounts.</p>
        </div>
        <Button onClick={fetchUsers}>Refresh</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>{(user.full_name || "U")[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.full_name || "Unnamed User"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email || "No email"}</div>
                    <div className="text-xs text-muted-foreground">{user.phone || "No phone"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" || user.role === "super_admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "outline" : "destructive"}>
                      {user.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={user.status === 'active' ? 'destructive' : 'outline'}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Block' : 'Unblock'}
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
