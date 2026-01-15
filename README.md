# Mini HR System - Employee Leave & Attendance

This is a production-ready Mini HR Tool built with **Next.js (App Router)**, **Supabase** (Auth, Database, Edge Functions), and **Tailwind CSS**.

## Features
- **Role-based Access**: Employee and Admin dashboards.
- **Leave Management**: Apply for leaves, auto-calculate days, admin approval workflow (atomic balance updates).
- **Attendance**: Daily attendance marking with location-agnostic logic.
- **Reporting**: Admin views for leaves and attendance history.

## Tech Stack
- **Frontend**: Next.js 14+ (TypeScript), Tailwind CSS, Lucide Icons, Shadcn-like UI components.
- **Backend Service**: Supabase (PostgreSQL).
- **Business Logic**: Supabase Edge Functions & Postgres RPC.
- **Auth**: Supabase Auth (Email/Password).

## Setup Instructions

### 1. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL script located at `supabase/schema.sql` in your Supabase SQL Editor. This will:
- Create tables (`users`, `leave_requests`, `attendance`, `leave_balance`).
- Enable RLS policies.
- Create the `is_admin` helper function.

Run `supabase/triggers.sql` to create the user sync triggers.

Run `supabase/rpc.sql` to create the business logic functions (`approve_leave_request`, etc.).

### 3. Edge Functions
Deploy the functions located in `supabase/functions/`:
```bash
cd supabase
supabase functions deploy apply-leave
supabase functions deploy mark-attendance
```
Note: Ensure you set the `SUPABASE_URL` and `SUPABASE_ANON_KEY` secrets for your Edge Functions if not auto-injected.

### 4. Admin Seeding
To make a user an admin, manually update the `role` in the `public.users` table:
```sql
update public.users set role = 'admin' where email = 'admin@example.com';
```

## AI Usage Disclosure
This project was implemented with the assistance of AI models, specifically **ChatGPT** and **Antigravity**. The database schema is designed according to relevant industry standards. The development of this project was AI-assisted rather than fully automated, with the AI helping primarily in error resolution, code optimization, and performance enhancements.

## Schema Overview
- **users**: Extends auth.users.
- **leave_balance**: Tracks remaining days (default 20).
- **leave_requests**: Status (Pending/Approved/Rejected).
- **attendance**: Daily records.

## Limitations
- **Admin Signup**: No UI for creating admins (security by design).
- **Notifications**: No email notifications configured (relies on Dashboard).
- **Timezones**: Uses server dates (UTC/ISO) mostly; strict timezone handling for global teams may need enhancements.

## Development
Run the development server:
```bash
cd app
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
