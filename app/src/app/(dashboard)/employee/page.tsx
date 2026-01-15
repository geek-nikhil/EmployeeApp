
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { LeaveBalance } from "@/components/employee/leave-balance"
import { AttendanceMarker } from "@/components/employee/attendance-marker"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function EmployeeDashboard() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Parallel fetch: Balance & Attendance today
    const balanceQuery = supabase
        .from('leave_balance')
        .select('balance')
        .eq('user_id', user.id)
        .single()

    // Check attendance for today
    // Note: 'date' in DB is YYYY-MM-DD. 'now()' might return timestamp.
    // We need to compare strictly date.
    const today = new Date().toISOString().split('T')[0]
    const attendanceQuery = supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

    const [balanceRes, attendanceRes] = await Promise.all([balanceQuery, attendanceQuery])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Link href="/employee/apply">
                    <Button>Apply for Leave</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <LeaveBalance balance={balanceRes.data?.balance ?? 20} />
                <AttendanceMarker hasMarkedToday={!!attendanceRes.data} />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                {/* Add more widgets or recent history here */}
                <div className="p-4 bg-white rounded-lg shadow border text-sm text-gray-500">
                    No recent activity to show.
                </div>
            </div>
        </div>
    )
}
