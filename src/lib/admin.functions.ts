import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Could not verify admin role");
  if (!data) throw new Error("Forbidden: admin access required");
}

/* ---------- Role check ---------- */
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data, userId: context.userId };
  });

/* ---------- Leads ---------- */
export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.string().optional(),
        course: z.string().optional(),
        search: z.string().optional(),
        in_service_area: z.boolean().optional(),
        limit: z.number().int().min(1).max(500).default(300),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(data.limit);
    if (data.status) q = q.eq("status", data.status as any);
    if (data.course) q = q.eq("course", data.course);
    if (data.in_service_area !== undefined) q = q.eq("in_service_area", data.in_service_area);
    if (data.search && data.search.trim()) {
      const s = data.search.trim();
      q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%,pincode.ilike.%${s}%,course.ilike.%${s}%,utm_campaign.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminCreateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(1, "Name is required").max(100),
        phone: z.string().min(6, "Valid phone is required").max(20),
        whatsapp_ok: z.boolean().default(true),
        age: z.number().int().min(3).max(120).optional().nullable(),
        course: z.string().optional().nullable(),
        pincode: z.string().optional().nullable(),
        in_service_area: z.boolean().default(true),
        status: z.enum(["new", "contacted", "booked", "converted", "lost"]).default("new"),
        notes: z.string().max(2000).optional().nullable(),
        utm_source: z.string().optional().nullable(),
        utm_medium: z.string().optional().nullable(),
        utm_campaign: z.string().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: inserted, error } = await context.supabase
      .from("leads")
      .insert({
        name: data.name,
        phone: data.phone,
        whatsapp_ok: data.whatsapp_ok,
        age: data.age ?? null,
        course: data.course ?? null,
        pincode: data.pincode ?? null,
        in_service_area: data.in_service_area,
        status: data.status,
        notes: data.notes ?? null,
        utm_source: data.utm_source ?? "direct_admin",
        utm_medium: data.utm_medium ?? "crm",
        utm_campaign: data.utm_campaign ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });

export const adminDeleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        phone: z.string().min(6).max(20).optional(),
        course: z.string().optional().nullable(),
        age: z.number().int().min(3).max(120).optional().nullable(),
        pincode: z.string().optional().nullable(),
        in_service_area: z.boolean().optional(),
        status: z.enum(["new", "contacted", "booked", "converted", "lost"]).optional(),
        notes: z.string().max(2000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...patch } = data;
    const { error } = await (context.supabase.from("leads") as any).update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Slots ---------- */
export const adminListSlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ days: z.number().int().min(1).max(60).default(14) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const from = new Date().toISOString();
    const to = new Date(Date.now() + data.days * 86400_000).toISOString();
    const { data: rows, error } = await context.supabase
      .from("slots")
      .select("*, bookings(id,status)")
      .gte("starts_at", from)
      .lte("starts_at", to)
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows;
  });

export const adminCreateSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      starts_at: z.string(),
      ends_at: z.string(),
      expert_name: z.string().min(1).max(120).default("Rhythm Raga Expert"),
      capacity: z.number().int().min(1).max(20).default(1),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("slots").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGenerateSlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      days: z.number().int().min(1).max(30).default(14),
      startHour: z.number().int().min(0).max(23).default(10),
      endHour: z.number().int().min(1).max(24).default(20),
      intervalMinutes: z.number().int().min(15).max(120).default(30),
      includeSundays: z.boolean().default(false),
      expert_name: z.string().default("Rhythm Raga Expert"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const rows: any[] = [];
    const start = new Date();
    start.setMinutes(0, 0, 0);
    for (let d = 1; d <= data.days; d++) {
      const day = new Date(start.getTime() + d * 86400_000);
      const dow = day.getDay();
      if (!data.includeSundays && dow === 0) continue;
      for (let h = data.startHour; h < data.endHour; h++) {
        for (let m = 0; m < 60; m += data.intervalMinutes) {
          const s = new Date(day);
          s.setHours(h, m, 0, 0);
          const e = new Date(s.getTime() + data.intervalMinutes * 60_000);
          rows.push({
            starts_at: s.toISOString(),
            ends_at: e.toISOString(),
            expert_name: data.expert_name,
            capacity: 1,
          });
        }
      }
    }
    // Insert in chunks, ignore duplicates via upsert on time
    const { error, data: inserted } = await context.supabase.from("slots").insert(rows).select("id");
    if (error) throw new Error(error.message);
    return { created: inserted?.length ?? 0 };
  });

export const adminToggleSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("slots").update({ is_active: data.is_active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("slots").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Bookings ---------- */
export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, slot:slots(starts_at,ends_at,expert_name), lead:leads(name,phone,course,pincode)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpdateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "confirmed", "completed", "no_show", "cancelled"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Pincodes ---------- */
export const adminListPincodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("serviceable_pincodes")
      .select("*")
      .order("pincode");
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertPincode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      pincode: z.string().regex(/^\d{6}$/, "6 digits"),
      area_name: z.string().max(120).optional().nullable(),
      is_active: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("serviceable_pincodes").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePincode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ pincode: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("serviceable_pincodes").delete().eq("pincode", data.pincode);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Overview stats ---------- */
export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const now = new Date();
    const sinceWeek = new Date(Date.now() - 7 * 86400_000).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [
      leadsAll,
      leadsToday,
      leadsWeek,
      bookingsTotal,
      bookingsWeek,
      newLeads,
      contactedLeads,
      bookedLeads,
      convertedLeads,
      lostLeads,
      outOfAreaLeads,
    ] = await Promise.all([
      context.supabase.from("leads").select("id", { count: "exact", head: true }),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startOfToday),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", sinceWeek),
      context.supabase.from("bookings").select("id", { count: "exact", head: true }),
      context.supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", sinceWeek),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "contacted"),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "booked"),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "converted"),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "lost"),
      context.supabase.from("leads").select("id", { count: "exact", head: true }).eq("in_service_area", false),
    ]);

    const total = leadsAll.count ?? 0;
    const converted = convertedLeads.count ?? 0;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";

    return {
      leadsTotal: total,
      leadsToday: leadsToday.count ?? 0,
      leadsWeek: leadsWeek.count ?? 0,
      bookingsTotal: bookingsTotal.count ?? 0,
      bookingsWeek: bookingsWeek.count ?? 0,
      newCount: newLeads.count ?? 0,
      contactedCount: contactedLeads.count ?? 0,
      bookedCount: bookedLeads.count ?? 0,
      convertedCount: converted,
      lostCount: lostLeads.count ?? 0,
      outOfAreaCount: outOfAreaLeads.count ?? 0,
      conversionRate: Number(conversionRate),
    };
  });
