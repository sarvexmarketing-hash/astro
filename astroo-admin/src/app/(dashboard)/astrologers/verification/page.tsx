"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
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
  FileText,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Eye,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Phone,
  Mail,
  Video,
  Award,
  IndianRupee,
  Calendar,
  UserCheck,
  Users
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

export interface ApplicationItem {
  id: string
  application_id: string
  user_id: string
  full_name: string
  display_name: string
  phone: string
  email: string
  profile_photo?: string | null
  skills: string[]
  other_skill?: string | null
  languages: string[]
  other_language?: string | null
  years_of_experience: number
  bio?: string | null
  specializations: string[]
  consultation_experience?: string | null
  location?: string | null
  intro_video?: string | null
  certificates?: any[]
  documents?: any[]
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  rejection_reason?: string | null
  submitted_at: string
  reviewed_at?: string | null
  approved_at?: string | null
  rejected_at?: string | null
  status_history?: any[]
}

export default function AstrologerVerificationPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [counts, setCounts] = useState({ all: 0, pending: 0, under_review: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Approve dialog states
  const [chatRate, setChatRate] = useState<number>(20)
  const [callRate, setCallRate] = useState<number>(25)
  const [isMuhuratEligible, setIsMuhuratEligible] = useState<boolean>(false)
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(true)
  const [isCallEnabled, setIsCallEnabled] = useState<boolean>(true)
  const [isApproving, setIsApproving] = useState(false)

  // Reject dialog states
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  // Edit dialog states
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editFullName, setEditFullName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editExp, setEditExp] = useState<number>(1)
  const [editLocation, setEditLocation] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<{
        success: boolean
        data: ApplicationItem[]
        counts: { all: number; pending: number; under_review: number; approved: number; rejected: number }
      }>(`/astrologer-applications/admin?status=${activeTab}&search=${encodeURIComponent(search)}`)

      if (res?.data) {
        setApplications(res.data)
      }
      if (res?.counts) {
        setCounts(res.counts)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load astrologer verification applications")
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleOpenDetails = async (app: ApplicationItem) => {
    try {
      const res = await api.get<{ success: boolean; data: ApplicationItem }>(`/astrologer-applications/admin/${app.id}`)
      if (res?.data) {
        setSelectedApp(res.data)
      } else {
        setSelectedApp(app)
      }
      setIsDetailModalOpen(true)
    } catch {
      setSelectedApp(app)
      setIsDetailModalOpen(true)
    }
  }

  const handleOpenApprove = (app: ApplicationItem) => {
    setSelectedApp(app)
    setChatRate(20)
    setCallRate(25)
    setIsMuhuratEligible(app.skills?.includes('Muhurtham') || false)
    setIsChatEnabled(true)
    setIsCallEnabled(true)
    setIsApproveModalOpen(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedApp) return
    try {
      setIsApproving(true)
      await api.post(`/astrologer-applications/admin/${selectedApp.id}/approve`, {
        chatRate,
        callRate,
        isMuhuratEligible,
        isChatEnabled,
        isCallEnabled,
        notes: "Approved and verified by AstroWave Administrator."
      })
      toast.success(`${selectedApp.display_name} has been verified and activated for seeker consultations!`)
      setIsApproveModalOpen(false)
      setIsDetailModalOpen(false)
      fetchApplications()
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve application")
    } finally {
      setIsApproving(false)
    }
  }

  const handleOpenReject = (app: ApplicationItem) => {
    setSelectedApp(app)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedApp) return
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejecting this application.")
      return
    }
    try {
      setIsRejecting(true)
      await api.post(`/astrologer-applications/admin/${selectedApp.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        notes: "Verification criteria not met."
      })
      toast.success(`Application ${selectedApp.application_id} marked as rejected.`)
      setIsRejectModalOpen(false)
      setIsDetailModalOpen(false)
      fetchApplications()
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject application")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleMarkUnderReview = async (appId: string) => {
    try {
      await api.post(`/astrologer-applications/admin/${appId}/under-review`, {
        notes: "Candidate verification is actively in progress."
      })
      toast.success("Application marked as Under Review")
      fetchApplications()
      if (selectedApp) {
        setSelectedApp(prev => prev ? { ...prev, status: 'UNDER_REVIEW' } : null)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    }
  }

  const handleOpenEdit = (app: ApplicationItem) => {
    setSelectedApp(app)
    setEditDisplayName(app.display_name || '')
    setEditFullName(app.full_name || '')
    setEditBio(app.bio || '')
    setEditExp(app.years_of_experience || 1)
    setEditLocation(app.location || '')
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedApp) return
    try {
      setIsSavingEdit(true)
      await api.put(`/astrologer-applications/admin/${selectedApp.id}`, {
        displayName: editDisplayName,
        fullName: editFullName,
        bio: editBio,
        experienceYears: editExp,
        location: editLocation
      })
      toast.success("Application updated successfully")
      setIsEditModalOpen(false)
      fetchApplications()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update application")
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Astrologer Verification</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review candidate applications, examine credentials, and approve astrologers for seeker discovery.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchApplications()} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="all">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="under_review">
            Under Review ({counts.under_review})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({counts.rejected})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Verification Applications Table */}
      <div className="border rounded-xl bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/70">
              <TableHead>Applicant</TableHead>
              <TableHead>Application ID</TableHead>
              <TableHead>Expertise & Skills</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  <div className="flex justify-center items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
                    <span>Loading astrologer applications...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                    <ShieldAlert className="h-10 w-10 text-amber-500/70" />
                    <p className="font-semibold text-zinc-800 text-base">No Applications Found</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      There are currently no candidate applications in this filter. Registrations submitted through the public <span className="font-semibold text-zinc-700">Become an Astrologer</span> portal will automatically appear here for verification and rate approval.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                      <Link
                        href="/astrologers"
                        className="inline-flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-xs font-semibold rounded-xl shadow-xs transition-colors"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        View Active Astrologers
                      </Link>
                      <a
                        href="https://astrowave.it.com/become-astrologer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                        Open Application Form
                      </a>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id} className="hover:bg-zinc-50/50">
                  {/* Applicant Details */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 rounded-xl border border-amber-200 shadow-2xs">
                        <AvatarImage src={app.profile_photo || ''} className="object-cover" />
                        <AvatarFallback className="bg-amber-100 text-amber-900 font-bold">
                          {app.display_name?.charAt(0) || app.full_name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm text-zinc-900">{app.display_name}</div>
                        <div className="text-xs text-muted-foreground">{app.full_name}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{app.phone} · {app.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Application ID */}
                  <TableCell>
                    <span className="font-mono text-xs font-semibold px-2 py-1 bg-zinc-100 text-zinc-800 rounded-md">
                      {app.application_id}
                    </span>
                  </TableCell>

                  {/* Expertise */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {app.skills?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {(app.skills?.length || 0) > 2 && (
                        <span className="text-[10px] text-zinc-500 font-bold">
                          +{app.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Languages */}
                  <TableCell>
                    <div className="text-xs font-medium text-zinc-700">
                      {app.languages?.join(', ') || '—'}
                    </div>
                  </TableCell>

                  {/* Experience */}
                  <TableCell>
                    <div className="text-xs font-bold text-zinc-800">
                      {app.years_of_experience} yrs
                    </div>
                    {app.location && (
                      <div className="text-[11px] text-zinc-500">{app.location}</div>
                    )}
                  </TableCell>

                  {/* Submitted Date */}
                  <TableCell>
                    <div className="text-xs text-zinc-600">
                      {new Date(app.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(app.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {app.status === 'SUBMITTED' && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-bold">
                        Pending
                      </Badge>
                    )}
                    {app.status === 'UNDER_REVIEW' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 font-bold">
                        Under Review
                      </Badge>
                    )}
                    {app.status === 'APPROVED' && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </Badge>
                    )}
                    {app.status === 'REJECTED' && (
                      <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300 font-bold flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Rejected
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 h-8 w-8 p-0 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Application Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(app)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        {app.status !== 'APPROVED' && (
                          <DropdownMenuItem onClick={() => handleOpenApprove(app)} className="text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                            Approve Application
                          </DropdownMenuItem>
                        )}

                        {app.status === 'SUBMITTED' && (
                          <DropdownMenuItem onClick={() => handleMarkUnderReview(app.id)} className="text-blue-700">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            Mark Under Review
                          </DropdownMenuItem>
                        )}

                        {app.status !== 'REJECTED' && (
                          <DropdownMenuItem onClick={() => handleOpenReject(app)} className="text-rose-700">
                            <XCircle className="w-4 h-4 mr-2 text-rose-600" />
                            Reject Application
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenEdit(app)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ========================================================================= */}
      {/* DETAIL MODAL (Multi-section application review)                           */}
      {/* ========================================================================= */}
      {selectedApp && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <span>Application: {selectedApp.application_id}</span>
                </DialogTitle>
                <Badge className={
                  selectedApp.status === 'APPROVED' ? 'bg-emerald-500' :
                  selectedApp.status === 'REJECTED' ? 'bg-rose-500' :
                  selectedApp.status === 'UNDER_REVIEW' ? 'bg-blue-500' : 'bg-amber-500'
                }>
                  {selectedApp.status}
                </Badge>
              </div>
              <DialogDescription>
                Submitted on {new Date(selectedApp.submitted_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Section 1: Personal Information */}
              <div className="p-4 rounded-xl border bg-zinc-50 space-y-3">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">1. Personal Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border-2 border-amber-300">
                    <AvatarImage src={selectedApp.profile_photo || ''} className="object-cover" />
                    <AvatarFallback className="bg-amber-100 text-amber-900 font-bold text-lg">
                      {selectedApp.display_name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Display Name in App:</span>
                      <span className="font-bold text-sm text-zinc-900">{selectedApp.display_name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Full Legal Name:</span>
                      <span className="font-semibold text-zinc-900">{selectedApp.full_name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Phone:</span>
                      <span className="font-semibold text-zinc-900">{selectedApp.phone}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Email:</span>
                      <span className="font-semibold text-zinc-900">{selectedApp.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Expertise & Skills */}
              <div className="p-4 rounded-xl border bg-zinc-50 space-y-2">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">2. Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedApp.skills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {selectedApp.other_skill && (
                    <span className="px-3 py-1 bg-zinc-200 text-zinc-800 rounded-full text-xs">
                      Other: {selectedApp.other_skill}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 3: Languages */}
              <div className="p-4 rounded-xl border bg-zinc-50 space-y-2">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">3. Languages</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedApp.languages?.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 font-semibold rounded-full text-xs">
                      {lang}
                    </span>
                  ))}
                  {selectedApp.other_language && (
                    <span className="px-3 py-1 bg-zinc-200 text-zinc-800 rounded-full text-xs">
                      Other: {selectedApp.other_language}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 4: Professional Verification */}
              <div className="p-4 rounded-xl border bg-zinc-50 space-y-3">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">4. Professional Verification</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Years of Experience:</span>
                    <span className="font-bold text-zinc-900 text-sm">{selectedApp.years_of_experience} years</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Location:</span>
                    <span className="font-semibold text-zinc-900">{selectedApp.location || "Not specified"}</span>
                  </div>
                </div>

                {selectedApp.bio && (
                  <div className="pt-2">
                    <span className="text-zinc-500 block text-xs">Professional Bio:</span>
                    <p className="text-xs text-zinc-800 bg-white p-3 rounded-lg border mt-1 leading-relaxed whitespace-pre-wrap">
                      {selectedApp.bio}
                    </p>
                  </div>
                )}

                {selectedApp.consultation_experience && (
                  <div className="pt-1">
                    <span className="text-zinc-500 block text-xs">Consultation Experience & Background:</span>
                    <p className="text-xs text-zinc-800 bg-white p-3 rounded-lg border mt-1 leading-relaxed">
                      {selectedApp.consultation_experience}
                    </p>
                  </div>
                )}

                {selectedApp.intro_video && (
                  <div className="pt-1">
                    <span className="text-zinc-500 block text-xs">Introduction Video:</span>
                    <a
                      href={selectedApp.intro_video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-700 underline font-semibold flex items-center gap-1 mt-1"
                    >
                      <Video className="w-4 h-4 text-amber-600" />
                      {selectedApp.intro_video}
                    </a>
                  </div>
                )}

                {/* Certificates / Documents */}
                {selectedApp.certificates && selectedApp.certificates.length > 0 && (
                  <div className="pt-2">
                    <span className="text-zinc-500 block text-xs font-semibold mb-1">Certificates / Awards:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedApp.certificates.map((cert: any, idx: number) => (
                        <a
                          key={idx}
                          href={cert.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 bg-white border rounded-lg text-xs hover:border-amber-400"
                        >
                          <Award className="w-4 h-4 text-amber-600" />
                          <span className="truncate">{cert.name || `Certificate ${idx + 1}`}</span>
                          <ExternalLink className="w-3 h-3 ml-auto text-zinc-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection notice if rejected */}
              {selectedApp.status === 'REJECTED' && selectedApp.rejection_reason && (
                <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-xs">
                  <span className="font-bold block mb-1">Rejection Reason:</span>
                  <p>{selectedApp.rejection_reason}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
              {selectedApp.status !== 'APPROVED' && (
                <Button
                  onClick={() => handleOpenApprove(selectedApp)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Application
                </Button>
              )}

              {selectedApp.status === 'SUBMITTED' && (
                <Button
                  variant="outline"
                  onClick={() => handleMarkUnderReview(selectedApp.id)}
                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  Mark Under Review
                </Button>
              )}

              {selectedApp.status !== 'REJECTED' && (
                <Button
                  variant="outline"
                  onClick={() => handleOpenReject(selectedApp)}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Reject Application
                </Button>
              )}

              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* APPROVE MODAL (Prompt Section 8)                                          */}
      {/* ========================================================================= */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <span>Approve this astrologer?</span>
            </DialogTitle>
            <DialogDescription>
              Approving {selectedApp?.display_name} will automatically provision their public profile and make them visible on the customer portal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Chat Consultation Rate (₹/min)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">₹</span>
                <Input
                  type="number"
                  value={chatRate}
                  onChange={(e) => setChatRate(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Call Consultation Rate (₹/min)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">₹</span>
                <Input
                  type="number"
                  value={callRate}
                  onChange={(e) => setCallRate(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border rounded-xl">
              <div>
                <span className="font-semibold text-xs text-zinc-900 block">Muhurtham Eligibility</span>
                <span className="text-[11px] text-zinc-500">Allow this astrologer to receive Muhurtham bookings</span>
              </div>
              <input
                type="checkbox"
                checked={isMuhuratEligible}
                onChange={(e) => setIsMuhuratEligible(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border rounded-xl">
              <div>
                <span className="font-semibold text-xs text-zinc-900 block">Enable Live Chat</span>
                <span className="text-[11px] text-zinc-500">Allow seekers to request live chats</span>
              </div>
              <input
                type="checkbox"
                checked={isChatEnabled}
                onChange={(e) => setIsChatEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border rounded-xl">
              <div>
                <span className="font-semibold text-xs text-zinc-900 block">Enable Live Call</span>
                <span className="text-[11px] text-zinc-500">Allow seekers to request live voice/video calls</span>
              </div>
              <input
                type="checkbox"
                checked={isCallEnabled}
                onChange={(e) => setIsCallEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={isApproving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isApproving ? "Approving..." : "Confirm & Activate Astrologer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* REJECT MODAL (Prompt Section 9)                                           */}
      {/* ========================================================================= */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="w-6 h-6" />
              <span>Reject Application</span>
            </DialogTitle>
            <DialogDescription>
              Please enter the reason for rejecting {selectedApp?.display_name}'s application. This will be stored in the applicant record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-zinc-700 block">Reason for rejection *</label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete credentials, experience could not be verified, or profile photo does not meet quality standards."
              className="w-full text-xs p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={isRejecting || !rejectionReason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isRejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT MODAL (Prompt Section 10)                                            */}
      {/* ========================================================================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Astrologer Application</DialogTitle>
            <DialogDescription>
              Update applicant details. Changes will sync with the astrologer's profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Display Name in App</label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Full Legal Name</label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Years of Experience</label>
              <Input
                type="number"
                value={editExp}
                onChange={(e) => setEditExp(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Location</label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Bio / About</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full text-xs p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
