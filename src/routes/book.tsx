import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/booking.functions";
import { COURSE_OPTIONS, leadSchema } from "@/lib/booking-schemas";
import { BookingShell } from "@/components/booking/BookingShell";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Your Free Consultation — Rhythm Raga" },
      {
        name: "description",
        content:
          "Book a free 1-on-1 consultation with a Rhythm Raga expert. Available across GTB Nagar, Delhi. Limited slots this week.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookRouteComponent,
  errorComponent: ({ error, reset }) => (
    <BookingShell step={1} title="Something went wrong">
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
      >
        Try again
      </button>
    </BookingShell>
  ),
  notFoundComponent: () => <BookingShell step={1} title="Page not found">Nothing here.</BookingShell>,
});

function BookRouteComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/book") {
    return <Outlet />;
  }

  return <BookLead />;
}

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "gclid",
    "fbclid",
  ]) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return out;
}

function BookLead() {
  const navigate = useNavigate();
  const submit = useServerFn(submitLead);
  const [loading, setLoading] = useState(false);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => setUtm(readUtm()), []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      whatsapp_ok: fd.get("whatsapp_ok") === "on",
      age: fd.get("age") ? Number(fd.get("age")) : null,
      course: fd.get("course"),
      pincode: fd.get("pincode"),
      ...utm,
    };
    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setLoading(true);
    try {
      const res = await submit({ data: parsed.data });
      // Meta/Google pixel hooks (no-op if unset)
      if (typeof window !== "undefined") {
        (window as any).fbq?.("track", "Lead");
        (window as any).gtag?.("event", "generate_lead");
      }
      sessionStorage.setItem(
        "rr_lead",
        JSON.stringify({
          leadId: res.leadId,
          name: parsed.data.name,
          course: parsed.data.course,
          inServiceArea: res.inServiceArea,
        }),
      );
      navigate({ to: "/book/slot" });
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <BookingShell
      step={1}
      title="Book Your Free Consultation"
      subtitle="A 30-minute session with a Rhythm Raga expert. We'll understand your goals and design a learning path. No fees, no obligation."
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <ul className="mb-6 grid gap-2 text-sm sm:text-base sm:grid-cols-2">
          {["100% free — no card required", "30 minutes with a senior instructor", "In-person or over a call", "Limited slots this week"].map(
            (t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                {t}
              </li>
            ),
          )}
        </ul>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full Name" name="name" placeholder="Your full name" required autoComplete="name" maxLength={100} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="98XXXXXXXX"
              maxLength={15}
              pattern="[0-9+\s()-]{8,15}"
            />
            <Field label="Age (of the learner)" name="age" type="number" min={3} max={99} placeholder="e.g. 12" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold" htmlFor="course">
                Course you're interested in
              </label>
              <select
                id="course"
                name="course"
                required
                defaultValue="Not sure yet"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Pincode"
              name="pincode"
              required
              inputMode="numeric"
              placeholder="110009"
              pattern="\d{6}"
              maxLength={6}
              hint="So we can confirm we cover your area (~5 km)"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="whatsapp_ok"
              defaultChecked
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            />
            Send me updates on WhatsApp
          </label>

          <button
            type="submit"
            disabled={loading}
            className="gradient-cta-btn w-full rounded-full px-6 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.01] disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </span>
            ) : (
              "Continue to pick a slot →"
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to be contacted about your consultation.
          </p>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already booked?{" "}
        <Link to="/" className="font-semibold text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </BookingShell>
  );
}

function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.name} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      <input
        id={props.name}
        {...props}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
