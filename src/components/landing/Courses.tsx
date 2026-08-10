import { Guitar, Piano, Drum, Mic2, Music2, Palette, type LucideIcon } from "lucide-react";
import { track, scrollToLeadForm } from "@/lib/analytics";

type Course = { Icon: LucideIcon; name: string; desc: string };

const primary: Course[] = [
  { Icon: Guitar, name: "Guitar", desc: "Learn chords, rhythm, songs and technique with structured offline guidance." },
  { Icon: Piano, name: "Piano", desc: "Build your foundation in notes, chords, rhythm and playing technique." },
  { Icon: Drum, name: "Drums", desc: "Develop rhythm, coordination and confidence through hands-on practice." },
  { Icon: Mic2, name: "Vocals", desc: "Build pitch, rhythm, breath control and vocal confidence." },
];

const secondary: Course[] = [
  { Icon: Music2, name: "Zumba", desc: "Dance-based fitness that lifts your mood while it works your body." },
  { Icon: Palette, name: "Creative Art", desc: "Sketching, painting and imagination — express what words can't." },
];

export function Courses() {
  const book = (name: string) => {
    track("course_cta_click", { selected_instrument: name });
    scrollToLeadForm();
  };

  return (
    <section id="courses" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold tracking-wide text-accent-foreground uppercase">
            Our Courses
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Choose What You Want To Learn
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Start with the skill you&rsquo;ve always wanted to learn. No prior experience required.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {primary.map(({ Icon, name, desc }) => (
            <article
              key={name}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                <Icon className="h-7 w-7 text-primary" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl font-extrabold">{name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <button
                type="button"
                onClick={() => book(name)}
                className="gradient-cta-btn mt-5 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03]"
              >
                Book Free Trial
              </button>
            </article>
          ))}
        </div>

        {/* Secondary offerings — present but not competing with the music-class journey */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {secondary.map(({ Icon, name, desc }) => (
            <div
              key={name}
              className="flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-extrabold">
                  {name} <span className="ml-1 text-xs font-bold text-muted-foreground uppercase">Also available</span>
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => book(name)}
                className="shrink-0 text-sm font-bold text-primary transition-colors hover:text-primary-glow"
              >
                Enquire
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
