
-- =========================================
-- Enums
-- =========================================
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.lead_status as enum ('new', 'contacted', 'booked', 'converted', 'lost');
create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'no_show', 'cancelled');

-- =========================================
-- user_roles
-- =========================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- serviceable_pincodes
-- =========================================
create table public.serviceable_pincodes (
  pincode text primary key,
  area_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.serviceable_pincodes to anon, authenticated;
grant all on public.serviceable_pincodes to service_role;

alter table public.serviceable_pincodes enable row level security;

create policy "Anyone can read active pincodes"
  on public.serviceable_pincodes for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins can manage pincodes"
  on public.serviceable_pincodes for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.serviceable_pincodes (pincode, area_name) values
  ('110009', 'GTB Nagar'),
  ('110007', 'Kamla Nagar / North Campus'),
  ('110033', 'Model Town'),
  ('110052', 'Ashok Vihar'),
  ('110084', 'Burari');

-- =========================================
-- leads
-- =========================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp_ok boolean not null default true,
  age int,
  course text,
  pincode text,
  in_service_area boolean not null default false,
  status lead_status not null default 'new',
  notes text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  gclid text,
  fbclid text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_name_len check (char_length(name) between 1 and 100),
  constraint leads_phone_len check (char_length(phone) between 6 and 20),
  constraint leads_age_range check (age is null or (age between 3 and 120))
);

grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;

alter table public.leads enable row level security;

create policy "Anyone can create a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read leads"
  on public.leads for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update leads"
  on public.leads for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete leads"
  on public.leads for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- slots
-- =========================================
create table public.slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  expert_name text not null default 'Rhythm Raga Expert',
  capacity int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint slots_time_order check (ends_at > starts_at),
  constraint slots_capacity_positive check (capacity > 0)
);

grant select on public.slots to anon, authenticated;
grant all on public.slots to service_role;
grant insert, update, delete on public.slots to authenticated;

alter table public.slots enable row level security;

create policy "Anyone can read active future slots"
  on public.slots for select
  to anon, authenticated
  using (is_active = true and starts_at > now());

create policy "Admins can read all slots"
  on public.slots for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage slots"
  on public.slots for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index slots_starts_at_idx on public.slots (starts_at);

-- =========================================
-- bookings
-- =========================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  slot_id uuid not null references public.slots(id) on delete restrict,
  status booking_status not null default 'confirmed',
  notes text,
  created_at timestamptz not null default now(),
  unique (slot_id, lead_id)
);

grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;

alter table public.bookings enable row level security;

create policy "Admins can read bookings"
  on public.bookings for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage bookings"
  on public.bookings for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index bookings_slot_idx on public.bookings (slot_id);
create index bookings_lead_idx on public.bookings (lead_id);

-- =========================================
-- Atomic booking function (public, security definer)
-- Returns: 'ok' | 'slot_not_found' | 'slot_full' | 'already_booked' | 'lead_not_found'
-- =========================================
create or replace function public.book_slot(_lead_id uuid, _slot_id uuid)
returns table (result text, booking_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  _slot public.slots%rowtype;
  _count int;
  _existing uuid;
  _new_id uuid;
begin
  -- lead must exist
  perform 1 from public.leads where id = _lead_id;
  if not found then
    return query select 'lead_not_found'::text, null::uuid; return;
  end if;

  -- lock the slot row
  select * into _slot from public.slots
    where id = _slot_id and is_active = true and starts_at > now()
    for update;
  if not found then
    return query select 'slot_not_found'::text, null::uuid; return;
  end if;

  -- already booked by this lead?
  select id into _existing from public.bookings
    where slot_id = _slot_id and lead_id = _lead_id
      and status in ('pending','confirmed','completed');
  if found then
    return query select 'already_booked'::text, _existing; return;
  end if;

  -- capacity check
  select count(*) into _count from public.bookings
    where slot_id = _slot_id and status in ('pending','confirmed','completed');
  if _count >= _slot.capacity then
    return query select 'slot_full'::text, null::uuid; return;
  end if;

  insert into public.bookings (lead_id, slot_id, status)
    values (_lead_id, _slot_id, 'confirmed')
    returning id into _new_id;

  update public.leads set status = 'booked', updated_at = now() where id = _lead_id;

  return query select 'ok'::text, _new_id;
end;
$$;

grant execute on function public.book_slot(uuid, uuid) to anon, authenticated;

-- =========================================
-- Public read function for available slots (bypasses admin-only SELECT with SD)
-- Returns future active slots + remaining capacity
-- =========================================
create or replace function public.available_slots(_days int default 7)
returns table (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  expert_name text,
  remaining int
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.starts_at, s.ends_at, s.expert_name,
    (s.capacity - coalesce((
      select count(*) from public.bookings b
      where b.slot_id = s.id and b.status in ('pending','confirmed','completed')
    ), 0))::int as remaining
  from public.slots s
  where s.is_active = true
    and s.starts_at > now()
    and s.starts_at < now() + (_days || ' days')::interval
    and (s.capacity - coalesce((
      select count(*) from public.bookings b
      where b.slot_id = s.id and b.status in ('pending','confirmed','completed')
    ), 0)) > 0
  order by s.starts_at asc
$$;

grant execute on function public.available_slots(int) to anon, authenticated;

-- =========================================
-- updated_at trigger for leads
-- =========================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.tg_set_updated_at();
