
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { differenceInBusinessDays, parseISO } from "date-fns" // or simple diff
// Note: user didn't have differenceInBusinessDays installed? 'date-fns' was installed.
import { differenceInCalendarDays } from "date-fns"

export default function ApplyLeavePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        type: 'casual',
        start_date: '',
        end_date: '',
        reason: ''
    })

    // Calculate days
    const start = formData.start_date ? new Date(formData.start_date) : null
    const end = formData.end_date ? new Date(formData.end_date) : null
    const totalDays = start && end ? differenceInCalendarDays(end, start) + 1 : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.functions.invoke('apply-leave', {
                body: {
                    ...formData,
                    total_days: totalDays
                }
            })

            if (error) throw error

            alert("Leave request submitted!")
            router.push('/employee')
            router.refresh()
        } catch (err: any) {
            alert(err.message || 'Failed to submit')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Apply for Leave</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="type">Leave Type</Label>
                            <select
                                id="type"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-1"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="casual">Casual Leave</option>
                                <option value="sick">Sick Leave</option>
                                <option value="paid">Paid Leave</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start">Start Date</Label>
                                <Input
                                    id="start"
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="end">End Date</Label>
                                <Input
                                    id="end"
                                    type="date"
                                    required
                                    min={formData.start_date}
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {totalDays > 0 && (
                            <p className="text-sm text-gray-500">
                                Total Days: <span className="font-semibold text-gray-900">{totalDays}</span>
                            </p>
                        )}

                        <div>
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <textarea
                                id="reason"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-1"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading || totalDays <= 0}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
