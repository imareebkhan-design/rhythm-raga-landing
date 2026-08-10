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

    // check serviceability — only when a pincode was collected.
    // The paid landing-page form (Name/Phone/Instrument) omits it, so we
    // treat those leads as "not gated" and skip the slot-picker branch.
    let inServiceArea = false;
    if (data.pincode) {
      const { data: pin } = await supabase
        .from("serviceable_pincodes")
        .select("pincode")
        .eq("pincode", data.pincode)
        .eq("is_active", true)
        .maybeSingle();
      inServiceArea = !!pin;
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

    return { leadId: leadId as string, inServiceArea };
  });

/** Fetch open slots for the next N days. Public. */
export const listAvailableSlots = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ days: z.number().int().min(1).max(30).default(7) }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: slots, error } = await supabase.rpc("available_slots", {
      _days: data.days,
    });
    if (error) {
      console.error("available_slots rpc error", error);
      throw new Error("Could not load slots. Please try again.");
    }
    return slots ?? [];
  });

/** Book a slot atomically. Returns booking + slot detail. */
export const bookSlot = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookSlotSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { data: rows, error } = await supabase.rpc("book_slot", {
      _lead_id: data.leadId,
      _slot_id: data.slotId,
    });

    if (error) {
      console.error("book_slot rpc error", error);
      throw new Error("Could not book that slot. Please try another.");
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
