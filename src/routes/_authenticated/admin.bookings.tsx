import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { adminListBookings, adminUpdateBooking } from "@/lib/admin.functions";

const STATUSES = ["pending", "confirmed", "completed", "no_show", "cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const list = useServerFn(adminListBookings);
  const update = useServerFn(adminUpdateBooking);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => list({ data: undefined as any }),
  });

  const setStatus = async (id: string, status: (typeof STATUSES)[number]) => {
    try {
      await update({ data: { id, status } });
      toast.success("Updated");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-extrabold">Bookings</h2>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>When</Th>
                <Th>Lead</Th>
                <Th>Course</Th>
                <Th>Expert</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((b: any) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                  <Td>
                    <div className="font-semibold">{format(parseISO(b.slot.starts_at), "EEE, d MMM · h:mm a")}</div>
                    <div className="text-xs text-muted-foreground">
                      – {format(parseISO(b.slot.ends_at), "h:mm a")}
                    </div>
                  </Td>
                  <Td>
                    <div className="font-semibold">{b.lead?.name}</div>
                    <div className="text-xs text-muted-foreground">{b.lead?.phone} · {b.lead?.pincode ?? "—"}</div>
                  </Td>
                  <Td>{b.lead?.course ?? "—"}</Td>
                  <Td>{b.slot?.expert_name}</Td>
                  <Td>
                    <select
                      value={b.status}
                      onChange={(e) => setStatus(b.id, e.target.value as any)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Td>
                  <Td className="text-xs text-muted-foreground">{format(parseISO(b.created_at), "d MMM, h:mm a")}</Td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-2.5 text-left font-bold">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
