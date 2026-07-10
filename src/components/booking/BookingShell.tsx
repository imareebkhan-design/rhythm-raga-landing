import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function BookingShell({
  step,
  title,
  subtitle,
  children,
}: {
  step?: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
            Rhythm <span className="text-primary">Raga</span>
          </Link>
          {step && (
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      n <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {n}
                  </span>
                  {n < 3 && <span className="h-px w-6 bg-border" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-xl text-muted-foreground sm:text-lg">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
