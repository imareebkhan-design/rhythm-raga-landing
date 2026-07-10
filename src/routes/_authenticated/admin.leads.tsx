import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Loader2, Phone, MessageCircle } from "lucide-react";
import { adminListLeads, adminUpdateLead, adminOverview } from "@/lib/admin.functions";

const STATUSES = ["new", "contacted", "booked", "converted", "lost"] as const;

export const Route = createFileRoute("/_authenticated/admin/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const list = useServerFn(adminListLeads);
  const update = useServerFn(adminUpdateLead);
  const overviewFn = useServerFn(adminOverview);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn({ data: undefined as any }),
  });
  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ["admin-leads", filter],
    queryFn: () => list({ data: { status: filter, limit: 200 } }),
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
  const setNotes = async (id: string, notes: string) => {
    try {
      await update({ data: { id, notes } });
      toast.success("Note saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Total leads" value={overview?.leadsTotal ?? "…"} />
        <Stat label="Leads (last 7d)" value={overview?.leadsWeek ?? "…"} />
        <Stat label="Bookings (last 7d)" value={overview?.bookingsWeek ?? "…"} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">Filter:</span>
        <button
          onClick={() => setFilter(undefined)}
          className={pill(!filter)}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={pill(filter === s)}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Course</Th>
                <Th>Pincode</Th>
                <Th>Status</Th>
                <Th>Received</Th>
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map((l: any) => (
                <>
                  <tr
                    key={l.id}
                    onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                    className="cursor-pointer border-t border-border hover:bg-muted/30"
                  >
                    <Td>
                      <div className="font-semibold">{l.name}</div>
                      <div className="text-xs text-muted-foreground">Age {l.age ?? "—"}</div>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <a onClick={(e) => e.stopPropagation()} href={`tel:${l.phone}`} className="text-primary hover:underline"><Phone className="h-3.5 w-3.5 inline" /> {l.phone}</a>
                      </div>
                      {l.whatsapp_ok && (
                        <a
                          onClick={(e) => e.stopPropagation()}
                          href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener"
                          className="text-xs text-emerald-600 hover:underline"
                        >
                          <MessageCircle className="h-3 w-3 inline" /> WhatsApp
                        </a>
                      )}
                    </Td>
                    <Td>{l.course ?? "—"}</Td>
                    <Td>
                      {l.pincode ?? "—"}
                      {!l.in_service_area && (
                        <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-800">out of area</span>
                      )}
                    </Td>
                    <Td>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        value={l.status}
                        onChange={(e) => setStatus(l.id, e.target.value as any)}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      {format(parseISO(l.created_at), "d MMM, h:mm a")}
                    </Td>
                  </tr>
                  {expanded === l.id && (
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={6} className="p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="text-xs text-muted-foreground">
                            <div><b>UTM:</b> {[l.utm_source, l.utm_medium, l.utm_campaign, l.utm_content].filter(Boolean).join(" / ") || "—"}</div>
                            <div><b>gclid:</b> {l.gclid ?? "—"}</div>
                            <div><b>fbclid:</b> {l.fbclid ?? "—"}</div>
                            <div><b>ID:</b> <code>{l.id}</code></div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold">Notes</label>
                            <textarea
                              defaultValue={l.notes ?? ""}
                              onBlur={(e) => {
                                if (e.target.value !== (l.notes ?? "")) setNotes(l.id, e.target.value);
                              }}
                              rows={3}
                              className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                              placeholder="Add follow-up notes…"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {(leads ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-extrabold">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left font-bold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function pill(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-bold transition ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary"
  }`;
}
