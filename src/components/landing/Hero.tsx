import { Phone, ArrowRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import galleryGuitar from "@/assets/gallery-guitar.jpg";
import galleryPiano from "@/assets/gallery-piano.jpg";
import galleryDrums from "@/assets/gallery-drums.jpg";
import galleryVocal from "@/assets/gallery-vocal.jpg";
import galleryZumba from "@/assets/gallery-zumba.jpg";
import galleryArt from "@/assets/gallery-art.jpg";
import { CALL_LINK } from "./constants";

type Discipline = {
  key: string;
  eyebrow: string;
  headline: string;
  accent: string;
  image: string;
  tint: string; // background color for the hero-showreel
};

const DISCIPLINES: Discipline[] = [
  {
    key: "guitar",
    eyebrow: "Six Strings · Endless Songs",
    headline: "Learn Guitar with Mentors Who Play.",
    accent: "Guitar",
    image: galleryGuitar,
    tint: "oklch(0.32 0.18 279)",
  },
  {
    key: "piano",
    eyebrow: "Eighty-Eight Keys · One Voice",
    headline: "Play Piano the Way You Always Imagined.",
    accent: "Piano",
    image: galleryPiano,
    tint: "oklch(0.30 0.14 300)",
  },
  {
    key: "vocal",
    eyebrow: "Breath · Pitch · Presence",
    headline: "Find the Voice You Were Born With.",
    accent: "Vocals",
    image: galleryVocal,
    tint: "oklch(0.34 0.16 25)",
  },
  {
    key: "drums",
    eyebrow: "Groove · Rhythm · Release",
    headline: "Feel the Beat. Own the Room.",
    accent: "Drums",
    image: galleryDrums,
    tint: "oklch(0.28 0.10 255)",
  },
  {
    key: "zumba",
    eyebrow: "Dance · Fitness · Joy",
    headline: "Move Like Nobody's Watching.",
    accent: "Zumba",
    image: galleryZumba,
    tint: "oklch(0.36 0.18 340)",
  },
  {
    key: "art",
    eyebrow: "Pencil · Colour · Imagination",
    headline: "Paint What Words Can't Say.",
    accent: "Creative Art",
    image: galleryArt,
    tint: "oklch(0.34 0.14 60)",
  },
];

const CYCLE_MS = 4800;

export function Hero() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = DISCIPLINES[index];

  // Auto-advance loop
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % DISCIPLINES.length);
    }, CYCLE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index]);

  const jumpTo = (i: number) => {
    setProgress(0);
    setIndex(i);
  };

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") jumpTo((index + 1) % DISCIPLINES.length);
      if (e.key === "ArrowLeft") jumpTo((index - 1 + DISCIPLINES.length) % DISCIPLINES.length);
      if (e.key === " " && (e.target as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  const tintStyle = useMemo(
    () => ({ ["--hero-tint" as string]: active.tint }) as React.CSSProperties,
    [active.tint]
  );

  return (
    <section
      id="top"
      style={tintStyle}
      className="hero-showreel relative overflow-hidden pt-28 pb-20 text-primary-foreground md:pt-36 md:pb-28"
      aria-roledescription="carousel"
      aria-label="Rhythm Raga disciplines showreel"
    >
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-52 -left-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />

      {/* Hand-drawn scribble ribbon */}
      <svg
        aria-hidden
        viewBox="0 0 1400 500"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[60%] w-full opacity-40"
      >
        <path
          d="M -50 250 C 200 120, 380 380, 620 240 S 1000 100, 1200 300 S 1500 220, 1500 220"
          fill="none"
          stroke="oklch(0.85 0.15 90)"
          strokeWidth="3"
          strokeLinecap="round"
          className="scribble-draw"
        />
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[7fr_5fr] lg:gap-14">
        {/* Left — editorial headline */}
        <div className="text-center lg:text-left">
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
            <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden />
            Now Open in GTB Nagar, Delhi
          </span>

          <div key={active.key} className="animate-paper-swap mt-6" aria-live="polite">
            <p className="font-editorial text-lg italic text-gold sm:text-xl">
              {active.eyebrow}
            </p>
            <h1 className="font-editorial mt-2 text-[2.75rem] leading-[1.02] font-normal sm:text-6xl lg:text-[5.25rem]">
              {active.headline}
            </h1>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg lg:mx-0">
            Guitar, Piano, Drums, Vocals, Zumba & Creative Art — six disciplines,
            one creative home. Book a free trial and meet your mentor this week.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <a
              href="#book"
              className="gradient-cta-btn group inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Book Your Seat Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            <a
              href={CALL_LINK}
              className="glass-card inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold transition-colors hover:bg-white/20 sm:w-auto"
            >
              <Phone className="h-5 w-5" aria-hidden />
              Call Now
            </a>
          </div>

          {/* Discipline pips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {DISCIPLINES.map((d, i) => (
              <button
                key={d.key}
                onClick={() => jumpTo(i)}
                aria-label={`Show ${d.accent}`}
                aria-current={i === index}
                className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase transition-all ${
                  i === index
                    ? "border-gold bg-gold text-gold-foreground"
                    : "border-white/25 text-primary-foreground/70 hover:border-white/60 hover:text-primary-foreground"
                }`}
              >
                {d.accent}
              </button>
            ))}
          </div>
        </div>

        {/* Right — cutout collage */}
        <div className="relative mx-auto h-[26rem] w-full max-w-lg sm:h-[32rem] lg:h-[36rem] lg:max-w-none">
          {DISCIPLINES.map((d, i) => {
            const offset = i - index;
            const isActive = i === index;
            const rot = [-6, 4, -3, 6, -4, 3][i] ?? 0;
            const baseX = [0, 42, 82, 118, 150, 178][i] ?? 0;
            const baseY = [10, 60, 10, 70, 20, 90][i] ?? 0;
            return (
              <figure
                key={d.key}
                aria-hidden={!isActive}
                className="animate-portrait-in absolute overflow-hidden rounded-[2rem] shadow-card ring-1 ring-white/25 transition-all duration-700 ease-out"
                style={
                  {
                    ["--rr-rot" as string]: `${rot}deg`,
                    left: `${baseX}px`,
                    top: `${baseY}px`,
                    width: isActive ? "18rem" : "9.5rem",
                    height: isActive ? "24rem" : "13rem",
                    transform: `rotate(${rot}deg) translateY(${offset === 0 ? 0 : offset * 4}px)`,
                    zIndex: isActive ? 10 : 5 - Math.abs(offset),
                    opacity: Math.abs(offset) > 2 ? 0.55 : 1,
                    animationDelay: `${i * 90}ms`,
                  } as React.CSSProperties
                }
              >
                <img
                  src={d.image}
                  alt={`${d.accent} student at Rhythm Raga`}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="h-full w-full object-cover"
                />
                {isActive && (
                  <figcaption className="glass-card animate-fade-up absolute right-3 bottom-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase">
                    {d.accent}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>

      {/* Showreel control bar */}
      <div className="relative mx-auto mt-14 flex max-w-6xl flex-col gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause showreel" : "Play showreel"}
            className="glass-card grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/20"
          >
            {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="glass-card grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/20"
          >
            {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
          </button>

          <div className="flex flex-1 items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-primary-foreground/70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="absolute inset-y-0 left-0 bg-gold"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-primary-foreground/70">
              {String(DISCIPLINES.length).padStart(2, "0")}
            </span>
          </div>

          <a
            href="#courses"
            className="hidden items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-primary-foreground/80 hover:text-primary-foreground sm:inline-flex"
          >
            Scroll <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
