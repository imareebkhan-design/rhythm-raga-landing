import { useState } from "react";
import { CheckCircle2, ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FAQS, WHATSAPP_LINK } from "./constants";

/* ---------- FAQ ---------- */

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Questions? Answered.
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-sm font-extrabold sm:text-base"
              >
                {f.q}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-primary transition-transform ${open === i ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {open === i && (
                <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Still have questions?{" "}
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
            WhatsApp us
          </a>{" "}
          — we reply fast.
        </p>
      </div>
    </section>
  );
}

/* ---------- Final CTA — links to full /book funnel ---------- */

export function LeadForm() {
  return (
    <section id="book" className="gradient-hero relative overflow-hidden py-16 text-ink md:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Your Creative Journey <span className="text-gradient-gold">Starts Today.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
            Book a free 30-minute consultation with a Rhythm Raga expert. We'll understand
            your goals and design a learning path — no fees, no obligation.
          </p>
          <ul className="mt-6 space-y-2.5 text-left text-sm sm:text-base">
            {[
              "100% free consultation with a senior instructor",
              "Personalised learning path in 30 minutes",
              "Limited slots this week — first come, first served",
            ].map((t) => (
              <li key={t} className="flex items-center justify-center gap-2.5 lg:justify-start">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h3 className="font-display text-xl font-extrabold">Book Your Free Consultation</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Takes less than a minute. Enter your details and pick a slot that works for you.
          </p>
          <ol className="my-6 space-y-3 text-sm">
            {[
              { n: 1, t: "Share your details", d: "Name, phone, course you're curious about" },
              { n: 2, t: "Pick a slot", d: "From open times over the next 7 days" },
              { n: 3, t: "Meet your expert", d: "30-minute call to design your journey" },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {s.n}
                </span>
                <div>
                  <div className="font-bold text-ink">{s.t}</div>
                  <div className="text-muted-foreground">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
          <Link
            to="/book"
            className="gradient-cta-btn group flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.02]"
          >
            Start booking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Serving GTB Nagar, Delhi within a ~5 km radius.
          </p>
        </div>
      </div>
    </section>
  );
}
