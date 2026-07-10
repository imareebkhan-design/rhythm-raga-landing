import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle } from "lucide-react";
import { BookingShell } from "@/components/booking/BookingShell";

const WHATSAPP_NUMBER = "919999999999";

export const Route = createFileRoute("/book/out-of-area")({
  head: () => ({
    meta: [
      { title: "We don't cover your area yet — Rhythm Raga" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OutOfArea,
  errorComponent: ({ error }) => (
    <BookingShell title="Something went wrong">
      <p className="text-muted-foreground">{error.message}</p>
    </BookingShell>
  ),
  notFoundComponent: () => <BookingShell title="Not found">Nothing here.</BookingShell>,
});

function OutOfArea() {
  const waHref =
    `https://wa.me/${WHATSAPP_NUMBER}?text=` +
    encodeURIComponent(
      "Hi Rhythm Raga! I signed up but your area doesn't cover my pincode. Please let me know when you expand.",
    );

  return (
    <BookingShell
      title="We haven't reached your area yet"
      subtitle="Right now we run in-person classes within about 5 km of GTB Nagar, Delhi. We're expanding fast — your details are saved and we'll ping you the moment we open near you."
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-display text-xl font-extrabold">Thanks for your interest!</p>
            <p className="mt-1 text-muted-foreground">
              We've noted your details. Meanwhile, if you'd like to chat about online options or a home tutor,
              message us on WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className="gradient-cta-btn flex-1 rounded-full px-5 py-3 text-center text-sm font-bold text-cta-foreground shadow-cta"
          >
            <MessageCircle className="mr-2 inline h-4 w-4" />
            Talk on WhatsApp
          </a>
          <Link
            to="/"
            className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-center text-sm font-bold text-ink hover:border-primary"
          >
            Back to home
          </Link>
        </div>
      </div>
    </BookingShell>
  );
}
