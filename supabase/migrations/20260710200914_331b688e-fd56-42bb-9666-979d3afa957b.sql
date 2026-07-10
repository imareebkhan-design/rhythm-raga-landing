
create or replace function public.tg_first_user_becomes_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

drop trigger if exists first_user_becomes_admin on auth.users;
create trigger first_user_becomes_admin
  after insert on auth.users
  for each row execute function public.tg_first_user_becomes_admin();
