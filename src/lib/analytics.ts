// Lightweight, dependency-free analytics event layer.
//
// No tracking library is bundled. This helper safely forwards events to
// whatever the site owner wires up later (GTM via window.dataLayer, GA4 via
// gtag, Meta Pixel via fbq). Every call is a no-op until those IDs are added,
// so it never throws and adds no runtime weight.
//
// To go live: load GTM (or GA4 + Meta Pixel base scripts) in __root.tsx and
// the events below start flowing automatically.

export type AnalyticsEvent =
  | "hero_cta_click"
  | "form_view"
  | "form_start"
  | "form_submit"
  | "form_success"
  | "call_click"
  | "whatsapp_click"
  | "offer_cta_click"
  | "course_cta_click"
  | "mobile_sticky_cta_click";

type Params = Record<string, string | number | boolean | null | undefined>;

/** Fire a conversion/interaction event to all available sinks. Safe no-op if none exist. */
export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const w = window as any;
  const payload = { event, ...params };

  try {
    // Google Tag Manager (preferred single source of truth)
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);

    // GA4 (if gtag is loaded directly instead of via GTM)
    w.gtag?.("event", event, params);

    // Meta Pixel — map the key funnel events to standard pixel events
    if (typeof w.fbq === "function") {
      if (event === "form_success") w.fbq("track", "Lead", params);
      else if (event === "form_start") w.fbq("track", "InitiateCheckout", params);
      else w.fbq("trackCustom", event, params);
    }
  } catch {
    /* analytics must never break the page */
  }
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

/** Read UTM / click-id params from the current URL (empty on the server). */
export function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return out;
}

/** Smoothly scroll to the primary lead form and focus its first field. */
export function scrollToLeadForm(): void {
  if (typeof window === "undefined") return;
  const el = document.getElementById("lead-form");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    el.querySelector<HTMLInputElement>("input, select")?.focus({ preventScroll: true });
  }, 600);
}
