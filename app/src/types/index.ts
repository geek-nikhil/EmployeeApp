
export type Role = 'employee' | 'admin'

export type User = {
    id: string
    name: string
    email: string
    role: Role
    date_of_joining: string
}

export type LeaveType = 'casual' | 'sick' | 'paid'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

export type LeaveRequest = {
    id: string
    user_id: string
    type: LeaveType
    start_date: string
    end_date: string
    total_days: number
    reason?: string
    status: LeaveStatus
    created_at: string
}

export type LeaveBalance = {
    user_id: string
    balance: number
    last_updated: string
}

export type Attendance = {
    id: string
    user_id: string
    date: string
    status: 'Present' | 'Absent'
    created_at: string
}
