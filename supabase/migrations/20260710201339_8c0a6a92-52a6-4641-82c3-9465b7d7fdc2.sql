
create or replace function public.submit_lead(
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
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.leads (
    name, phone, whatsapp_ok, age, course, pincode, in_service_area,
    utm_source, utm_medium, utm_campaign, utm_content, gclid, fbclid
  ) values (
    _name, _phone, _whatsapp_ok, _age, _course, _pincode, _in_service_area,
    _utm_source, _utm_medium, _utm_campaign, _utm_content, _gclid, _fbclid
  ) returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.submit_lead(text,text,boolean,int,text,text,boolean,text,text,text,text,text,text) to anon, authenticated;
