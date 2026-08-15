// Production origin used for canonical URLs, Open Graph, and structured data.
// Override per environment with VITE_SITE_URL (e.g. a preview domain); defaults
// to the production domain so absolute URLs are always correct even without env.
const raw =
  (import.meta.env as Record<string, string | undefined>).VITE_SITE_URL ?? "https://rhytthmraga.com";

export const SITE_URL = raw.replace(/\/+$/, "");

/** Build an absolute URL from a site-relative path. */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
