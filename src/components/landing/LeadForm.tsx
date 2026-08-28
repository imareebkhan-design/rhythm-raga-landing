import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Phone, MessageCircle } from "lucide-react";
import { submitLead } from "@/lib/booking.functions";
import { INSTRUMENT_OPTIONS, leadSchema } from "@/lib/booking-schemas";
import { CALL_LINK, WHATSAPP_LINK } from "./constants";
import { track, readUtm } from "@/lib/analytics";

type Errors = Partial<Record<"name" | "phone" | "instrument", string>>;

/** Indian mobile: 10 digits starting 6-9, tolerant of +91 / spaces / dashes. */
function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export function LeadForm({
  variant = "hero",
  className = "",
}: {
  variant?: "hero" | "final";
  className?: string;
}) {
  const submit = useServerFn(submitLead);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [started, setStarted] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const utmRef = useRef<Record<string, string>>({});
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    utmRef.current = readUtm();
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const req = p.get("course") || p.get("instrument");
      if (req) {
        const found = INSTRUMENT_OPTIONS.find(
          (opt) => opt.course.toLowerCase() === req.toLowerCase().trim() || opt.label.toLowerCase() === req.toLowerCase().trim()
        );
        if (found) setSelectedInstrument(found.label);
      }
    }
  }, []);

  // Fire form_view once the form scrolls into view.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track("form_view", { form: variant });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [variant]);

  const onFirstInteraction = () => {
    if (started) return;
    setStarted(true);
    track("form_start", { form: variant });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phoneRaw = String(fd.get("phone") ?? "").trim();
    const instrumentLabel = String(fd.get("instrument") ?? "");

    const nextErrors: Errors = {};
    if (name.length < 2) nextErrors.name = "Please enter your name";
    const phone = normalizeIndianPhone(phoneRaw);
    if (!phone) nextErrors.phone = "Enter a valid 10-digit mobile number";
    const match = INSTRUMENT_OPTIONS.find((i) => i.label === instrumentLabel);
    if (!match) nextErrors.instrument = "Pick what you want to learn";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const parsed = leadSchema.safeParse({
      name,
      phone: phone!,
      whatsapp_ok: true,
      course: match!.course,
      ...utmRef.current,
    });
    if (!parsed.success) {
      setErrors({ phone: parsed.error.issues[0]?.message ?? "Please check the form" });
      return;
    }

    track("form_submit", { form: variant, selected_instrument: instrumentLabel });
    setLoading(true);
    try {
      await submit({ data: parsed.data });
      track("form_success", { form: variant, selected_instrument: instrumentLabel });
      setDone(true);
    } catch (err) {
      setErrors({ phone: (err as Error).message || "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        ref={sectionRef}
        className={`glass-card rounded-3xl p-6 text-center sm:p-8 ${className}`}
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-2xl font-extrabold text-ink">You&rsquo;re in! 🎉</h3>
        <p className="mt-2 text-muted-foreground">
          We&rsquo;ve received your enquiry. Our team will call you shortly to help you pick the
          right class and book your free trial.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { form: variant, context: "success" })}
            className="gradient-cta-btn flex-1 rounded-full px-5 py-3 text-center text-sm font-bold text-cta-foreground shadow-cta"
          >
            <MessageCircle className="mr-2 inline h-4 w-4" aria-hidden />
            Message us on WhatsApp
          </a>
          <a
            href={CALL_LINK}
            onClick={() => track("call_click", { form: variant, context: "success" })}
            className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-center text-sm font-bold text-ink hover:border-primary"
          >
            <Phone className="mr-2 inline h-4 w-4 text-primary" aria-hidden />
            Call the academy
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={`glass-card rounded-3xl p-6 sm:p-8 ${className}`}>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
        <span>📍</span> In-Studio Offline Classes • GTB Nagar, Delhi
      </div>
      <h3 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
        Book In-Person Trial Class
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Visit our music studio near GTB Nagar Metro Gate 4. Tell us what you want to learn:
      </p>

      <form onSubmit={onSubmit} onChange={onFirstInteraction} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor={`name-${variant}`} className="mb-1.5 block text-sm font-bold text-ink">
            Your Name
          </label>
          <input
            id={`name-${variant}`}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={100}
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none aria-[invalid=true]:border-destructive"
          />
          {errors.name && <p className="mt-1 text-xs font-semibold text-destructive">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor={`phone-${variant}`} className="mb-1.5 block text-sm font-bold text-ink">
            Phone Number
          </label>
          <input
            id={`phone-${variant}`}
            name="phone"
            type="tel"
            inputMode="numeric"
            required
            autoComplete="tel"
            maxLength={15}
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.phone}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none aria-[invalid=true]:border-destructive"
          />
          {errors.phone && (
            <p className="mt-1 text-xs font-semibold text-destructive">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor={`instrument-${variant}`} className="mb-1.5 block text-sm font-bold text-ink">
            What do you want to learn?
          </label>
          <select
            id={`instrument-${variant}`}
            name="instrument"
            required
            value={selectedInstrument}
            onChange={(e) => {
              setSelectedInstrument(e.target.value);
              setErrors((prev) => ({ ...prev, instrument: undefined }));
            }}
            aria-invalid={!!errors.instrument}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none aria-[invalid=true]:border-destructive"
          >
            <option value="" disabled>
              Select an instrument
            </option>
            {INSTRUMENT_OPTIONS.map((i) => (
              <option key={i.label} value={i.label}>
                {i.label}
              </option>
            ))}
          </select>
          {errors.instrument && (
            <p className="mt-1 text-xs font-semibold text-destructive">{errors.instrument}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-cta-btn w-full rounded-full px-6 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.01] disabled:opacity-70"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </span>
          ) : (
            "Book My Free Trial"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          No experience required. We&rsquo;ll help you take the first step.
        </p>
      </form>
    </div>
  );
}
