import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Trash2, Plus } from "lucide-react";
import {
  adminListPincodes,
  adminUpsertPincode,
  adminDeletePincode,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/pincodes")({
  component: PincodesPage,
});

function PincodesPage() {
  const list = useServerFn(adminListPincodes);
  const upsert = useServerFn(adminUpsertPincode);
  const del = useServerFn(adminDeletePincode);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-pincodes"],
    queryFn: () => list({ data: undefined as any }),
  });

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await upsert({
        data: {
          pincode: String(fd.get("pincode") ?? ""),
          area_name: String(fd.get("area") ?? "") || null,
          is_active: true,
        },
      });
      toast.success("Added");
      (e.currentTarget as HTMLFormElement).reset();
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside>
        <div className="rounded-2xl border border-border bg-background p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
            <Plus className="h-4 w-4 text-primary" /> Add pincode
          </h2>
          <form onSubmit={add} className="space-y-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Pincode</label>
              <input name="pincode" required pattern="\d{6}" maxLength={6} placeholder="110009" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Area name (optional)</label>
              <input name="area" placeholder="GTB Nagar" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
            </div>
            <button className="gradient-cta-btn w-full rounded-full px-4 py-2.5 text-sm font-bold text-cta-foreground shadow-cta">
              Add
            </button>
          </form>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Only leads with a pincode in this list are asked to book a slot. Others land on the "out of area" page and are still saved as leads.
        </p>
      </aside>
      <div>
        <h2 className="mb-4 font-display text-xl font-extrabold">Serviceable pincodes</h2>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-bold">Pincode</th>
                  <th className="px-4 py-2.5 text-left font-bold">Area</th>
                  <th className="px-4 py-2.5 text-left font-bold">Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((p: any) => (
                  <tr key={p.pincode} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold">{p.pincode}</td>
                    <td className="px-4 py-3">{p.area_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          await upsert({ data: { pincode: p.pincode, area_name: p.area_name, is_active: !p.is_active } });
                          refetch();
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.is_active ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete ${p.pincode}?`)) return;
                          await del({ data: { pincode: p.pincode } });
                          refetch();
                        }}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(data ?? []).length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No pincodes yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
