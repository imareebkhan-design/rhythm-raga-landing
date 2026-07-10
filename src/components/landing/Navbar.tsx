import { Phone } from "lucide-react";
import { CALL_LINK } from "./constants";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-extrabold text-primary-foreground">
            R
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Rhythm <span className="text-primary">Raga</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
          <a href="#courses" className="transition-colors hover:text-foreground">Courses</a>
          <a href="#offer" className="transition-colors hover:text-foreground">Launch Offer</a>
          <a href="#why" className="transition-colors hover:text-foreground">Why Us</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={CALL_LINK}
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            Call Now
          </a>
          <a
            href="#book"
            className="gradient-cta-btn inline-flex items-center rounded-full px-4 py-2 text-sm font-bold text-cta-foreground shadow-cta transition-transform hover:scale-[1.03] sm:px-5"
          >
            Book Free Trial
          </a>
        </div>
      </div>
    </header>
  );
}
