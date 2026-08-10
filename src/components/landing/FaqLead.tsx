import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { FAQS, WHATSAPP_LINK } from "./constants";
import { LeadForm } from "./LeadForm";
import { track, scrollToLeadForm } from "@/lib/analytics";

/* ---------- FAQ ---------- */

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Questions? Answered.</h2>
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

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              track("hero_cta_click", { context: "faq" });
              scrollToLeadForm();
            }}
            className="gradient-cta-btn inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03]"
          >
            Still Have Questions? Book A Free Trial
          </button>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_click", { context: "faq" })}
            className="text-sm font-bold text-primary hover:underline"
          >
            or WhatsApp us — we reply fast
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final conversion section — inline lead form ---------- */

export function LeadFormSection() {
  return (
    <section id="book" className="gradient-hero relative overflow-hidden py-16 text-ink md:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Ready To Start <span className="text-gradient-gold">Learning?</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
            Tell us what you want to learn. We&rsquo;ll help you find the right class and get
            started with a free trial.
          </p>
          <ul className="mt-6 space-y-2.5 text-left text-sm sm:text-base">
            {[
              "Free trial — no fees, no obligation",
              "Beginner-friendly, offline classes in GTB Nagar",
              "Our team calls you to help you get started",
            ].map((t) => (
              <li key={t} className="flex items-center justify-center gap-2.5 lg:justify-start">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <LeadForm variant="final" />
      </div>
    </section>
  );
}
