const courses = [
  {
    emoji: "🎸",
    name: "Guitar",
    desc: "Strum your first song within weeks. Acoustic & electric, chords to solos.",
    who: "Kids 7+, teens & adults",
  },
  {
    emoji: "🎹",
    name: "Piano / Keyboard",
    desc: "Build a rock-solid foundation in melody, harmony, and technique.",
    who: "Kids 5+, teens & adults",
  },
  {
    emoji: "🥁",
    name: "Drums",
    desc: "Groove, rhythm, and coordination — the most energetic way to learn music.",
    who: "Kids 6+, teens & adults",
  },
  {
    emoji: "🎤",
    name: "Vocal Singing",
    desc: "Find your voice — breathing, pitch, range, and stage confidence.",
    who: "All ages, all genres",
  },
  {
    emoji: "💃",
    name: "Zumba",
    desc: "Dance, sweat, and smile. Fitness that never feels like a workout.",
    who: "Teens, adults & seniors",
  },
  {
    emoji: "🎨",
    name: "Creative Art",
    desc: "Sketching, painting, and imagination — express what words can't.",
    who: "Kids 5+, teens & adults",
  },
];

export function Courses() {
  return (
    <section id="courses" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold tracking-wide text-accent-foreground uppercase">
            Our Courses
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Six Ways to Fall in Love with Creativity
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Every course is practical, mentor-led, and designed so you're
            creating — not just studying — from day one.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <article
              key={c.name}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-3xl transition-transform group-hover:scale-110" aria-hidden>
                  {c.emoji}
                </span>
                <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold-foreground">
                  Beginner Friendly
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-extrabold">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <p className="mt-3 text-xs font-bold tracking-wide text-primary uppercase">
                For: {c.who}
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <a
                  href="#book"
                  className="gradient-cta-btn inline-flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03]"
                >
                  Book Trial
                </a>
                <a
                  href="#faq"
                  className="text-sm font-bold text-primary transition-colors hover:text-primary-glow"
                >
                  Learn More
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
