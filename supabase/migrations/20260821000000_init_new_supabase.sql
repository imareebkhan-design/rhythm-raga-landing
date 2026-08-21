-- =========================================================================
-- Rhythm Raga — Complete Schema Migration for New Supabase Project
-- =========================================================================

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'booked', 'converted', 'lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'no_show', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. user_roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. serviceable_pincodes Table
CREATE TABLE IF NOT EXISTS public.serviceable_pincodes (
  pincode text PRIMARY KEY,
  area_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.serviceable_pincodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active pincodes" ON public.serviceable_pincodes;
CREATE POLICY "Anyone can read active pincodes"
  ON public.serviceable_pincodes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage pincodes" ON public.serviceable_pincodes;
CREATE POLICY "Admins can manage pincodes"
  ON public.serviceable_pincodes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed Serviceable Pincodes
INSERT INTO public.serviceable_pincodes (pincode, area_name) VALUES
  ('110009', 'GTB Nagar'),
  ('110007', 'Kamla Nagar / North Campus'),
  ('110033', 'Model Town'),
  ('110052', 'Ashok Vihar'),
  ('110084', 'Burari')
ON CONFLICT (pincode) DO UPDATE
  SET area_name = EXCLUDED.area_name, is_active = true;

-- 4. leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp_ok boolean NOT NULL DEFAULT true,
  age int,
  course text,
  pincode text,
  in_service_area boolean NOT NULL DEFAULT false,
  status public.lead_status NOT NULL DEFAULT 'new',
  notes text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  gclid text,
  fbclid text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  CONSTRAINT leads_phone_len CHECK (char_length(phone) BETWEEN 6 AND 20),
  CONSTRAINT leads_age_range CHECK (age IS NULL OR (age BETWEEN 3 AND 120))
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create a lead" ON public.leads;
DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
CREATE POLICY "Admins can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. slots Table
CREATE TABLE IF NOT EXISTS public.slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  expert_name text NOT NULL DEFAULT 'Rhythm Raga Expert',
  capacity int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT slots_time_order CHECK (ends_at > starts_at),
  CONSTRAINT slots_capacity_positive CHECK (capacity > 0)
);

ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS slots_starts_at_idx ON public.slots (starts_at);

DROP POLICY IF EXISTS "Anyone can read active future slots" ON public.slots;
CREATE POLICY "Anyone can read active future slots"
  ON public.slots FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND starts_at > now());

DROP POLICY IF EXISTS "Admins can read all slots" ON public.slots;
CREATE POLICY "Admins can read all slots"
  ON public.slots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage slots" ON public.slots;
CREATE POLICY "Admins can manage slots"
  ON public.slots FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES public.slots(id) ON DELETE RESTRICT,
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_id, lead_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS bookings_slot_idx ON public.bookings (slot_id);
CREATE INDEX IF NOT EXISTS bookings_lead_idx ON public.bookings (lead_id);

DROP POLICY IF EXISTS "Admins can read bookings" ON public.bookings;
CREATE POLICY "Admins can read bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Functions & Triggers

-- updated_at trigger for leads
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_set_updated_at ON public.leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- First user becomes admin trigger on auth.users
CREATE OR REPLACE FUNCTION public.tg_first_user_becomes_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS first_user_becomes_admin ON auth.users;
CREATE TRIGGER first_user_becomes_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.tg_first_user_becomes_admin();

-- Submit lead RPC (Security Definer)
CREATE OR REPLACE FUNCTION public.submit_lead(
  _name text,
  _phone text,
  _whatsapp_ok boolean,
  _age int,
  _course text,
  _pincode text,
  _in_service_area boolean,
  _utm_source text,
  _utm_medium text,
  _utm_campaign text,
  _utm_content text,
  _gclid text,
  _fbclid text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.leads (
    name, phone, whatsapp_ok, age, course, pincode, in_service_area,
    utm_source, utm_medium, utm_campaign, utm_content, gclid, fbclid
  ) VALUES (
    _name, _phone, _whatsapp_ok, _age, _course, _pincode, _in_service_area,
    _utm_source, _utm_medium, _utm_campaign, _utm_content, _gclid, _fbclid
  ) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Atomic Booking RPC (Security Definer)
CREATE OR REPLACE FUNCTION public.book_slot(_lead_id uuid, _slot_id uuid)
RETURNS TABLE (result text, booking_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slot public.slots%ROWTYPE;
  _count int;
  _existing uuid;
  _new_id uuid;
BEGIN
  PERFORM 1 FROM public.leads WHERE id = _lead_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'lead_not_found'::text, NULL::uuid; RETURN;
  END IF;

  SELECT * INTO _slot FROM public.slots
    WHERE id = _slot_id AND is_active = true AND starts_at > now()
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'slot_not_found'::text, NULL::uuid; RETURN;
  END IF;

  SELECT id INTO _existing FROM public.bookings
    WHERE slot_id = _slot_id AND lead_id = _lead_id
      AND status IN ('pending','confirmed','completed');
  IF FOUND THEN
    RETURN QUERY SELECT 'already_booked'::text, _existing; RETURN;
  END IF;

  SELECT count(*) INTO _count FROM public.bookings
    WHERE slot_id = _slot_id AND status IN ('pending','confirmed','completed');
  IF _count >= _slot.capacity THEN
    RETURN QUERY SELECT 'slot_full'::text, NULL::uuid; RETURN;
  END IF;

  INSERT INTO public.bookings (lead_id, slot_id, status)
    VALUES (_lead_id, _slot_id, 'confirmed')
    RETURNING id INTO _new_id;

  UPDATE public.leads SET status = 'booked', updated_at = now() WHERE id = _lead_id;

  RETURN QUERY SELECT 'ok'::text, _new_id;
END;
$$;

-- Public Available Slots RPC (Security Definer)
CREATE OR REPLACE FUNCTION public.available_slots(_days int DEFAULT 7)
RETURNS TABLE (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  expert_name text,
  remaining int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.starts_at, s.ends_at, s.expert_name,
    (s.capacity - COALESCE((
      SELECT count(*) FROM public.bookings b
      WHERE b.slot_id = s.id AND b.status IN ('pending','confirmed','completed')
    ), 0))::int AS remaining
  FROM public.slots s
  WHERE s.is_active = true
    AND s.starts_at > now()
    AND s.starts_at < now() + (_days || ' days')::interval
    AND (s.capacity - COALESCE((
      SELECT count(*) FROM public.bookings b
      WHERE b.slot_id = s.id AND b.status IN ('pending','confirmed','completed')
    ), 0)) > 0
  ORDER BY s.starts_at ASC;
$$;

-- 8. Explicit Permissions & Execution Security
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.submit_lead(text, text, boolean, integer, text, text, boolean, text, text, text, text, text, text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead(text, text, boolean, integer, text, text, boolean, text, text, text, text, text, text) TO anon, service_role;

REVOKE ALL ON FUNCTION public.book_slot(uuid, uuid) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.book_slot(uuid, uuid) TO anon, service_role;

REVOKE ALL ON FUNCTION public.available_slots(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.available_slots(integer) TO anon, authenticated, service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.serviceable_pincodes TO anon, authenticated;
GRANT ALL ON public.serviceable_pincodes TO service_role;

GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

GRANT SELECT ON public.slots TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.slots TO authenticated;
GRANT ALL ON public.slots TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

-- 9. Automatic Admin Role Grant for Academy Owners
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) IN (
  'imareebkhan@gmail.com',
  'rhytthmraga@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
