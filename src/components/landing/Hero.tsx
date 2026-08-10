import { Phone, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CALL_LINK } from "./constants";
import { LeadForm } from "./LeadForm";
import { track, scrollToLeadForm } from "@/lib/analytics";

const WORDS = ["Guitar", "Piano", "Drums", "Vocals"];
const CYCLE_MS = 2600;

const TRUST = ["100+ Students", "Expert Mentors", "Offline Classes", "GTB Nagar"];

export function Hero() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setIndex((i) => (i + 1) % WORDS.length), CYCLE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index]);

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36 md:pb-24"
      aria-label="Rhythm Raga hero"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem]"
        style={{
          background:
            "radial-gradient(900px 480px at 50% 0%, var(--color-lavender-strong) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* Left — message */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
            Now Open in GTB Nagar, Delhi
          </span>

          <h1 className="mt-6 font-editorial text-[2.5rem] leading-[1.05] tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl">
            Learn Music. Build Confidence.
            <br className="hidden sm:block" /> Find Your Sound in{" "}
            <span key={WORDS[index]} className="animate-paper-swap inline-block text-gradient-gold">
              {WORDS[index]}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Offline music classes in GTB Nagar for beginners, kids and adults — learn Guitar,
            Piano, Drums &amp; Vocals from experienced mentors in a real academy environment.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <button
              type="button"
              onClick={() => {
                track("hero_cta_click", { context: "hero_primary" });
                scrollToLeadForm();
              }}
              className="gradient-cta-btn inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Book Your Free Trial
            </button>
            <a
              href={CALL_LINK}
              onClick={() => track("call_click", { context: "hero" })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-base font-semibold text-ink transition-colors hover:bg-accent sm:w-auto"
            >
              <Phone className="h-5 w-5 text-primary" aria-hidden />
              Call Now
            </a>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No experience required • Beginner-friendly • Offline classes
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:justify-start">
            {TRUST.map((t, i) => (
              <span key={t} className="inline-flex items-center gap-3">
                {i > 0 && <span aria-hidden className="hidden h-3 w-px bg-border sm:inline-block" />}
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — lead form (stacks below on mobile) */}
        <div id="lead-form" className="scroll-mt-28">
          <LeadForm variant="hero" />
        </div>
      </div>
    </section>
  );
}
