import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { leadSchema, bookSlotSchema, type LeadInput } from "./booking-schemas";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Submit a lead. Returns { leadId, inServiceArea }. */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    // check serviceability
    const { data: pin } = await supabase
      .from("serviceable_pincodes")
      .select("pincode")
      .eq("pincode", data.pincode)
      .eq("is_active", true)
      .maybeSingle();

    const inServiceArea = !!pin;

    const insertRow: Database["public"]["Tables"]["leads"]["Insert"] = {
      name: data.name,
      phone: data.phone,
      whatsapp_ok: data.whatsapp_ok,
      age: data.age ?? null,
      course: data.course,
      pincode: data.pincode,
      in_service_area: inServiceArea,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_content: data.utm_content ?? null,
      gclid: data.gclid ?? null,
      fbclid: data.fbclid ?? null,
    };

    const { data: lead, error } = await supabase
      .from("leads")
      .insert(insertRow)
      .select("id")
      .single();

    if (error || !lead) {
      console.error("submitLead insert error", error);
      throw new Error("Could not save your details. Please try again.");
    }

    return { leadId: lead.id, inServiceArea };
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
