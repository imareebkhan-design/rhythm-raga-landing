// Brand-neutral client error hook. Currently a safe no-op (only logs in dev);
// wire a real reporter (Sentry, etc.) here later without touching call sites.
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) {
    console.error("[app error]", error, { route: window.location.pathname, ...context });
  }
}
