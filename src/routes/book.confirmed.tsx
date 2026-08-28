import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Calendar, MessageCircle, MapPin } from "lucide-react";
import { BookingShell } from "@/components/booking/BookingShell";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { trackGoogleAdsConversion } from "@/lib/analytics";

const WHATSAPP_NUMBER = "918796574448"; // TODO: update to real academy number

export const Route = createFileRoute("/book/confirmed")({
  head: () => ({
    meta: [
      { title: "You're booked — Rhythm Raga" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmed,
  errorComponent: ({ error }) => (
    <BookingShell step={3} title="Something went wrong">
      <p className="text-muted-foreground">{error.message}</p>
    </BookingShell>
  ),
  notFoundComponent: () => <BookingShell step={3} title="Not found">Nothing here.</BookingShell>,
});

type Booking = {
  bookingId: string;
  slot: { starts_at: string; ends_at: string; expert_name: string } | null;
  lead: { name: string; phone: string; course: string } | null;
};

function Confirmed() {
  const navigate = useNavigate();
  const [b, setB] = useState<Booking | null>(null);
  const conversionFired = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("rr_booking");
    if (!raw) {
      navigate({ to: "/book" });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setB(parsed);
      if (!conversionFired.current && parsed?.bookingId) {
        conversionFired.current = true;
        trackGoogleAdsConversion(parsed.bookingId);
      }
    } catch {
      navigate({ to: "/book" });
    }
  }, [navigate]);

  if (!b || !b.slot || !b.lead) return null;

  const start = parseISO(b.slot.starts_at);
  const end = parseISO(b.slot.ends_at);
  const whenLine = `${format(start, "EEEE, d MMM")} · ${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;

  const waMsg = encodeURIComponent(
    `Hi Rhythm Raga! I just booked a free consultation.\n\nName: ${b.lead.name}\nPhone: ${b.lead.phone}\nCourse: ${b.lead.course}\nWhen: ${whenLine}\n\nSee you soon!`,
  );
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  const addToCalendar = () => {
    const ics = buildIcs({
      uid: b.bookingId,
      title: "Rhythm Raga — Free Consultation",
      description: `Consultation with ${b.slot!.expert_name}. Course interest: ${b.lead!.course}. Contact: +91-8796574448.`,
      location: "Rhythm Raga, GTB Nagar, Delhi",
      startsAt: b.slot!.starts_at,
      endsAt: b.slot!.ends_at,
    });
    downloadIcs("rhythm-raga-consultation.ics", ics);
  };

  return (
    <BookingShell step={3} title="You're all set! 🎉" subtitle="Your free consultation is confirmed.">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-primary" />
          <div>
            <p className="font-display text-2xl font-extrabold">{whenLine}</p>
            <p className="mt-1 text-muted-foreground">With {b.slot.expert_name}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <Row icon={<MapPin className="h-4 w-4" />} label="Where">
            Rhythm Raga, GTB Nagar, Delhi (we'll share exact pin on WhatsApp)
          </Row>
          <Row icon={<Calendar className="h-4 w-4" />} label="Duration">
            30 minutes
          </Row>
          <Row icon={<MessageCircle className="h-4 w-4" />} label="Confirmation">
            We'll message +91-{b.lead.phone.replace(/\D/g, "").slice(-10)} on WhatsApp shortly
          </Row>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className="gradient-cta-btn flex-1 rounded-full px-5 py-3 text-center text-sm font-bold text-cta-foreground shadow-cta"
          >
            Confirm on WhatsApp
          </a>
          <button
            onClick={addToCalendar}
            className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm font-bold text-ink hover:border-primary"
          >
            Add to calendar
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-ink">What happens next?</p>
        <p className="mt-1">
          Our expert will call you at the scheduled time to understand your goals and design a personalised
          learning path. No fees, no pressure — just a friendly chat.
        </p>
      </div>

      <p className="mt-6 text-center">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </BookingShell>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <span className="font-bold text-ink">{label}: </span>
        <span className="text-muted-foreground">{children}</span>
      </div>
    </div>
  );
}
