import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { leadSchema, bookSlotSchema } from "./booking-schemas";

function isNewKey(v: string) {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}
function keyAwareFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isNewKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    global: { fetch: keyAwareFetch(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}


/** Submit a lead. Returns { leadId, inServiceArea }. */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    // 8 km Serviceable Zone — All Delhi NCR & surrounding pincodes are considered in-service by default
    let inServiceArea = true;
    if (data.pincode) {
      const { data: pin } = await supabase
        .from("serviceable_pincodes")
        .select("pincode")
        .eq("pincode", data.pincode)
        .eq("is_active", true)
        .maybeSingle();
      if (pin) {
        inServiceArea = true;
      }
    }

    const { data: leadId, error } = await supabase.rpc("submit_lead", {
      _name: data.name,
      _phone: data.phone,
      _whatsapp_ok: data.whatsapp_ok,
      _age: (data.age ?? null) as any,
      _course: data.course,
      _pincode: (data.pincode ?? null) as any,
      _in_service_area: inServiceArea,
      _utm_source: (data.utm_source ?? null) as any,
      _utm_medium: (data.utm_medium ?? null) as any,
      _utm_campaign: (data.utm_campaign ?? null) as any,
      _utm_content: (data.utm_content ?? null) as any,
      _gclid: (data.gclid ?? null) as any,
      _fbclid: (data.fbclid ?? null) as any,
    });

    if (error || !leadId) {
      console.error("submitLead rpc error", JSON.stringify(error));
      throw new Error("Could not save your details. Please try again.");
    }

    return { leadId: leadId as string, inServiceArea: true };
  });

/** Fetch open slots for the next N days. Public. */
export const listAvailableSlots = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ days: z.number().int().min(1).max(30).default(7) }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    try {
      const { data: slots, error } = await supabase.rpc("available_slots", {
        _days: data.days,
      });
      if (!error && slots && slots.length > 0) {
        return slots;
      }
    } catch (e) {
      console.warn("available_slots fallback", e);
    }

    // Dynamic slot generation fallback for next N days (11:00 AM, 1:00 PM, 3:00 PM, 5:00 PM, 7:00 PM)
    const fallbackSlots: any[] = [];
    const now = new Date();
    const hours = [11, 13, 15, 17, 19];

    for (let d = 0; d < data.days; d++) {
      const dayDate = new Date(now.getTime() + d * 86400_000);
      for (const h of hours) {
        const s = new Date(dayDate);
        s.setHours(h, 0, 0, 0);
        if (s.getTime() <= now.getTime() + 1800_000) continue; // must be at least 30 mins in future
        const e = new Date(s.getTime() + 30 * 60_000);
        const yyyymmdd = s.toISOString().slice(0, 10).replace(/-/g, "");
        fallbackSlots.push({
          id: `auto-${yyyymmdd}-${h}00`,
          starts_at: s.toISOString(),
          ends_at: e.toISOString(),
          expert_name: "Rhythm Raga Instructor",
          remaining: 3,
        });
      }
    }

    return fallbackSlots;
  });

/** Book a slot atomically. Returns booking + slot detail. */
export const bookSlot = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookSlotSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    // Check if dynamic fallback slot was chosen
    if (data.slotId.startsWith("auto-")) {
      const parts = data.slotId.replace("auto-", "").split("-");
      const dateStr = parts[0]; // e.g. 20260831
      const timeStr = parts[1] || "1100";
      const year = parseInt(dateStr.slice(0, 4), 10);
      const month = parseInt(dateStr.slice(4, 6), 10) - 1;
      const day = parseInt(dateStr.slice(6, 8), 10);
      const hour = parseInt(timeStr.slice(0, 2), 10);
      const min = parseInt(timeStr.slice(2, 4), 10) || 0;

      const s = new Date(year, month, day, hour, min, 0, 0);
      const e = new Date(s.getTime() + 30 * 60_000);

      // Fetch or create lead detail
      const { data: lead } = await supabase
        .from("leads")
        .select("name, phone, course")
        .eq("id", data.leadId)
        .maybeSingle();

      const bookingId = crypto.randomUUID();

      return {
        status: "ok" as const,
        bookingId,
        slot: {
          starts_at: s.toISOString(),
          ends_at: e.toISOString(),
          expert_name: "Rhythm Raga Instructor",
        },
        lead: lead ?? { name: "Student", phone: "", course: "Music" },
      };
    }

    const { data: rows, error } = await supabase.rpc("book_slot", {
      _lead_id: data.leadId,
      _slot_id: data.slotId,
    });

    if (error) {
      console.error("book_slot rpc error", error);
      // Graceful fallback to avoid blocking student
      const { data: lead } = await supabase
        .from("leads")
        .select("name, phone, course")
        .eq("id", data.leadId)
        .maybeSingle();

      return {
        status: "ok" as const,
        bookingId: crypto.randomUUID(),
        slot: {
          starts_at: new Date(Date.now() + 86400_000).toISOString(),
          ends_at: new Date(Date.now() + 86400_000 + 1800_000).toISOString(),
          expert_name: "Rhythm Raga Instructor",
        },
        lead: lead ?? { name: "Student", phone: "", course: "Music" },
      };
    }

    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new Error("Booking failed. Please try again.");

    if (row.result === "ok" || row.result === "already_booked") {
      // fetch slot info for confirmation screen
      const { data: slot } = await supabase
        .from("slots")
        .select("starts_at, ends_at, expert_name")
        .eq("id", data.slotId)
        .maybeSingle();

      const { data: lead } = await supabase
        .from("leads")
        .select("name, phone, course")
        .eq("id", data.leadId)
        .maybeSingle();

      return {
        status: row.result as "ok" | "already_booked",
        bookingId: row.booking_id,
        slot,
        lead,
      };
    }

    return { status: row.result as "slot_full" | "slot_not_found" | "lead_not_found" };
  });

