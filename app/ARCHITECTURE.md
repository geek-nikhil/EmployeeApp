# Mini HR System - Architecture & Design Document

## 1. High-Level Architecture
The application is built using a modern **Serverless** architecture, leveraging **Next.js 15 (App Router)** for the frontend/full-stack framework and **Supabase** (PostgreSQL) for the backend-as-a-service.

### Tech Stack
- **Frontend**: Next.js 16 (React 19), Tailwind CSS, Shadcn/UI (Radix Primitives).
- **Backend**: Supabase (PostgreSQL Database, Auth, Edge Functions).
- **Language**: TypeScript throughout for type safety.

---

## 2. Core Design Decisions

### A. Authentication & Authorization (RBAC)
We implemented a robust **Role-Based Access Control (RBAC)** system with two distinct layers of security:

1.  **Application Layer (Middleware)**:
    - `middleware.ts` runs on every request.
    - It intercepts routes starting with `/admin` or `/employee`.
    - It checks the user's role and redirects them if they try to access unauthorized pages (e.g., an employee trying to access `/admin`).

2.  **Database Layer (Row Level Security - RLS)**:
    - Even if someone bypasses the UI, the database is locked down.
    - We use Postgres Policies to ensure:
        - Employees can *only* see their own data (`auth.uid() = user_id`).
        - Admins can see *all* data (`is_admin()` function).

### B. "Public User" Pattern
Supabase handles authentication in a protected `auth.users` table. However, we need to store application data (like Roles, Date of Joining) that our app can easily query.
- **Solution**: We created a `public.users` table that mirrors `auth.users`.
- **Syncing**: A Database Trigger (`on_auth_user_created`) automatically copies new users from `auth` to `public` and initializes their `leave_balance`.

### C. Atomic Business Logic
For critical operations, we avoid client-side logic to prevent race conditions and hacking.

1.  **Leave Approval (Database Transaction)**:
    - When an Admin approves leave, two things must happen:
        1. Update status to 'Approved'.
        2. Deduct days from `leave_balance`.
    - **Why standard API fail**: If step 1 succeeds but step 2 fails, data is corrupted.
    - **Our Solution**: We used a **Postgres RPC Function** (`approve_leave_request`). It runs inside a database transaction, ensuring ACID compliance (All or Nothing).

2.  **Marking Attendance (Edge Function)**:
    - **Problem**: If we let the client insert into the `attendance` table, a savvy user could manually send a request for yesterday's date or a future date.
    - **Our Solution**: We use a **Supabase Edge Function** (`mark-attendance`).
        - It runs on the server (Deno runtime).
        - It ignores any date sent by the client and forces the use of the server's current date/time.
        - Checks for duplicates before inserting.

---

## 3. Database Schema

### Tables
1.  **`users`**: Extends auth profile. Stores `role` ('admin' | 'employee').
2.  **`leave_balance`**: Tracks available leave days.
3.  **`leave_requests`**: Stores applications (`start_date`, `end_date`, `reason`, `status`).
4.  **`attendance`**: daily logs (`status`, `date`).

### Key Constraints
- **Foreign Keys**: All tables reference `public.users(id)` with `ON DELETE CASCADE` (if a user is deleted, their data is wiped).
- **Unique Constraint**: `attendance(user_id, date)` prevents marking attendance twice in one day.

---

## 4. Workflows

### 1. The Login Flow
1. User enters credentials on `/login`.
2. Supabase Auth validates and returns a JWT session.
3. `page.tsx` (Server Component) checks the user's role from the DB.
4. Redirects to `/admin` or `/employee` accordingly.

### 2. The Leave Application Flow
1. **Employee**: Fills form -> Inserts row into `leave_requests` with status 'Pending'.
2. **Admin**: Sees list of 'Pending' requests.
3. **Admin Actions**:
    - **Approve**: Calls `approve_leave_request` RPC -> Updates Status + Deducts Balance.
    - **Reject**: Calls `reject_leave_request` RPC -> Just Updates Status.

### 3. The Attendance Flow
1. **Frontend**: Employee clicks "Mark Present".
2. **API**: Calls `supabase.functions.invoke('mark-attendance')`.
3. **Backend**:
    - Verifies User.
    - Checks if record exists for today (Error if yes).
    - Inserts `{ status: 'Present', date: Today }`.
4. **Frontend**: Receives success/error and updates UI.

---

## 5. Potential Interview Questions

**Q: Why standard SQL for Leave Approval instead of simple updates?**
*A: To ensure atomicity. We need to update the request status AND deduct leave balance together. If one fails, both should roll back.*

**Q: Where do you handle role-based redirection?**
*A: Primarily in Next.js Middleware for page protection, but also in the root `page.tsx` for the initial login landing logic.*

**Q: How do you handle security?**
*A: We use "Defense in Depth". RLS protects the database data, Middleware protects the routes, and Server Actions/Edge Functions validate business logic inputs.*
