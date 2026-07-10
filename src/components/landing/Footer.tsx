import { MapPin, Phone, MessageCircle, Clock3, Instagram, Facebook, Youtube } from "lucide-react";
import { ADDRESS, CALL_LINK, PHONE_DISPLAY, WHATSAPP_LINK } from "./constants";
import logo from "@/assets/logo-rhythmraga.png";


export function Footer() {
  return (
    <footer className="border-t border-border bg-card pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img
              src={logo}
              alt="Rhythm Raga — School of Music and Arts"
              className="h-12 w-auto md:h-14"
              loading="lazy"
            />

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A premium creative learning academy in GTB Nagar, Delhi. Music,
              dance, and art for kids, teens, and adults — taught by mentors who
              care.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Youtube, label: "YouTube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <s.icon className="h-4.5 w-4.5" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-extrabold tracking-wide uppercase">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {ADDRESS}
              </li>
              <li>
                <a href={CALL_LINK} className="flex items-center gap-2.5 transition-colors hover:text-primary">
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 transition-colors hover:text-primary">
                  <MessageCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-extrabold tracking-wide uppercase">Business Hours</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Clock3 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                Mon – Sat: 10 AM – 8 PM
              </li>
              <li className="pl-6.5">Sunday: 10 AM – 2 PM</li>
            </ul>
          </div>
        </div>

        {/* Google Maps placeholder — replace src with real embed once listing is live */}
        <div className="mt-10 grid h-48 place-items-center rounded-3xl border border-dashed border-border bg-muted text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden />
            Google Maps — GTB Nagar, Delhi (embed coming soon)
          </span>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Rhythm Raga Creative Learning Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 p-3 backdrop-blur-xl md:hidden">
      <div className="flex gap-2">
        <a
          href={CALL_LINK}
          aria-label="Call Rhythm Raga"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-card"
        >
          <Phone className="h-5 w-5 text-primary" aria-hidden />
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Rhythm Raga"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-card"
        >
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
        </a>
        <a
          href="#book"
          className="gradient-cta-btn flex h-12 flex-1 items-center justify-center rounded-full text-sm font-bold text-cta-foreground shadow-cta"
        >
          Book Free Trial Class
        </a>
      </div>
    </div>
  );
}
