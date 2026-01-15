
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, Check, X } from "lucide-react"

export function LeaveActions({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
    const router = useRouter()

    const handleAction = async (action: 'approve' | 'reject') => {
        setLoading(action)
        try {
            const rpcName = action === 'approve' ? 'approve_leave_request' : 'reject_leave_request'
            const { error } = await supabase.rpc(rpcName, { request_id: requestId })

            if (error) throw error

            router.refresh()
        } catch (err: any) {
            alert("Error: " + err.message)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:bg-green-50 border-green-200"
                onClick={() => handleAction('approve')}
                disabled={!!loading}
            >
                {loading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                Approve
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => handleAction('reject')}
                disabled={!!loading}
            >
                {loading === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                Reject
            </Button>
        </div>
    )
}
