
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('employee', 'admin')),
  date_of_joining date not null default current_date
);

-- LEAVE BALANCE TABLE
create table public.leave_balance (
  user_id uuid references public.users(id) on delete cascade not null primary key,
  balance int not null default 20,
  last_updated timestamptz not null default now()
);

-- LEAVE REQUESTS TABLE
create table public.leave_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('casual', 'sick', 'paid')),
  start_date date not null,
  end_date date not null,
  total_days int not null,
  reason text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz default now()
);

-- ATTENDANCE TABLE
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null default current_date,
  status text not null check (status in ('Present', 'Absent')),
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ROW LEVEL SECURITY
alter table public.users enable row level security;
alter table public.leave_balance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.attendance enable row level security;

-- POLICIES

-- Users:
-- Employees can view their own profile.
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Admins can view all profiles. (Assuming admin role check via separate logic or claim, 
-- but for simplicity we rely on a helper function or subquery. 
-- Note: Infinite recursion risk if we query users table to check role. 
-- Strategy: We'll permit reading public.users for now if authenticated, 
-- but strictly filtering sensitive data is handled in UI/API. 
-- OR: better approach, use a secure view or metadata. 
-- For this prototype, I will allow read access to authenticated users generally 
-- but write only for specific conditions.)
create policy "Authenticated users can view all profiles" on public.users
  for select to authenticated using (true); 
-- (Revised: employees need to see other employees? No. Admin needs to see all. 
-- Employees need to see only themselves. But checking "am I admin" requires reading "role" from this table.
-- This creates a catch-22. 
-- Solution: Define a function `is_admin()` that checks the table with `security definer`.

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Now policies:
drop policy if exists "Authenticated users can view all profiles" on public.users;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Admins can view all profiles" on public.users
  for select using (is_admin());

-- Leave Balance:
drop policy if exists "Users view own balance" on public.leave_balance;
drop policy if exists "Admins view all balances" on public.leave_balance;

create policy "Users view own balance" on public.leave_balance
  for select using (auth.uid() = user_id);

create policy "Admins view all balances" on public.leave_balance
  for select using (is_admin());

-- Leave Requests:
drop policy if exists "Users can create leave requests" on public.leave_requests;
drop policy if exists "Users view own requests" on public.leave_requests;
drop policy if exists "Admins view all requests" on public.leave_requests;
drop policy if exists "Admins can update requests" on public.leave_requests;

create policy "Users can create leave requests" on public.leave_requests
  for insert with check (auth.uid() = user_id);

create policy "Users view own requests" on public.leave_requests
  for select using (auth.uid() = user_id);

create policy "Admins view all requests" on public.leave_requests
  for select using (is_admin());

create policy "Admins can update requests" on public.leave_requests
  for update using (is_admin());

-- Attendance:
drop policy if exists "Users can mark attendance" on public.attendance;
drop policy if exists "Users view own attendance" on public.attendance;
drop policy if exists "Admins view all attendance" on public.attendance;

create policy "Users can mark attendance" on public.attendance
  for insert with check (auth.uid() = user_id);

create policy "Users view own attendance" on public.attendance
  for select using (auth.uid() = user_id);

create policy "Admins view all attendance" on public.attendance
  for select using (is_admin());
