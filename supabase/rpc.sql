
-- Function to Approve Leave Request (Atomic)
create or replace function public.approve_leave_request(
  request_id uuid
)
returns void as $$
declare
  req record;
  current_bal int;
begin
  -- Check if admin
  if not public.is_admin() then
    raise exception 'Access denied: User is not an admin';
  end if;

  -- Get request
  select * into req from public.leave_requests where id = request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if req.status != 'Pending' then
    raise exception 'Request is not pending';
  end if;

  -- Check balance
  select balance into current_bal from public.leave_balance where user_id = req.user_id;
  if current_bal < req.total_days then
     raise exception 'Insufficient leave balance';
  end if;

  -- Update request
  update public.leave_requests set status = 'Approved' where id = request_id;

  -- Update balance
  update public.leave_balance 
  set balance = balance - req.total_days, last_updated = now()
  where user_id = req.user_id;
  
end;
$$ language plpgsql security definer;

-- Function to Reject Leave Request
create or replace function public.reject_leave_request(
  request_id uuid
)
returns void as $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: User is not an admin';
  end if;

  update public.leave_requests set status = 'Rejected' where id = request_id;
end;
$$ language plpgsql security definer;

-- Function to Check Overlap (Helper)
create or replace function public.has_leave_overlap(
  u_id uuid,
  s_date date,
  e_date date
)
returns boolean as $$
begin
  return exists (
    select 1 from public.leave_requests
    where user_id = u_id
    and status in ('Pending', 'Approved')
    and (start_date, end_date) overlaps (s_date, e_date)
  );
end;
$$ language plpgsql security definer;
