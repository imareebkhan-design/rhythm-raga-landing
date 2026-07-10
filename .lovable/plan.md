
# Rhythm Raga — Ads-Ready Lead & Booking Backend

Goal: every ad click ends in a captured lead **and** a booked free-consult slot with an expert. Admin can see leads, manage slots, and track bookings.

## Flow (what the visitor sees)

```text
Ad click → Landing hero "Book Free Consultation"
       ↓
Step 1 — Lead capture   (Name, Phone, WhatsApp OK?, Age, Course, Pincode)
       ↓  serviceability check (5 km / allowed pincodes)
   ┌───┴────────────────────────┐
   │ in-area                    │ out-of-area
   ↓                            ↓
Step 2 — Pick a slot        "We don't cover your area yet —
(next 7 days, 30-min          leave your details, we'll call
open slots from admin)        when we expand."
       ↓
Step 3 — Confirmation page
   • Slot details + add-to-calendar (.ics)
   • WhatsApp confirmation deep-link
   • Reminder that expert will call at slot time
```

The current `LeadForm` (opens WhatsApp) is replaced by this multi-step flow. Copy, colors, and section positioning stay the same. Hero + navbar CTAs (`Book Your Free Trial`, `Book Free Trial`) route to `/book` instead of `#book`.

## What gets built

### 1. Lovable Cloud (database + auth)

Enable Cloud, then create these tables (all with RLS):

- **`leads`** — every form submission, even out-of-area or drop-offs after step 1.
  Columns: id, name, phone, whatsapp_ok, age, course, pincode, in_service_area, source (utm_source/medium/campaign), notes, status (`new`, `contacted`, `booked`, `converted`, `lost`), created_at.
- **`slots`** — bookable consult slots.
  Columns: id, starts_at, ends_at, expert_name, capacity (default 1), is_active, created_at.
- **`bookings`** — a lead ↔ slot with status (`pending`, `confirmed`, `completed`, `no_show`, `cancelled`), notes, created_at. Unique on (slot_id, lead_id).
- **`serviceable_pincodes`** — allow-list of Delhi pincodes within ~5 km of GTB Nagar. Simpler and more reliable than geocoding for the launch.
- **`user_roles`** + `app_role` enum + `has_role()` security-definer function (per project rules). Admin dashboard is gated by the `admin` role.

Public policies:
- `anon` can **INSERT** `leads` and `bookings`, **SELECT** `slots` where `is_active` and `starts_at > now()`, **SELECT** `serviceable_pincodes`. Nothing else.
- Admins can SELECT/UPDATE everything.

### 2. Booking pages (public)

- `/book` — Step 1 lead form. Zod-validated. Writes to `leads`, calls a public server fn to check pincode. On success, saves `leadId` to sessionStorage and routes to `/book/slot`.
- `/book/slot` — grid of the next 7 days × available slots (from `slots` filtered by admin). Picking one calls a public server fn that atomically inserts a booking (checks capacity), updates the lead status to `booked`, and returns booking id.
- `/book/confirmed` — shows slot, `.ics` download, and a WhatsApp deep-link to the academy with pre-filled confirmation message.
- `/book/out-of-area` — friendly "we'll notify when we expand" screen; lead is still saved with `in_service_area = false`.

### 3. Admin dashboard (protected)

- `/auth` — sign-in (email + password) via managed Supabase auth.
- `/_authenticated/admin` layout gated on `has_role('admin')`; non-admins see an "Access denied" panel.
- `/_authenticated/admin/leads` — table of leads with filters (status, in-area, date). Click a row → drawer with details, status dropdown, notes field.
- `/_authenticated/admin/bookings` — day/week view of confirmed bookings; mark completed / no-show.
- `/_authenticated/admin/slots` — create slots (one-off + "generate weekly template: Mon–Sat, 10am–8pm, every 30 min for next 14 days"), toggle `is_active`, delete future empty slots.
- `/_authenticated/admin/pincodes` — manage serviceable pincode list.

### 4. Notifications

- **On booking**: user gets confirmation page + `.ics` + WhatsApp deep-link (opens WhatsApp with a pre-filled message to the academy so the admin phone gets a real chat thread).
- **Admin awareness**: dashboard is the source of truth for launch. Email/SMS notifications to admin are deliberately not in v1 — we can layer Resend or a WhatsApp Business API later without changing the schema.

### 5. Analytics hooks (ads-ready)

- Capture `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `gclid`, `fbclid` from the URL into the lead row.
- Fire two client-side events for Meta/Google Ads pixels: `Lead` on step 1 submit, `Schedule` on booking confirm. Pixel IDs are read from `import.meta.env.VITE_META_PIXEL_ID` / `VITE_GOOGLE_ADS_ID`; if unset, the hooks no-op. Setting up the actual pixels is a follow-up when you share IDs.

## Technical section (for reference)

- Server functions live in `src/lib/booking.functions.ts`; public reads use a publishable-key Supabase client, writes use narrow `TO anon` INSERT policies with column projection and validation.
- Slot booking is transactional: a Postgres function `book_slot(lead_id, slot_id)` locks the slot row and inserts the booking, returning `already_booked | full | ok` so we can't oversell.
- Admin routes use `requireSupabaseAuth` + `has_role('admin')` inside handlers.
- Auth-attacher middleware is registered in `src/start.ts` (project-standard) so admin server fns get the bearer automatically.
- Landing form section is replaced by an `id="book"` anchor that CTA-scrolls to a compact "Book Free Consultation" band linking to `/book`, so hero + navbar CTAs keep working.

## Reasonable defaults (say the word to change any)

- Consult length: **30 min**, one lead per slot.
- Weekly template: **Mon–Sat, 10:00–20:00**, generated 14 days out.
- Serviceable pincodes: seed with GTB Nagar cluster (110009, 110007, 110033, 110052, 110084) — you can edit in the admin.
- Free-consult framing everywhere (headline: "Book Your Free Consultation").
- No email/SMS in v1; WhatsApp deep-link + dashboard only.

## What I need from you before I build

1. Confirm the admin's **email address** to seed as the first admin user (I'll ask for the password securely inside the app).
2. Confirm the **WhatsApp number** to use for confirmations (currently `+91-9999999999` placeholder in the code).
3. Any pincodes to add/remove from the seed list.

Approve this and I'll implement it end-to-end in build mode.
