import { useState } from "react";
import { CheckCircle2, ChevronDown, MessageCircle } from "lucide-react";
import { FAQS, WHATSAPP_LINK } from "./constants";

/* ---------- FAQ ---------- */

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Questions? Answered.
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-sm font-extrabold sm:text-base"
              >
                {f.q}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-primary transition-transform ${open === i ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {open === i && (
                <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Still have questions?{" "}
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
            WhatsApp us
          </a>{" "}
          — we reply fast.
        </p>
      </div>
    </section>
  );
}

/* ---------- Lead Form + Final CTA ---------- */

const courseOptions = ["Guitar", "Piano / Keyboard", "Drums", "Vocal Singing", "Zumba", "Creative Art"];
const timingOptions = ["Weekday Morning", "Weekday Evening", "Weekend"];

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim().slice(0, 100);
    const phone = String(fd.get("phone") ?? "").trim().slice(0, 15);
    const age = String(fd.get("age") ?? "").trim().slice(0, 3);
    const course = String(fd.get("course") ?? "");
    const timing = String(fd.get("timing") ?? "");
    if (!name || !phone) return;

    const msg = encodeURIComponent(
      `Hi Rhythm Raga! I'd like to book a free trial class.\n\nName: ${name}\nPhone: ${phone}\nAge: ${age}\nCourse: ${course}\nPreferred Timing: ${timing}`,
    );
    window.open(`https://wa.me/919999999999?text=${msg}`, "_blank", "noopener");
    setSubmitted(true);
  };

  return (
    <section id="book" className="gradient-hero relative overflow-hidden py-16 text-primary-foreground md:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Your Creative Journey <span className="text-gradient-gold">Starts Today.</span>
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/85 sm:text-lg lg:mx-0 mx-auto">
            Book your free trial today and claim exclusive launch benefits before
            seats are filled.
          </p>
          <ul className="mt-6 space-y-2.5 text-left text-sm sm:text-base">
            {["100% free trial class — no strings attached", "Founding-student launch offers", "Reply within a few hours"].map((t) => (
              <li key={t} className="flex items-center justify-center gap-2.5 lg:justify-start">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-gold" aria-hidden />
              <h3 className="mt-4 font-display text-2xl font-extrabold">You're all set.</h3>
              <p className="mt-2 text-primary-foreground/85">
                We've opened WhatsApp with your details. Hit send and we'll
                confirm your free trial slot right away.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-xl font-extrabold">Book Your Free Trial</h3>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-bold">Name</label>
                <input
                  id="name" name="name" required maxLength={100} autoComplete="name"
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-bold">Phone Number</label>
                  <input
                    id="phone" name="phone" type="tel" required maxLength={15} autoComplete="tel"
                    placeholder="98XXXXXXXX" pattern="[0-9+\s-]{8,15}"
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="mb-1.5 block text-sm font-bold">Age</label>
                  <input
                    id="age" name="age" type="number" min={4} max={99} required
                    placeholder="Age"
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="course" className="mb-1.5 block text-sm font-bold">Course Interested In</label>
                <select
                  id="course" name="course" required
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-primary-foreground focus:border-gold focus:outline-none [&>option]:text-foreground"
                >
                  {courseOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="timing" className="mb-1.5 block text-sm font-bold">Preferred Timing</label>
                <select
                  id="timing" name="timing" required
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-primary-foreground focus:border-gold focus:outline-none [&>option]:text-foreground"
                >
                  {timingOptions.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className="gradient-cta-btn w-full rounded-full px-6 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.02]"
              >
                Book Free Trial
              </button>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-primary-foreground/70">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Submitting opens WhatsApp with your details pre-filled.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
