import { z } from "zod";

export const COURSE_OPTIONS = [
  "Guitar",
  "Piano / Keyboard",
  "Drums",
  "Vocal Singing",
  "Zumba",
  "Creative Art",
  "Not sure yet",
] as const;

/**
 * Primary campaign instruments shown on the paid landing-page lead form.
 * Each maps to a valid `COURSE_OPTIONS` value so the existing Supabase
 * `submit_lead` backend receives a course it already understands.
 */
export const INSTRUMENT_OPTIONS = [
  { label: "Piano", course: "Piano / Keyboard" },
  { label: "Guitar", course: "Guitar" },
  { label: "Drums", course: "Drums" },
  { label: "Vocals", course: "Vocal Singing" },
] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Only digits and + - ( ) allowed"),
  whatsapp_ok: z.boolean().default(true),
  age: z.coerce.number().int().min(3).max(120).optional().nullable(),
  course: z.enum(COURSE_OPTIONS),
  // Optional: the multi-step /book funnel collects a 6-digit pincode for
  // serviceability gating, but the paid landing-page form (Name/Phone/
  // Instrument only) omits it. When present it must still be 6 digits.
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit pincode")
    .optional()
    .nullable(),
  utm_source: z.string().max(120).optional().nullable(),
  utm_medium: z.string().max(120).optional().nullable(),
  utm_campaign: z.string().max(120).optional().nullable(),
  utm_content: z.string().max(120).optional().nullable(),
  gclid: z.string().max(200).optional().nullable(),
  fbclid: z.string().max(200).optional().nullable(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const bookSlotSchema = z.object({
  leadId: z.string().uuid(),
  slotId: z.string().uuid(),
});
