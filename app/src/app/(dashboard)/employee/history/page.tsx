
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'

export default async function HistoryPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch Leaves
    const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch Attendance
    const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dates</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Days</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {leaves?.map((leave) => (
                                    <tr key={leave.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle capitalize">{leave.type}</td>
                                        <td className="p-4 align-middle">
                                            {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="p-4 align-middle">{leave.total_days}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                        ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!leaves?.length && <p className="text-center p-4 text-gray-500">No leave history.</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Time</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {attendance?.map((record) => (
                                    <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                                        <td className="p-4 align-middle text-green-600 font-medium">{record.status}</td>
                                        <td className="p-4 align-middle text-gray-500">{format(new Date(record.created_at), 'h:mm a')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!attendance?.length && <p className="text-center p-4 text-gray-500">No attendance records.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
