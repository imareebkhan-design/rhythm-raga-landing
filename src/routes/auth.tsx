import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingShell } from "@/components/booking/BookingShell";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Rhythm Raga Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: AuthPage,
  errorComponent: ({ error }) => (
    <BookingShell title="Something went wrong"><p>{error.message}</p></BookingShell>
  ),
  notFoundComponent: () => <BookingShell title="Not found">Nothing here.</BookingShell>,
});

function AuthPage() {
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/admin", replace: true });
      else setChecking(false);
    });
  }, [navigate, redirect]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and password (min 6 chars)");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: redirect ?? "/admin", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <BookingShell title="Loading…">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </BookingShell>
    );
  }

  return (
    <BookingShell
      title={mode === "signin" ? "Sign in" : "Create account"}
      subtitle="Rhythm Raga staff — access the admin dashboard to manage leads, slots and bookings."
    >
      <div className="glass-card mx-auto max-w-md rounded-3xl p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold">Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold">Password</label>
            <input
              id="password" name="password" type="password" required minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="gradient-cta-btn w-full rounded-full px-5 py-3 text-sm font-bold text-cta-foreground shadow-cta disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</span>
            ) : (
              mode === "signin" ? "Sign in" : "Create account"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Need an account?" : "Already registered?"}{" "}
          <button
            className="font-semibold text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">← Back to site</Link>
      </p>
    </BookingShell>
  );
}
