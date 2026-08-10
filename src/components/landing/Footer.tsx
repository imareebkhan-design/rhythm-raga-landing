import { MapPin, Phone, MessageCircle, Clock3, Instagram, Facebook, Youtube } from "lucide-react";
import { ADDRESS, CALL_LINK, CALL_LINK_2, PHONE_DISPLAY, PHONE_2_DISPLAY, WHATSAPP_LINK, MAPS_LINK, MAPS_EMBED } from "./constants";
import { track, scrollToLeadForm } from "@/lib/analytics";
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
              className="h-20 w-auto md:h-24"
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
              <li>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("call_click", { context: "footer_map" })}
                  className="flex items-start gap-2.5 transition-colors hover:text-primary"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {ADDRESS}
                </a>
              </li>
              <li>
                <a
                  href={CALL_LINK}
                  onClick={() => track("call_click", { context: "footer" })}
                  className="flex items-center gap-2.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={CALL_LINK_2}
                  onClick={() => track("call_click", { context: "footer_2" })}
                  className="flex items-center gap-2.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {PHONE_2_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("whatsapp_click", { context: "footer" })}
                  className="flex items-center gap-2.5 transition-colors hover:text-primary"
                >
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
                Open daily: 11 AM – 9 PM
              </li>
              <li className="pl-6.5">Monday – Sunday</li>
            </ul>
          </div>
        </div>

        {/* Google Maps embed — Rhytthm Raga, GTB Nagar Metro Station */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-border">
          <iframe
            title="Rhytthm Raga location on Google Maps"
            src={MAPS_EMBED}
            className="h-64 w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
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
          onClick={() => track("call_click", { context: "sticky" })}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-card"
        >
          <Phone className="h-5 w-5 text-primary" aria-hidden />
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Rhythm Raga"
          onClick={() => track("whatsapp_click", { context: "sticky" })}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-card"
        >
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => {
            track("mobile_sticky_cta_click", {});
            scrollToLeadForm();
          }}
          className="gradient-cta-btn flex h-12 flex-1 items-center justify-center rounded-full text-sm font-bold text-cta-foreground shadow-cta"
        >
          Book My Free Trial
        </button>
      </div>
    </div>
  );
}
