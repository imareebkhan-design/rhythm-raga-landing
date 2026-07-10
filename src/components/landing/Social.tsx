import { Star } from "lucide-react";
import galleryGuitar from "@/assets/gallery-guitar.jpg";
import galleryPiano from "@/assets/gallery-piano.jpg";
import galleryDrums from "@/assets/gallery-drums.jpg";
import galleryVocal from "@/assets/gallery-vocal.jpg";
import galleryZumba from "@/assets/gallery-zumba.jpg";
import galleryArt from "@/assets/gallery-art.jpg";

/* ---------- Gallery ---------- */
/* Placeholder imagery — replace with real academy photos when available. */

const gallery = [
  { src: galleryGuitar, label: "Guitar Classes", alt: "Student learning acoustic guitar in guitar class at Rhythm Raga" },
  { src: galleryPiano, label: "Piano Classes", alt: "Child learning piano with a mentor in piano class" },
  { src: galleryDrums, label: "Drum Classes", alt: "Teen playing a drum kit during drum class" },
  { src: galleryVocal, label: "Vocal Training", alt: "Student singing into a microphone during vocal training" },
  { src: galleryZumba, label: "Zumba", alt: "Energetic Zumba dance fitness class in a bright studio" },
  { src: galleryArt, label: "Creative Art", alt: "Kids painting colorful artwork in creative art class" },
];

export function Gallery() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold tracking-wide text-accent-foreground uppercase">
            Inside The Academy
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Where Creativity Comes Alive
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {gallery.map((g) => (
            <figure key={g.label} className="group relative overflow-hidden rounded-3xl shadow-soft">
              <img
                src={g.src}
                alt={g.alt}
                width={900}
                height={700}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 pt-10">
                <span className="font-display text-sm font-extrabold text-background sm:text-base">{g.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
/* Placeholder reviews — swap in real Google Reviews as they arrive. */

const testimonials = [
  {
    name: "Priya S.",
    role: "Parent of a 9-year-old guitarist",
    quote: "My daughter used to quit every hobby in a month. Six months at Rhythm Raga and she performed on stage for the first time. The mentors genuinely care.",
    initials: "PS",
  },
  {
    name: "Rahul M.",
    role: "Working professional, Vocal student",
    quote: "I joined at 32 thinking I was too old to learn singing. The evening batches fit my office schedule perfectly, and I've never felt more confident.",
    initials: "RM",
  },
  {
    name: "Ananya K.",
    role: "College student, Piano",
    quote: "Small batches make all the difference. My mentor knows exactly where I struggle and adjusts every class. It never feels like a tuition center.",
    initials: "AK",
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Loved by Students & Parents
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Real stories from the Rhythm Raga community.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground sm:text-base">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-extrabold text-primary">
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-extrabold">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
