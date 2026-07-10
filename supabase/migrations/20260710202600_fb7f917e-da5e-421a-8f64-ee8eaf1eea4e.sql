
-- Drop always-true INSERT policy on leads; inserts go through submit_lead RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "Anyone can create a lead" ON public.leads;

-- Lock down SECURITY DEFINER function execution to the minimum needed
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.submit_lead(text, text, boolean, integer, text, text, boolean, text, text, text, text, text, text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead(text, text, boolean, integer, text, text, boolean, text, text, text, text, text, text) TO anon, service_role;

REVOKE ALL ON FUNCTION public.book_slot(uuid, uuid) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.book_slot(uuid, uuid) TO anon, service_role;

REVOKE ALL ON FUNCTION public.available_slots(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.available_slots(integer) TO anon, authenticated, service_role;
