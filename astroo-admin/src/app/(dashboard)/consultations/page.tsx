"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConsultationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Consultations</h1>
        <p className="text-muted-foreground">Monitor ongoing chat, voice, and video consultations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No live consultations at the moment.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
