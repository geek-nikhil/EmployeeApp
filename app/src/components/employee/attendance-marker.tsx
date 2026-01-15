
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export function AttendanceMarker({ hasMarkedToday }: { hasMarkedToday: boolean }) {
    const [loading, setLoading] = useState(false)
    const [marked, setMarked] = useState(hasMarkedToday)

    const markAttendance = async () => {
        setLoading(true)
        try {
            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('mark-attendance', {
                body: { status: 'Present' }
            })

            if (error) {
                // Try to parse the error message from the response body if available
                const body = await error.context?.json().catch(() => ({}))
                throw new Error(body.error || error.message || "Failed to mark attendance")
            }
            setMarked(true)
        } catch (err: any) {
            console.error("Attendance Error:", err)
            alert(err.message || "Error marking attendance")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>Mark your attendance for today, {format(new Date(), "MMM dd, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
                {marked ? (
                    <div className="flex items-center text-green-600 space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Marked Present</span>
                    </div>
                ) : (
                    <Button onClick={markAttendance} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark Present
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
