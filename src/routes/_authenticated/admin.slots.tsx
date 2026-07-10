import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Loader2, Wand2, Trash2 } from "lucide-react";
import {
  adminListSlots,
  adminGenerateSlots,
  adminToggleSlot,
  adminDeleteSlot,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/slots")({
  component: SlotsPage,
});

function SlotsPage() {
  const list = useServerFn(adminListSlots);
  const gen = useServerFn(adminGenerateSlots);
  const toggle = useServerFn(adminToggleSlot);
  const del = useServerFn(adminDeleteSlot);
  const [busy, setBusy] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-slots"],
    queryFn: () => list({ data: { days: 14 } }),
  });

  const generate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await gen({
        data: {
          days: Number(fd.get("days")),
          startHour: Number(fd.get("startHour")),
          endHour: Number(fd.get("endHour")),
          intervalMinutes: Number(fd.get("interval")),
          includeSundays: fd.get("sundays") === "on",
          expert_name: String(fd.get("expert") ?? "Rhythm Raga Expert"),
        },
      });
      toast.success(`Created ${res.created} slots`);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside>
        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
            <Wand2 className="h-4 w-4 text-primary" /> Generate slots
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Bulk-create 30-min consultation slots across a weekly template.
          </p>
          <form onSubmit={generate} className="space-y-3 text-sm">
            <Row2>
              <F name="days" label="Days" type="number" defaultValue={14} min={1} max={30} />
              <F name="interval" label="Interval (min)" type="number" defaultValue={30} min={15} max={120} step={15} />
            </Row2>
            <Row2>
              <F name="startHour" label="Start hour" type="number" defaultValue={10} min={0} max={23} />
              <F name="endHour" label="End hour" type="number" defaultValue={20} min={1} max={24} />
            </Row2>
            <F name="expert" label="Expert" defaultValue="Rhythm Raga Expert" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="sundays" className="h-4 w-4" />
              Include Sundays
            </label>
            <button
              disabled={busy}
              className="gradient-cta-btn w-full rounded-full px-4 py-2.5 text-sm font-bold text-cta-foreground shadow-cta disabled:opacity-70"
            >
              {busy ? "Working…" : "Generate"}
            </button>
          </form>
        </div>
      </aside>

      <div>
        <h2 className="mb-4 font-display text-xl font-extrabold">Upcoming slots (14 days)</h2>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <Th>When</Th>
                  <Th>Expert</Th>
                  <Th>Booked</Th>
                  <Th>Active</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((s: any) => {
                  const booked = (s.bookings ?? []).filter((b: any) =>
                    ["pending", "confirmed", "completed"].includes(b.status),
                  ).length;
                  return (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                      <Td>
                        <div className="font-semibold">{format(parseISO(s.starts_at), "EEE, d MMM · h:mm a")}</div>
                        <div className="text-xs text-muted-foreground">– {format(parseISO(s.ends_at), "h:mm a")}</div>
                      </Td>
                      <Td>{s.expert_name}</Td>
                      <Td>{booked}/{s.capacity}</Td>
                      <Td>
                        <button
                          onClick={async () => {
                            await toggle({ data: { id: s.id, is_active: !s.is_active } });
                            refetch();
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            s.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {s.is_active ? "Active" : "Paused"}
                        </button>
                      </Td>
                      <Td>
                        {booked === 0 && (
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this slot?")) return;
                              await del({ data: { id: s.id } });
                              refetch();
                            }}
                            className="text-muted-foreground hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </Td>
                    </tr>
                  );
                })}
                {(data ?? []).length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No slots. Generate some.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-2.5 text-left font-bold">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-4 py-3 align-top">{children}</td>; }
function Row2({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-2 gap-3">{children}</div>; }
function F({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-muted-foreground" htmlFor={props.name}>{label}</label>
      <input id={props.name} {...props} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
