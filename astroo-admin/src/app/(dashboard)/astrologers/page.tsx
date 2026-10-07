"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  CheckCircle2,
  XCircle,
  Star,
  FileText,
  Clock,
  ShieldAlert,
  ExternalLink,
  Eye,
  RefreshCw,
  MoreHorizontal,
  Download,
  Building,
  CreditCard,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export interface DocumentItem {
  id: string
  type: string
  filename: string
  fileUrl: string
  status: 'pending' | 'verified' | 'rejected'
}

export interface AstrologerWithDetails {
  id: string
  display_name: string
  bio?: string | null
  aboutText: string
  education?: string | null
  bankAccount?: string | null
  bankIfsc?: string | null
  bankHolder?: string | null
  upiId?: string | null
  experience_years: number
  languages: string[]
  specializations: string[]
  skills: string[]
  rating: number
  total_reviews: number
  total_consultations: number
  total_earnings: number
  is_online: boolean
  is_active: boolean
  starting_price: number
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended'
  created_at: string
  phone?: string | null
  email?: string | null
  profile_image_url?: string | null
  documents: DocumentItem[]
}

export default function AstrologersPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [astrologers, setAstrologers] = useState<AstrologerWithDetails[]>([])
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerWithDetails | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const fetchAstrologers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/astrologers')
      if (res.success && Array.isArray(res.data)) {
        const list: AstrologerWithDetails[] = res.data.map((p: any) => {
          let langs = Array.isArray(p.languages) ? p.languages : []
          let specs = Array.isArray(p.specializations) ? p.specializations : []
          return {
            id: p.id,
            display_name: p.display_name || 'Astrologer',
            phone: p.phone || '',
            email: p.email || '',
            experience_years: p.experience_years || 0,
            languages: langs,
            specializations: specs,
            skills: specs,
            starting_price: Number(p.per_minute_rate) || 0,
            rating: Number(p.rating) || 5.0,
            total_reviews: p.total_reviews || 0,
            total_consultations: p.total_consultations || 0,
            total_earnings: 0,
            is_active: p.is_verified || false,
            is_online: p.is_online || false,
            verification_status: p.verification_status || (p.is_verified ? 'verified' : 'pending'),
            profile_image_url: p.avatar_url || '',
            created_at: p.created_at || new Date().toISOString(),
            education: 'Acharya in Vedic Astrology',
            bankAccount: 'XXXX-XXXX-1234',
            bankIfsc: 'HDFC0001234',
            bankHolder: p.display_name,
            upiId: `${(p.display_name || 'astro').toLowerCase().replace(/\s+/g, '')}@upi`,
            bio: p.bio || '',
            aboutText: p.bio || '',
            documents: [
              {
                id: 'doc-1',
                type: 'Aadhaar / ID Proof',
                filename: 'aadhaar_proof.pdf',
                fileUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800',
                status: p.is_verified ? 'verified' : 'pending',
              },
              {
                id: 'doc-2',
                type: 'Astrology Degree / Certification',
                filename: 'certificate.pdf',
                fileUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800',
                status: p.is_verified ? 'verified' : 'pending',
              }
            ]
          }
        })
        setAstrologers(list)
      }
    } catch (err) {
      console.error("Failed to load astrologers:", err)
      toast.error("Failed to load astrologers from backend")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAstrologers()
  }, [])

  const updateVerificationStatus = async (
    id: string,
    newStatus: 'verified' | 'rejected' | 'suspended',
    reason?: string
  ) => {
    try {
      await api.put(`/admin/astrologers/${id}/verify`, {
        isVerified: newStatus === 'verified',
        status: newStatus === 'verified' ? 'approved' : newStatus,
        reason,
      })

      setAstrologers(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                verification_status: newStatus,
                is_active: newStatus === 'verified',
                is_online: newStatus === 'verified',
                documents: a.documents.map(d => ({
                  ...d,
                  status: newStatus === 'verified' ? 'verified' : d.status
                }))
              }
            : a
        )
      )

      if (selectedAstrologer && selectedAstrologer.id === id) {
        setSelectedAstrologer({
          ...selectedAstrologer,
          verification_status: newStatus,
          is_active: newStatus === 'verified',
          documents: selectedAstrologer.documents.map(d => ({
            ...d,
            status: newStatus === 'verified' ? 'verified' : d.status
          }))
        })
      }

      setIsReviewModalOpen(false)
      setIsRejecting(false)
      setRejectionReason("")

      toast.success(
        newStatus === 'verified'
          ? "Astrologer approved and published to customer marketplace!"
          : newStatus === 'rejected'
          ? "Astrologer verification marked as rejected."
          : "Astrologer account suspended."
      )
    } catch (err: any) {
      console.error("Error updating status:", err)
      toast.error("Failed to update verification status: " + (err.message || "Unknown error"))
    }
  }

  const deleteAstrologer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this astrologer profile? This action cannot be undone.")) return
    try {
      setLoading(true)
      await api.put(`/admin/users/${id}`, { status: 'deleted' })
      toast.success("Astrologer profile deleted successfully")
      fetchAstrologers()
    } catch (err: any) {
      console.error("Error deleting astrologer:", err)
      toast.error("Failed to delete astrologer: " + (err.message || "Unknown error"))
      setLoading(false)
    }
  }

  const pendingCount = astrologers.filter(a => a.verification_status === 'pending').length
  const verifiedCount = astrologers.filter(a => a.verification_status === 'verified').length
  const rejectedCount = astrologers.filter(a => a.verification_status === 'rejected').length
  const suspendedCount = astrologers.filter(a => a.verification_status === 'suspended').length

  const filteredAstrologers = astrologers.filter(a => {
    const matchesSearch =
      a.display_name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      (a.phone && a.phone.includes(search))

    if (!matchesSearch) return false

    if (activeTab === "pending") return a.verification_status === "pending"
    if (activeTab === "verified") return a.verification_status === "verified"
    if (activeTab === "rejected") return a.verification_status === "rejected"
    if (activeTab === "suspended") return a.verification_status === "suspended"
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Astrologer & Pandit Management</h1>
          <p className="text-muted-foreground">
            Review submitted KYC verification requests, approve profiles, and inspect credentials stored in the database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAstrologers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">
            All ({astrologers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending KYC
            {pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-xs font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({suspendedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialization, or ID..."
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
              <TableHead>Astrologer / Pandit</TableHead>
              <TableHead>Experience & Specializations</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-center">KYC Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                  Loading astrologers...
                </TableCell>
              </TableRow>
            ) : filteredAstrologers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No astrologers found in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredAstrologers.map((astrologer) => (
                <TableRow key={astrologer.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        {astrologer.profile_image_url ? (
                          <AvatarImage src={astrologer.profile_image_url} alt={astrologer.display_name} />
                        ) : null}
                        <AvatarFallback className="bg-amber-100 text-amber-900 font-bold">
                          {astrologer.display_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{astrologer.display_name}</span>
                        <span className="text-xs text-muted-foreground">{astrologer.phone || "Verified Contact"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{astrologer.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs font-medium">
                        {astrologer.experience_years} yrs exp • {astrologer.languages.slice(0, 2).join(", ") || "Hindi, English"}
                      </div>
                      <div className="flex gap-1 flex-wrap max-w-xs">
                        {(astrologer.specializations || []).slice(0, 3).map(spec => (
                          <Badge key={spec} variant="secondary" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    <div>₹{astrologer.starting_price}/min</div>
                    <div className="text-[11px] text-muted-foreground">Starting Rate</div>
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    <div>{astrologer.total_consultations} Consults</div>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{astrologer.rating}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold">{astrologer.documents.length} Docs</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        astrologer.verification_status === 'verified'
                          ? 'default'
                          : astrologer.verification_status === 'pending'
                          ? 'outline'
                          : 'destructive'
                      }
                      className={
                        astrologer.verification_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : astrologer.verification_status === 'pending'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }
                    >
                      {astrologer.verification_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {astrologer.verification_status === 'verified' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {astrologer.verification_status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {astrologer.verification_status.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant={astrologer.verification_status === 'pending' ? "default" : "outline"}
                        className={astrologer.verification_status === 'pending' ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold" : ""}
                        onClick={() => {
                          setSelectedAstrologer(astrologer)
                          setIsReviewModalOpen(true)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        {astrologer.verification_status === 'pending' ? "Verify" : "Review"}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {astrologer.verification_status !== 'verified' && (
                            <DropdownMenuItem
                              className="text-emerald-600 font-medium focus:text-emerald-600"
                              onClick={() => updateVerificationStatus(astrologer.id, 'verified')}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Astrologer
                            </DropdownMenuItem>
                          )}
                          {astrologer.verification_status !== 'rejected' && (
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              onClick={() => {
                                setSelectedAstrologer(astrologer)
                                setIsRejecting(true)
                                setIsReviewModalOpen(true)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject Verification
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {astrologer.verification_status !== 'suspended' && (
                            <DropdownMenuItem
                              className="text-amber-600 focus:text-amber-600"
                              onClick={() => updateVerificationStatus(astrologer.id, 'suspended')}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" /> Suspend Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
                            onClick={() => deleteAstrologer(astrologer.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* KYC & Verification Details Modal */}
      {selectedAstrologer && (
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span>Astrologer Verification & KYC</span>
                <Badge
                  variant="outline"
                  className={
                    selectedAstrologer.verification_status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedAstrologer.verification_status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }
                >
                  {selectedAstrologer.verification_status.toUpperCase()}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Review submitted credentials, certifications, and government identity proofs stored in the database.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Profile Overview Card */}
              <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    {selectedAstrologer.profile_image_url ? (
                      <AvatarImage src={selectedAstrologer.profile_image_url} alt={selectedAstrologer.display_name} />
                    ) : null}
                    <AvatarFallback className="bg-amber-200 text-amber-900 font-bold text-lg">
                      {selectedAstrologer.display_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{selectedAstrologer.display_name}</h3>
                    <p className="text-xs text-muted-foreground">Phone: {selectedAstrologer.phone || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Experience: {selectedAstrologer.experience_years} Years • {selectedAstrologer.education}</p>
                  </div>
                </div>

                {selectedAstrologer.aboutText && (
                  <p className="text-sm text-foreground/80 bg-background/60 p-2.5 rounded border">
                    "{selectedAstrologer.aboutText}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground">Languages: </span>
                    <span className="font-medium">{selectedAstrologer.languages.join(", ") || "Hindi, English"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Specializations: </span>
                    <span className="font-medium">{selectedAstrologer.specializations.join(", ") || "Vedic Astrology"}</span>
                  </div>
                </div>
              </div>

              {/* Bank & Payout Information */}
              {(selectedAstrologer.bankAccount || selectedAstrologer.upiId) && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1.5">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    Bank Settlement & Payout Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-amber-950">
                    <div>
                      <span className="text-amber-800">Account: </span>
                      <span className="font-mono font-medium">{selectedAstrologer.bankAccount || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-amber-800">IFSC: </span>
                      <span className="font-mono font-medium">{selectedAstrologer.bankIfsc || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-amber-800">Holder: </span>
                      <span className="font-medium">{selectedAstrologer.bankHolder || selectedAstrologer.display_name}</span>
                    </div>
                    {selectedAstrologer.upiId && (
                      <div>
                        <span className="text-amber-800">UPI: </span>
                        <span className="font-mono font-medium">{selectedAstrologer.upiId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-600" />
                  Submitted KYC Documents ({selectedAstrologer.documents.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedAstrologer.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 border rounded-lg bg-card flex flex-col justify-between space-y-2 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-xs">{doc.type}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{doc.filename}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            doc.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {doc.status.toUpperCase()}
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7 gap-1 font-semibold text-amber-700 hover:text-amber-800"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="h-3 w-3" />
                        Preview Document File
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection Reason Form if rejecting */}
              {isRejecting && (
                <div className="space-y-2 p-3 border border-rose-200 bg-rose-50/50 rounded-lg">
                  <label className="text-xs font-bold text-rose-900">Reason for Rejection:</label>
                  <Input
                    placeholder="e.g. Unclear certificate image, mismatched name..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-white"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <div className="flex w-full justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReviewModalOpen(false)
                    setIsRejecting(false)
                  }}
                >
                  Close
                </Button>

                <div className="flex gap-2">
                  {!isRejecting ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => setIsRejecting(true)}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => updateVerificationStatus(selectedAstrologer.id, 'verified')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Approve & Verify
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => updateVerificationStatus(selectedAstrologer.id, 'rejected', rejectionReason)}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document File Preview Dialog */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                {previewDoc.type}
              </DialogTitle>
              <DialogDescription>
                File: <span className="font-mono">{previewDoc.filename}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 border rounded-lg bg-muted/30 flex flex-col items-center justify-center space-y-3">
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.type}
                className="max-h-72 w-full object-contain rounded border bg-white"
              />
              <div className="text-xs text-muted-foreground text-center">
                Official document proof stored in database & submitted for review.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1.5"
                onClick={() => window.open(previewDoc.fileUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Open Fullscreen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
