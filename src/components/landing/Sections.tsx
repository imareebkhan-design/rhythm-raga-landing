import {
  GraduationCap, Hand, Users, Clock3, Mic2, Baby, Leaf, Palette, Heart,
  Sparkles, Smile, Brain, Music4, UsersRound, Drama, Activity, Star, Trophy,
} from "lucide-react";

/* ---------- Pain Points ---------- */

const pains = [
  {
    pain: "\u201CI've always wanted to learn, but never started.\u201D",
    fix: "That's exactly why the first class is free. No commitment, no pressure — just walk in and try.",
  },
  {
    pain: "\u201CMy child starts hobbies, then loses interest.\u201D",
    fix: "Our mentors make every class hands-on and fun, with mini-performances that keep kids excited to come back.",
  },
  {
    pain: "\u201CI don't have enough time.\u201D",
    fix: "Morning, evening, and weekend batches — pick timings that fit around school, college, or office.",
  },
  {
    pain: "\u201CI've never touched an instrument before.\u201D",
    fix: "Perfect. Beginners are our specialty. We provide the instruments and start from absolute zero.",
  },
  {
    pain: "\u201CI'm too old to start now.\u201D",
    fix: "Our adult learners say the same thing — until week three. Creativity has no age limit, and neither do our batches.",
  },
];

export function PainPoints() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Sound Familiar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Every excuse that's kept you from starting — handled.
          </p>
        </div>
        <div className="mt-10 space-y-4">
          {pains.map((p) => (
            <div key={p.pain} className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <p className="font-display text-base font-extrabold text-foreground sm:text-lg">{p.pain}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <span className="font-bold text-primary">→ </span>{p.fix}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Benefits ---------- */

const benefits = [
  { icon: Star, label: "Build confidence" },
  { icon: Leaf, label: "Reduce stress" },
  { icon: Sparkles, label: "Boost creativity" },
  { icon: Brain, label: "Improve focus" },
  { icon: Music4, label: "Learn practical skills" },
  { icon: UsersRound, label: "Make new friends" },
  { icon: Drama, label: "Express yourself" },
  { icon: Activity, label: "Stay active" },
  { icon: Mic2, label: "Perform confidently" },
  { icon: Smile, label: "Enjoy a healthy hobby" },
];

export function Benefits() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            More Than Skills. A Transformation.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            What students walk away with after a few months at Rhythm Raga.
          </p>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {benefits.map((b) => (
            <li
              key={b.label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold shadow-soft transition-transform hover:-translate-y-0.5 hover:border-primary/40"
            >
              <b.icon className="h-4 w-4 text-primary" aria-hidden />
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Why Rhythm Raga ---------- */

const reasons = [
  { icon: GraduationCap, title: "Professional Mentors", desc: "Learn from performers and trained educators who love teaching." },
  { icon: Hand, title: "Practical Learning", desc: "You play, sing, dance, and create from your very first class." },
  { icon: Users, title: "Small Batches", desc: "Personal attention in every session — never lost in a crowd." },
  { icon: Clock3, title: "Flexible Timings", desc: "Morning, evening, and weekend batches for every schedule." },
  { icon: Mic2, title: "Performance Opportunities", desc: "Showcases and recitals that build real stage confidence." },
  { icon: Baby, title: "Kids & Adults Welcome", desc: "Age-appropriate batches from 5 years to 65+." },
  { icon: Leaf, title: "Beginner Friendly", desc: "Zero experience needed. We start from the absolute basics." },
  { icon: Palette, title: "Creative Environment", desc: "A bright, inspiring space designed for artists — not a tuition center." },
  { icon: Heart, title: "Personal Attention", desc: "Progress tracking and personalized feedback for every student." },
];

export function WhyUs() {
  return (
    <section id="why" className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold tracking-wide text-accent-foreground uppercase">
            Why Rhythm Raga
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            An Academy Built Around You
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10">
                <r.icon className="h-6 w-6 text-primary" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Who Can Join ---------- */

const joiners = [
  "Kids", "Teenagers", "College Students", "Working Professionals",
  "Adults", "Beginners", "Hobby Learners", "Future Performers",
];

export function WhoCanJoin() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          Who Can Join? <span className="text-primary">Everyone.</span>
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {joiners.map((j) => (
            <span
              key={j}
              className="rounded-full bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary"
            >
              {j}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How It Works ---------- */

const steps = [
  { n: "1", title: "Book Your Free Trial", desc: "Fill the 30-second form or WhatsApp us. Pick your course and preferred timing." },
  { n: "2", title: "Visit Rhythm Raga", desc: "Meet your mentor at our GTB Nagar academy and experience a full class — free." },
  { n: "3", title: "Start Your Creative Journey", desc: "Love it? Claim your launch offer and lock in founding-student benefits." },
];

export function HowItWorks() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            From Curious to Creating in 3 Steps
          </h2>
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
          <a
            href="#book"
            className="gradient-cta-btn inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03]"
          >
            <Trophy className="h-5 w-5" aria-hidden />
            Start Step 1 — Book Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}
