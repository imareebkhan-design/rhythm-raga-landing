import { Phone } from "lucide-react";
import { CALL_LINK } from "./constants";
import { track, scrollToLeadForm } from "@/lib/analytics";
import logo from "@/assets/logo-white.png";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-24">
        <a href="#top" className="flex items-center" aria-label="Rhythm Raga — School of Music and Arts">
          <img
            src={logo}
            alt="Rhythm Raga — School of Music and Arts"
            className="h-12 w-auto md:h-16"
            loading="eager"
          />
        </a>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/70 md:flex">
          <a href="#courses" className="transition-colors hover:text-white">Courses</a>
          <a href="#offer" className="transition-colors hover:text-white">Offer</a>
          <a href="#why" className="transition-colors hover:text-white">Why Us</a>
          <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CALL_LINK}
            onClick={() => track("call_click", { context: "navbar" })}
            className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            Call Now
          </a>
          <button
            type="button"
            onClick={() => {
              track("hero_cta_click", { context: "navbar" });
              scrollToLeadForm();
            }}
            className="gradient-cta-btn inline-flex items-center rounded-full px-4 py-2 text-sm font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03] sm:px-5"
          >
            Book Free Trial
          </button>
        </div>
      </div>
    </header>
  );
}
