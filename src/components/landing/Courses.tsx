import { Guitar, Piano, Drum, Mic2, Music2, Palette, type LucideIcon } from "lucide-react";

type Course = {
  Icon: LucideIcon;
  name: string;
  desc: string;
  who: string;
};

const courses: Course[] = [
  {
    Icon: Guitar,
    name: "Guitar",
    desc: "Strum your first song within weeks. Acoustic and electric, from chords to solos.",
    who: "Kids 7+, teens & adults",
  },
  {
    Icon: Piano,
    name: "Piano / Keyboard",
    desc: "Build a rock-solid foundation in melody, harmony, and technique.",
    who: "Kids 5+, teens & adults",
  },
  {
    Icon: Drum,
    name: "Drums",
    desc: "Groove, rhythm, and coordination — the most energetic way to learn music.",
    who: "Kids 6+, teens & adults",
  },
  {
    Icon: Mic2,
    name: "Vocal Singing",
    desc: "Find your voice — breathing, pitch, range, and stage confidence.",
    who: "All ages, all genres",
  },
  {
    Icon: Music2,
    name: "Zumba",
    desc: "Dance-based fitness that lifts your mood while it works your body.",
    who: "Teens, adults & seniors",
  },
  {
    Icon: Palette,
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
            Six Disciplines. One Creative Home.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Every course is practical, mentor-led, and designed so you're
            creating — not just studying — from day one.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(({ Icon, name, desc, who }) => (
            <article
              key={name}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                  <Icon className="h-7 w-7 text-primary" aria-hidden />
                </span>
                <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
                  Beginner Friendly
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-extrabold">{name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <p className="mt-3 text-xs font-bold tracking-wide text-primary uppercase">
                For: {who}
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
