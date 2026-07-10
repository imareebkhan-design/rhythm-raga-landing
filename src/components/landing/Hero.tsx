import { Phone, Star, Sparkles, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-academy.jpg";
import { CALL_LINK } from "./constants";

export function Hero() {
  return (
    <section id="top" className="gradient-hero relative overflow-hidden pt-28 pb-16 text-primary-foreground md:pt-36 md:pb-24">
      {/* decorative glows */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
            <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden />
            Now Open in GTB Nagar, Delhi
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
            Discover the Artist{" "}
            <span className="text-gradient-gold">You Were Born to Be.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg lg:mx-0">
            Learn Guitar, Piano, Drums, Singing, Zumba, and Creative Art from expert
            mentors at Rhythm Raga. Build confidence, creativity, and lifelong
            skills in a fun, practical learning environment.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <a
              href="#book"
              className="gradient-cta-btn inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03] sm:w-auto"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              Book Free Trial
            </a>
            <a
              href={CALL_LINK}
              className="glass-card inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold transition-colors hover:bg-white/20 sm:w-auto"
            >
              <Phone className="h-5 w-5" aria-hidden />
              Call Now
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/80 lg:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
              Trusted mentors
            </span>
            <span>6 creative courses</span>
            <span>Ages 5 to 65+</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="overflow-hidden rounded-3xl shadow-card ring-1 ring-white/20">
            <img
              src={heroImg}
              alt="Students of all ages learning guitar, piano and singing with mentors at Rhythm Raga creative academy"
              width={1600}
              height={1200}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="glass-card animate-float absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl px-4 py-3 sm:left-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 ring-1 ring-gold/40">
              <Sparkles className="h-5 w-5 text-gold" aria-hidden />
            </span>
            <div className="text-sm">
              <p className="font-bold">Grand Launch Offer</p>
              <p className="text-primary-foreground/80">20% off your first month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
