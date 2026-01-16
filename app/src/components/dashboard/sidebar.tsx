"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User as UserIcon, Calendar, ClipboardList, LayoutDashboard } from "lucide-react"
import { cn } from "@/utils/cn"
import { signOut } from "@/app/actions/auth"

interface SidebarProps {
    user: {
        email: string
        role: string
    } | null
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const isEmployee = user?.role === 'employee'
    const isAdmin = user?.role === 'admin'

    const isActive = (path: string) => pathname === path

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl shadow-xl m-4 rounded-2xl flex-col hidden md:flex border border-white/20 relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-8 border-b border-indigo-50/50 z-10">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                        Mini HR
                    </h1>
                </div>

                <div className="mt-6 flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logged in as</span>
                    <span className="text-sm font-medium text-gray-700 truncate">{user?.email}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit mt-2 capitalize
                        ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 z-10 overflow-y-auto">
                {isEmployee && (
                    <>
                        <NavLink href="/employee" icon={UserIcon} label="Dashboard" active={isActive('/employee')} />
                        <NavLink href="/employee/apply" icon={Calendar} label="Apply Leave" active={isActive('/employee/apply')} />
                        <NavLink href="/employee/history" icon={ClipboardList} label="History" active={isActive('/employee/history')} />
                    </>
                )}
                {isAdmin && (
                    <>
                        <NavLink href="/admin" icon={UserIcon} label="Overview" active={isActive('/admin')} />
                        <NavLink href="/admin/leaves" icon={Calendar} label="Leaves" active={isActive('/admin/leaves')} />
                        <NavLink href="/admin/attendance" icon={ClipboardList} label="Attendance" active={isActive('/admin/attendance')} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-indigo-50/50 z-10">
                <form action={signOut}>
                    <button type="submit" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 w-full text-left group">
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" /> Sign Out
                    </button>
                </form>
            </div>
        </aside>
    )
}

function NavLink({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
    return (
        <Link href={href} className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
            active
                ? "text-white shadow-lg shadow-indigo-500/25"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        )}>
            {/* Gradient background for active state */}
            {active && (
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 z-0"></div>
            )}

            <Icon className={cn("w-4 h-4 z-10 transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "")} />
            <span className="z-10">{label}</span>
        </Link>
    )
}
