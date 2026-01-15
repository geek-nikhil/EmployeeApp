
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaveActions } from '@/components/admin/leave-actions'
import { format } from 'date-fns'

export default async function AdminLeavesPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    // Fetch all pending requests + user info
    const { data: requests, error } = await supabase
        .from('leave_requests')
        .select('*, users(name, email)')
        .eq('status', 'Pending')
        .order('created_at', { ascending: true })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Employee</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dates</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Days</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Reason</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {requests?.map((req: any) => (
                                    <tr key={req.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">{req.users?.name}</div>
                                            <div className="text-xs text-muted-foreground">{req.users?.email}</div>
                                        </td>
                                        <td className="p-4 align-middle capitalize">{req.type}</td>
                                        <td className="p-4 align-middle">
                                            {format(new Date(req.start_date), 'MMM d')} - {format(new Date(req.end_date), 'MMM d')}
                                        </td>
                                        <td className="p-4 align-middle">{req.total_days}</td>
                                        <td className="p-4 align-middle max-w-[200px] truncate" title={req.reason}>
                                            {req.reason || '-'}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <LeaveActions requestId={req.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!requests?.length && <div className="p-8 text-center text-gray-500">No pending leave requests.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
