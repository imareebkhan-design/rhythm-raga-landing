import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { LogOut, Users, CalendarClock, CheckSquare, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { amIAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  errorComponent: ({ error }) => (
    <div className="p-8">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(amIAdmin);
  const { data, isLoading, error } = useQuery({
    queryKey: ["am-i-admin"],
    queryFn: () => check({ data: undefined as any }),
  });

  useEffect(() => {
    if (path === "/admin") navigate({ to: "/admin/leads", replace: true });
  }, [path, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-extrabold">Access denied</h1>
          <p className="mt-2 text-muted-foreground">
            This account isn't set as an admin. Ask an existing admin to grant you the role, or sign in with an admin account.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={signOut} className="rounded-full border border-border px-4 py-2 text-sm font-bold">
              Sign out
            </button>
            <Link to="/" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin/leads", label: "Leads", icon: Users },
    { to: "/admin/bookings", label: "Bookings", icon: CheckSquare },
    { to: "/admin/slots", label: "Slots", icon: CalendarClock },
    { to: "/admin/pincodes", label: "Pincodes", icon: MapPin },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/30 text-ink">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-lg font-extrabold">
            Rhythm <span className="text-primary">Raga</span>{" "}
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Admin</span>
          </Link>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-ink">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold transition ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
