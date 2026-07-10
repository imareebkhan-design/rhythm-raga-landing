import { createFileRoute } from "@tanstack/react-router";

// Redirects to /admin/leads via the parent layout effect.
export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => null,
});
