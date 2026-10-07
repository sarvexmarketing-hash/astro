"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [minConsultationDuration, setMinConsultationDuration] = useState("5")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Settings Saved", {
        description: "Global platform settings have been updated successfully.",
      })
    }, 600)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Manage global rules, pricing, and configurations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultation Rules</CardTitle>
          <CardDescription>
            Configure rules and requirements for astrologer consultations (chat and call).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-duration">Minimum Consultation Duration (Minutes)</Label>
            <div className="flex gap-2 max-w-sm">
              <Input 
                id="min-duration" 
                type="number" 
                min="1"
                value={minConsultationDuration}
                onChange={(e) => setMinConsultationDuration(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Users must have a wallet balance equivalent to at least this many minutes with an astrologer to initiate a chat or call.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-muted/20">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
