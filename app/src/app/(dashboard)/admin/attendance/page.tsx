
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function AdminAttendancePage({
    searchParams,
}: {
    searchParams: { date?: string }
}) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    const dateFilter = searchParams.date || new Date().toISOString().split('T')[0]

    const { data: attendance } = await supabase
        .from('attendance')
        .select('*, users(name, email)')
        .eq('date', dateFilter)
        .order('created_at', { ascending: false })

    async function filterByDate(formData: FormData) {
        'use server'
        const date = formData.get('date') as string
        redirect(`/admin/attendance?date=${date}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>

                <form action={filterByDate} className="flex gap-2 items-center">
                    <Input
                        type="date"
                        name="date"
                        defaultValue={dateFilter}
                        className="w-auto"
                    />
                    <Button type="submit" variant="secondary">Filter</Button>
                </form>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Records for {format(new Date(dateFilter), 'MMMM d, yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Employee</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Time</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {attendance?.map((record: any) => (
                                    <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">{record.users?.name}</div>
                                            <div className="text-xs text-muted-foreground">{record.users?.email}</div>
                                        </td>
                                        <td className="p-4 align-middle font-medium text-green-600">{record.status}</td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {format(new Date(record.created_at), 'h:mm a')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!attendance?.length && <div className="p-8 text-center text-gray-500">No attendance records found for this date.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
