import { Check } from "lucide-react";
import { track, scrollToLeadForm } from "@/lib/analytics";

const offers = [
  { tag: "Most Popular", title: "20% OFF", sub: "Your First Month", note: "Start your journey at founding-student pricing." },
  { tag: "Best Value", title: "3 + 1", sub: "Enroll 3 Months, Learn 4", note: "One full month of classes — completely free." },
  { tag: "Founders Deal", title: "12 + 2", sub: "Enroll 12 Months, Learn 14", note: "Two bonus months for serious learners." },
];

const bonuses = [
  ["Free Trial Class", "₹500 value"],
  ["Personalized Skill Assessment", "₹1,000 value"],
  ["Flexible Batch Selection", "Priceless"],
  ["Beginner-Friendly Learning", "Included"],
  ["Performance Opportunities", "₹2,000 value"],
  ["Small Batch Sizes", "Included"],
  ["Progress Tracking", "₹1,500 value"],
  ["Friendly Mentors", "Always"],
];

export function Offer() {
  return (
    <section id="offer" className="gradient-offer relative scroll-mt-24 overflow-hidden py-16 text-ink md:py-24">
      <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
            Launch Offer
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Launch Offer — Limited Seats
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Become one of our founding students and unlock launch benefits, available for a
            limited number of new students.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {offers.map((o) => (
            <div key={o.title} className="glass-card rounded-3xl p-6 text-center transition-transform hover:-translate-y-1">
              <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-primary-foreground uppercase">
                {o.tag}
              </span>
              <p className="mt-4 font-display text-4xl font-extrabold text-gradient-gold">{o.title}</p>
              <p className="mt-1 font-bold">{o.sub}</p>
              <p className="mt-2 text-sm text-muted-foreground">{o.note}</p>
            </div>
          ))}
        </div>

        <div className="glass-card mt-8 rounded-3xl p-6 sm:p-8">
          <p className="text-center font-display text-lg font-extrabold sm:text-xl">
            Plus, every founding student gets all of this — free:
          </p>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {bonuses.map(([b, v]) => (
              <li key={b} className="flex items-center justify-between gap-3 text-sm sm:text-base">
                <span className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/20">
                    <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                  </span>
                  {b}
                </span>
                <span className="shrink-0 text-xs font-bold text-primary sm:text-sm">{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Total bonus value: <s className="opacity-70">₹5,000+</s>{" "}
            <span className="font-extrabold text-primary">Yours free as a founding student</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              track("offer_cta_click", { context: "offer" });
              scrollToLeadForm();
            }}
            className="gradient-cta-btn inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03]"
          >
            Claim My Launch Offer
          </button>
          <p className="text-xs font-semibold text-muted-foreground">
            Start with your free trial. Decide after experiencing the academy.
          </p>
        </div>
      </div>
    </section>
  );
}
