
-- TRIGGER FOR NEW USERS
-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'employee');
  
  insert into public.leave_balance (user_id, balance)
  values (new.id, 20);
  
  return new;
end;
$$;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- MANUAL SYNC FOR EXISTING USERS (Run this manually if needed)
-- insert into public.users (id, email, name, role)
-- select id, email, raw_user_meta_data->>'name', 'employee'
-- from auth.users
-- where id not in (select id from public.users);

-- insert into public.leave_balance (user_id)
-- select id from public.users
-- where id not in (select user_id from public.leave_balance);
