import { Phone, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import galleryGuitar from "@/assets/gallery-guitar.jpg";
import galleryPiano from "@/assets/gallery-piano.jpg";
import galleryDrums from "@/assets/gallery-drums.jpg";
import galleryVocal from "@/assets/gallery-vocal.jpg";
import galleryZumba from "@/assets/gallery-zumba.jpg";
import galleryArt from "@/assets/gallery-art.jpg";
import { CALL_LINK } from "./constants";

type Discipline = { key: string; label: string; image: string };

const DISCIPLINES: Discipline[] = [
  { key: "guitar", label: "Guitar", image: galleryGuitar },
  { key: "piano", label: "Piano", image: galleryPiano },
  { key: "vocal", label: "Vocals", image: galleryVocal },
  { key: "drums", label: "Drums", image: galleryDrums },
  { key: "zumba", label: "Zumba", image: galleryZumba },
  { key: "art", label: "Creative Art", image: galleryArt },
];

const FLOAT_POSITIONS = [
  { className: "left-[3%] top-[18%] h-28 w-28 md:h-36 md:w-36 rounded-[2rem] rotate-[-8deg]", tint: "bg-primary/15" },
  { className: "right-[6%] top-[12%] h-28 w-28 md:h-40 md:w-40 rounded-full", tint: "bg-cta/20" },
  { className: "left-[8%] bottom-[10%] h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] rotate-[10deg]", tint: "bg-lavender-strong" },
  { className: "right-[4%] bottom-[8%] h-28 w-28 md:h-36 md:w-36 rounded-[2rem] rotate-[-6deg]", tint: "bg-primary/15" },
];

const CYCLE_MS = 3800;

export function Hero() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % DISCIPLINES.length);
    }, CYCLE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index]);

  const active = DISCIPLINES[index];

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-background pt-32 pb-20 md:pt-40 md:pb-28"
      aria-label="Rhythm Raga hero"
    >
      {/* Soft ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem]"
        style={{
          background:
            "radial-gradient(900px 480px at 50% 0%, var(--color-lavender-strong) 0%, transparent 70%)",
        }}
      />

      {/* Floating decorative cutouts (rendered around headline) */}
      {DISCIPLINES.slice(0, 4).map((d, i) => {
        const pos = FLOAT_POSITIONS[i];
        return (
          <figure
            key={d.key}
            aria-hidden
            style={{ ["--rr-rot" as string]: "0deg", animationDelay: `${i * 220}ms` }}
            className={`animate-float pointer-events-none absolute hidden overflow-hidden shadow-card ring-1 ring-border md:block ${pos.className}`}
          >
            <div className={`absolute inset-0 ${pos.tint}`} />
            <img
              src={d.image}
              alt=""
              loading="lazy"
              className="relative h-full w-full object-cover mix-blend-luminosity opacity-95"
            />
          </figure>
        );
      })}

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Location badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
          Now Open in GTB Nagar, Delhi
        </span>

        {/* Editorial headline */}
        <h1 className="mt-8 font-editorial text-[2.75rem] leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl md:text-[5.5rem] lg:text-[6.5rem]">
          Learn, Play &amp; Grow with{" "}
          <span
            key={active.key}
            className="animate-paper-swap inline-block text-gradient-gold"
          >
            {active.label}
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Six disciplines. One creative home. Guitar, Piano, Drums, Vocals,
          Zumba &amp; Creative Art — taught by mentors who love what they do.
          Book your free trial and meet your teacher this week.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#book"
            className="gradient-cta-btn group inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03] sm:w-auto"
          >
            Book Your Free Trial
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
          <a
            href={CALL_LINK}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-base font-semibold text-ink transition-colors hover:bg-accent sm:w-auto"
          >
            <Phone className="h-5 w-5 text-primary" aria-hidden />
            Call Now
          </a>
        </div>

        {/* Discipline chips */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {DISCIPLINES.map((d, i) => (
            <button
              key={d.key}
              onClick={() => setIndex(i)}
              aria-current={i === index}
              aria-label={`Feature ${d.label}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                i === index
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-ink"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            500+ Students
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span>Expert Mentors</span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span>Kids &amp; Adults</span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span>Small Batches</span>
        </div>
      </div>
    </section>
  );
}
