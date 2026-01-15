
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserX, Calendar, ClipboardCheck } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()


    const today = new Date().toISOString().split('T')[0]

    // Parallel Queries
    const employeesQuery = supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employee')
    const pendingQuery = supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
    const attendanceQuery = supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Present')

    const [empRes, pendingRes, attRes] = await Promise.all([employeesQuery, pendingQuery, attendanceQuery])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{empRes.count ?? 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRes.count ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Leave requests</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attRes.count ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Employees marked attendance</p>
                    </CardContent>
                </Card>

                {/* Placeholder for Absent or other stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
