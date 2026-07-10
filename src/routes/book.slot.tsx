import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format, isSameDay, parseISO } from "date-fns";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { bookSlot, listAvailableSlots } from "@/lib/booking.functions";
import { BookingShell } from "@/components/booking/BookingShell";

export const Route = createFileRoute("/book/slot")({
  head: () => ({
    meta: [
      { title: "Pick your consultation slot — Rhythm Raga" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PickSlot,
  errorComponent: ({ error, reset }) => (
    <BookingShell step={2} title="Something went wrong">
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={() => reset()} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
        Try again
      </button>
    </BookingShell>
  ),
  notFoundComponent: () => <BookingShell step={2} title="Not found">Nothing here.</BookingShell>,
});

function PickSlot() {
  const navigate = useNavigate();
  const listFn = useServerFn(listAvailableSlots);
  const bookFn = useServerFn(bookSlot);
  const [lead, setLead] = useState<{ leadId: string; name: string; course: string; inServiceArea?: boolean } | null>(null);
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("rr_lead");
    if (!raw) {
      navigate({ to: "/book" });
      return;
    }
    try {
      setLead(JSON.parse(raw));
    } catch {
      navigate({ to: "/book" });
    }
  }, [navigate]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["available-slots"],
    queryFn: () => listFn({ data: { days: 7 } }),
    enabled: !!lead,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof data>();
    (data ?? []).forEach((s) => {
      const key = format(parseISO(s.starts_at), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, [] as any);
      (map.get(key) as any).push(s);
    });
    return Array.from(map.entries()).map(([k, v]) => ({
      date: parseISO(k + "T00:00:00"),
      slots: v!,
    }));
  }, [data]);

  const onBook = async (slotId: string) => {
    if (!lead) return;
    setPendingSlotId(slotId);
    try {
      const res = await bookFn({ data: { leadId: lead.leadId, slotId } });
      if (res.status === "ok" || res.status === "already_booked") {
        if (typeof window !== "undefined") {
          (window as any).fbq?.("track", "Schedule");
          (window as any).gtag?.("event", "schedule");
        }
        sessionStorage.setItem(
          "rr_booking",
          JSON.stringify({
            bookingId: res.bookingId,
            slot: res.slot,
            lead: res.lead,
          }),
        );
        navigate({ to: "/book/confirmed" });
      } else if (res.status === "slot_full") {
        toast.error("That slot just filled up. Please pick another.");
        refetch();
      } else {
        toast.error("That slot isn't available. Please pick another.");
        refetch();
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPendingSlotId(null);
    }
  };

  return (
    <BookingShell
      step={2}
      title={lead ? `Great, ${lead.name.split(" ")[0]} — pick a time` : "Pick a time"}
      subtitle="Free 30-minute consultation with a senior instructor. Choose any open slot below."
    >
      {isLoading || !lead ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading available slots…
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ date, slots }) => (
            <section key={date.toISOString()}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
                <CalendarIcon className="h-4 w-4 text-primary" />
                {format(date, "EEEE, d MMM")}
                {isSameDay(date, new Date()) && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    Today
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots!.map((s) => (
                  <button
                    key={s.id}
                    disabled={pendingSlotId !== null}
                    onClick={() => onBook(s.id)}
                    className="group relative rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 disabled:opacity-60"
                  >
                    {pendingSlotId === s.id ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <>
                        {format(parseISO(s.starts_at), "h:mm a")}
                        {s.remaining <= 2 && (
                          <span className="mt-0.5 block text-[10px] font-semibold text-primary">
                            {s.remaining} left
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Want to change your details?{" "}
        <Link to="/book" className="font-semibold text-primary hover:underline">
          Go back
        </Link>
      </p>
    </BookingShell>
  );
}

function EmptyState() {
  const waHref =
    "https://wa.me/919999999999?text=" +
    encodeURIComponent("Hi Rhythm Raga, I filled the consultation form but no slots are open — can we set a time?");
  return (
    <div className="rounded-3xl border border-border bg-muted/30 p-8 text-center">
      <h3 className="font-display text-xl font-extrabold">No open slots right now</h3>
      <p className="mt-2 text-muted-foreground">
        We're fully booked at the moment. Message us on WhatsApp and we'll set up a time that works for you.
      </p>
      <a
        href={waHref}
        target="_blank"
        rel="noopener"
        className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
      >
        Chat on WhatsApp
      </a>
    </div>
  );
}
