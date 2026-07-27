-- =============================================================================
-- Norfolk Yarn — 0003_auth_trigger.sql
-- Auto-create a `profiles` row whenever someone signs up via Supabase Auth.
-- Without this, a fresh auth.users row has no matching profiles row, so
-- is_admin() (0002_rls.sql) has nothing to read and silently returns false.
--
-- Role is left null (ordinary user) for everyone by default — promote a
-- specific user to admin afterwards with a plain UPDATE, e.g.:
--   update profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'someone@example.com');
-- =============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
