import {
  GraduationCap, MapPin, Sparkles, Users, Music4, CheckCircle2,
  Baby, UsersRound, Star, Trophy,
} from "lucide-react";
import { track, scrollToLeadForm } from "@/lib/analytics";

function PrimaryCta({ label = "Book My Free Trial", context }: { label?: string; context: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        track("hero_cta_click", { context });
        scrollToLeadForm();
      }}
      className="gradient-cta-btn inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03]"
    >
      {label}
    </button>
  );
}

/* ---------- Trust / Social proof (moved near the top) ---------- */

const trustItems = [
  { icon: Users, label: "100+ Students" },
  { icon: GraduationCap, label: "Expert Mentors" },
  { icon: MapPin, label: "Offline Academy" },
  { icon: Sparkles, label: "Beginner-Friendly" },
  { icon: Music4, label: "6 Disciplines" },
];

export function Trust() {
  return (
    <section id="why" className="scroll-mt-24 border-y border-border bg-muted/40 py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-2xl font-extrabold sm:text-3xl">
          Why Students Choose Us
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-10">
          {trustItems.map((t) => (
            <li key={t.label} className="inline-flex items-center gap-2.5 text-sm font-bold sm:text-base">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                <t.icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              {t.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Benefits — outcome-driven ---------- */

const benefits = [
  "Learn with a clear, structured approach",
  "Guidance from experienced mentors",
  "Practice in a real academy environment",
  "Build confidence while you learn",
  "Go at your own pace as a beginner",
  "Develop consistency and discipline",
  "Turn interest into an actual skill",
  "Build a foundation you can keep growing",
];

export function Benefits() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            More Than Just Music Classes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            What you actually walk away with after a few months at Rhythm Raga.
          </p>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm sm:text-base">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="text-foreground">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Who it's for (compact) ---------- */

const audiences = [
  { icon: Sparkles, label: "Complete Beginners" },
  { icon: Baby, label: "Kids" },
  { icon: Users, label: "Teenagers" },
  { icon: UsersRound, label: "Adults" },
  { icon: Star, label: "Hobby Learners" },
  { icon: Trophy, label: "Aspiring Performers" },
];

export function WhoItsFor() {
  return (
    <section className="bg-muted py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          You Don&rsquo;t Need To Be &ldquo;Musical&rdquo; To Start.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
          Whether you&rsquo;re picking up an instrument for the first time or finally getting
          serious about a skill you&rsquo;ve always wanted, you can start here.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {audiences.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-bold shadow-soft"
            >
              <a.icon className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
              {a.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Objection handling ---------- */

const objections = [
  {
    q: "“I’ve never played before.”",
    a: "That’s exactly where beginners should start. Our classes build your foundation step by step.",
  },
  {
    q: "“I’m not naturally musical.”",
    a: "You don’t need to be. Rhythm, technique and confidence are developed through practice and guidance.",
  },
  {
    q: "“I don’t know which class is right for me.”",
    a: "Tell us what you’re interested in and we’ll help you figure out the best starting point.",
  },
  {
    q: "“I’m worried I’ll lose interest.”",
    a: "Start with a free trial and experience the class before making any commitment.",
  },
  {
    q: "“I have a busy schedule.”",
    a: "Speak to our team about the available class options and find a schedule that works for you.",
  },
];

export function Objections() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Thinking You&rsquo;re Not Ready Yet?
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {objections.map((o) => (
            <div key={o.q} className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <p className="font-display text-base font-extrabold text-foreground sm:text-lg">{o.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <span className="font-bold text-primary">→ </span>{o.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

const steps = [
  { n: "1", title: "Tell Us What You Want To Learn", desc: "Submit the short form — it takes less than a minute." },
  { n: "2", title: "Visit The Academy", desc: "Speak with the team and experience the environment." },
  { n: "3", title: "Start Learning", desc: "Choose the right class and begin your free trial." },
];

export function HowItWorks() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Starting Is Easy</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary font-display text-lg font-extrabold text-primary-foreground">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute top-1/2 -right-4 hidden -translate-y-1/2 text-2xl text-primary md:block">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <PrimaryCta context="how_it_works" />
        </div>
      </div>
    </section>
  );
}
