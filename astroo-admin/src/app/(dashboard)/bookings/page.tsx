"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">Manage upcoming Pooja and Astrologer appointments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No upcoming bookings.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
