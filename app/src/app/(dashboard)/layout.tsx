
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut, User as UserIcon, Calendar, ClipboardList } from 'lucide-react'
import { signOut } from '../actions/auth'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

    const isEmployee = user?.role === 'employee'
    const isAdmin = user?.role === 'admin'

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-col hidden md:flex">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-indigo-600">Mini HR</h1>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    <span className="inline-block px-2 py-0.5 mt-2 text-xs font-semibold rounded bg-gray-100 text-gray-800 uppercase">
                        {user?.role}
                    </span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {isEmployee && (
                        <>
                            <Link href="/employee" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                                <UserIcon className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link href="/employee/apply" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                                <Calendar className="w-4 h-4" /> Apply Leave
                            </Link>
                            <Link href="/employee/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                                <ClipboardList className="w-4 h-4" /> History
                            </Link>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                                <UserIcon className="w-4 h-4" /> Overview
                            </Link>
                            <Link href="/admin/leaves" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                                <Calendar className="w-4 h-4" /> Leaves
                            </Link>
                            <Link href="/admin/attendance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                                <ClipboardList className="w-4 h-4" /> Attendance
                            </Link>
                        </>
                    )}
                </nav>
                <div className="p-4 border-t">
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full text-left">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
