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
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit pincode"),
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
