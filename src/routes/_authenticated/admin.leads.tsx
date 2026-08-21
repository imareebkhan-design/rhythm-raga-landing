import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  Phone,
  MessageCircle,
  Plus,
  Download,
  Search,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Award,
  XCircle,
  MapPin,
  TrendingUp,
  Sparkles,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Tag,
  Share2,
} from "lucide-react";
import {
  adminListLeads,
  adminUpdateLead,
  adminCreateLead,
  adminDeleteLead,
  adminOverview,
} from "@/lib/admin.functions";

const STATUS_CONFIG = {
  new: {
    label: "New Leads",
    color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
    badge: "bg-blue-600 text-white",
    dot: "bg-blue-500",
    icon: Clock,
  },
  contacted: {
    label: "Contacted / Follow-up",
    color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
    badge: "bg-amber-600 text-white",
    dot: "bg-amber-500",
    icon: Phone,
  },
  booked: {
    label: "Trial Booked",
    color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
    badge: "bg-purple-600 text-white",
    dot: "bg-purple-500",
    icon: CalendarCheck,
  },
  converted: {
    label: "Converted / Enrolled",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-600 text-white",
    dot: "bg-emerald-500",
    icon: Award,
  },
  lost: {
    label: "Lost / Closed",
    color: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800",
    badge: "bg-rose-600 text-white",
    dot: "bg-rose-500",
    icon: XCircle,
  },
} as const;

type LeadStatus = keyof typeof STATUS_CONFIG;
const STATUSES = Object.keys(STATUS_CONFIG) as LeadStatus[];

const COURSES = [
  "All Courses",
  "Guitar",
  "Singing / Vocal",
  "Piano / Keyboard",
  "Drums",
  "Violin",
  "Ukulele",
  "Classical Vocal",
  "Western Vocal",
  "Music Production",
];

export const Route = createFileRoute("/_authenticated/admin/leads")({
  component: LeadsCRMPage,
});

function LeadsCRMPage() {
  const listFn = useServerFn(adminListLeads);
  const updateFn = useServerFn(adminUpdateLead);
  const createFn = useServerFn(adminCreateLead);
  const deleteFn = useServerFn(adminDeleteLead);
  const overviewFn = useServerFn(adminOverview);

  // View state
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [courseFilter, setCourseFilter] = useState<string>("All Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<"all" | "in_area" | "out_of_area">("all");

  // Modal / Drawer state
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    age: "",
    course: "Guitar",
    pincode: "110009",
    in_service_area: true,
    whatsapp_ok: true,
    status: "new" as LeadStatus,
    notes: "",
    utm_source: "admin_entry",
  });

  // Queries
  const { data: overview, refetch: refetchOverview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn({ data: undefined as any }),
  });

  const {
    data: leads = [],
    isLoading,
    isRefetching,
    refetch: refetchLeads,
  } = useQuery({
    queryKey: [
      "admin-leads",
      statusFilter,
      courseFilter === "All Courses" ? undefined : courseFilter,
      areaFilter,
      searchQuery,
    ],
    queryFn: () =>
      listFn({
        data: {
          status: statusFilter,
          course: courseFilter === "All Courses" ? undefined : courseFilter,
          in_service_area:
            areaFilter === "all" ? undefined : areaFilter === "in_area",
          search: searchQuery.trim() || undefined,
          limit: 300,
        },
      }),
  });

  // Refresh all
  const handleRefresh = () => {
    refetchLeads();
    refetchOverview();
    toast.success("CRM updated");
  };

  // Status Updater
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    setIsUpdating(id);
    try {
      await updateFn({ data: { id, status: newStatus } });
      toast.success(`Lead moved to ${STATUS_CONFIG[newStatus].label}`);
      refetchLeads();
      refetchOverview();
      if (selectedLead?.id === id) {
        setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  // Notes Updater
  const handleNotesChange = async (id: string, notes: string) => {
    try {
      await updateFn({ data: { id, notes } });
      toast.success("Note saved");
      refetchLeads();
      if (selectedLead?.id === id) {
        setSelectedLead((prev: any) => ({ ...prev, notes }));
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save note");
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(id);
    try {
      await deleteFn({ data: { id } });
      toast.success("Lead removed");
      refetchLeads();
      refetchOverview();
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete lead");
    } finally {
      setIsDeleting(null);
    }
  };

  // Add Lead Submit
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }
    try {
      await createFn({
        data: {
          name: newLeadForm.name.trim(),
          phone: newLeadForm.phone.trim(),
          age: newLeadForm.age ? parseInt(newLeadForm.age, 10) : null,
          course: newLeadForm.course || null,
          pincode: newLeadForm.pincode.trim() || null,
          in_service_area: newLeadForm.in_service_area,
          whatsapp_ok: newLeadForm.whatsapp_ok,
          status: newLeadForm.status,
          notes: newLeadForm.notes.trim() || null,
          utm_source: newLeadForm.utm_source,
        },
      });
      toast.success("Lead added successfully!");
      setIsAddModalOpen(false);
      setNewLeadForm({
        name: "",
        phone: "",
        age: "",
        course: "Guitar",
        pincode: "110009",
        in_service_area: true,
        whatsapp_ok: true,
        status: "new",
        notes: "",
        utm_source: "admin_entry",
      });
      refetchLeads();
      refetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!leads.length) {
      toast.error("No leads available to export");
      return;
    }
    const headers = [
      "ID",
      "Name",
      "Phone",
      "WhatsApp Allowed",
      "Age",
      "Course",
      "Pincode",
      "In Service Area",
      "Status",
      "Notes",
      "UTM Source",
      "UTM Campaign",
      "Created At",
    ];
    const rows = leads.map((l: any) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      l.whatsapp_ok ? "Yes" : "No",
      l.age ?? "",
      `"${l.course || ""}"`,
      `"${l.pincode || ""}"`,
      l.in_service_area ? "Yes" : "No",
      l.status,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${l.utm_source || ""}"`,
      `"${l.utm_campaign || ""}"`,
      l.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rhythm_raga_leads_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded");
  };

  // Generate WhatsApp link with customized greeting
  const getWhatsAppUrl = (lead: any) => {
    const rawPhone = lead.phone.replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const greeting = `Hi ${lead.name.split(" ")[0]}! Thank you for inquiring about music lessons at Rhythm Raga.${
      lead.course ? ` We noticed you are interested in ${lead.course}.` : ""
    } Would you like to schedule your free trial lesson this week?`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(greeting)}`;
  };

  // Filtered Leads by Status for Kanban columns
  const kanbanColumns = useMemo(() => {
    const cols: Record<LeadStatus, any[]> = {
      new: [],
      contacted: [],
      booked: [],
      converted: [],
      lost: [],
    };
    leads.forEach((lead: any) => {
      const st = (lead.status in cols ? lead.status : "new") as LeadStatus;
      cols[st].push(lead);
    });
    return cols;
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl text-ink">
              Lead Management CRM
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Sparkles className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track inquiries, convert students, follow up via WhatsApp, and manage trial bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink shadow-xs transition hover:bg-muted"
            title="Refresh CRM Data"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-ink shadow-xs transition hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <KpiCard
          label="Total Leads"
          value={overview?.leadsTotal ?? 0}
          subtext={`+${overview?.leadsToday ?? 0} today / +${overview?.leadsWeek ?? 0} 7d`}
          icon={TrendingUp}
          highlight
        />
        <KpiCard
          label="Active Pipeline"
          value={(overview?.newCount ?? 0) + (overview?.contactedCount ?? 0) + (overview?.bookedCount ?? 0)}
          subtext={`${overview?.newCount ?? 0} new · ${overview?.contactedCount ?? 0} contacted`}
          icon={Clock}
        />
        <KpiCard
          label="Trials Booked"
          value={overview?.bookedCount ?? 0}
          subtext={`${overview?.bookingsWeek ?? 0} slots in last 7d`}
          icon={CalendarCheck}
        />
        <KpiCard
          label="Converted Students"
          value={overview?.convertedCount ?? 0}
          subtext={`${overview?.conversionRate ?? 0}% conversion rate`}
          icon={Award}
          trend="up"
        />
        <KpiCard
          label="Out of Area"
          value={overview?.outOfAreaCount ?? 0}
          subtext="Potential online learners"
          icon={MapPin}
        />
      </div>

      {/* Control Bar: Search, Course Filter, Area Filter & View Switcher */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads by name, phone, pincode, course, campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 pl-9 pr-4 py-2 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters & View switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Selector */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-ink focus:border-primary focus:outline-none"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Service Area Selector */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value as any)}
              className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-ink focus:border-primary focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="in_area">In Service Area Only</option>
              <option value="out_of_area">Out of Area Only</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  viewMode === "kanban"
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-ink"
                }`}
                title="Kanban Pipeline Board"
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  viewMode === "table"
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-ink"
                }`}
                title="Data Table View"
              >
                <List className="h-3.5 w-3.5" /> Table
              </button>
            </div>
          </div>
        </div>

        {/* Quick Status Filter Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
          <span className="text-xs font-bold text-muted-foreground mr-1">Status:</span>
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              statusFilter === undefined
                ? "bg-ink text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-ink"
            }`}
          >
            All ({overview?.leadsTotal ?? leads.length})
          </button>
          {STATUSES.map((s) => {
            const count =
              s === "new"
                ? overview?.newCount
                : s === "contacted"
                ? overview?.contactedCount
                : s === "booked"
                ? overview?.bookedCount
                : s === "converted"
                ? overview?.convertedCount
                : overview?.lostCount;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  statusFilter === s
                    ? STATUS_CONFIG[s].badge
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-ink"
                }`}
              >
                {STATUS_CONFIG[s].label} {count !== undefined ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main CRM View: Kanban or Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading leads...</p>
          </div>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN PIPELINE BOARD */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 items-start overflow-x-auto pb-4">
          {STATUSES.map((statusKey) => {
            const colLeads = kanbanColumns[statusKey];
            const cfg = STATUS_CONFIG[statusKey];
            const ColIcon = cfg.icon;

            return (
              <div
                key={statusKey}
                className="flex flex-col rounded-2xl border border-border/80 bg-muted/20 p-3 min-w-[260px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                    <h3 className="font-display text-sm font-bold text-ink">
                      {cfg.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold text-muted-foreground border border-border">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="mt-3 space-y-2.5 min-h-[300px]">
                  {colLeads.map((lead: any) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onSelect={() => setSelectedLead(lead)}
                      onStatusChange={(newSt) => handleStatusChange(lead.id, newSt)}
                      onQuickNote={(notes) => handleNotesChange(lead.id, notes)}
                      getWhatsAppUrl={getWhatsAppUrl}
                    />
                  ))}

                  {colLeads.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      No {cfg.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DATA TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Student / Contact</th>
                  <th className="px-4 py-3 text-left">Course & Age</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Received</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer hover:bg-muted/30 transition"
                  >
                    {/* Student & Phone */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-ink">{lead.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </a>
                        {lead.whatsapp_ok && (
                          <a
                            href={getWhatsAppUrl(lead)}
                            target="_blank"
                            rel="noopener"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Course & Age */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">
                        {lead.course || "General Music"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lead.age ? `Age: ${lead.age} yrs` : "Age not specified"}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{lead.pincode || "—"}</span>
                      </div>
                      {lead.in_service_area ? (
                        <span className="inline-block mt-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          In Service Area
                        </span>
                      ) : (
                        <span className="inline-block mt-0.5 rounded bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          Out of Area
                        </span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className={`rounded-lg border border-border px-2.5 py-1 text-xs font-bold ${
                          STATUS_CONFIG[lead.status as LeadStatus]?.color || ""
                        }`}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Source Attribution */}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="font-medium text-ink">
                        {lead.utm_source || "Direct / Website"}
                      </div>
                      {lead.utm_campaign && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          Camp: {lead.utm_campaign}
                        </div>
                      )}
                    </td>

                    {/* Date Received */}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(parseISO(lead.created_at), "d MMM, h:mm a")}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-ink transition"
                          title="View Full Profile"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-100 hover:text-rose-600 transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-sm text-muted-foreground">
                      No leads match your current search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAD DETAIL MODAL / DRAWER */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(st) => handleStatusChange(selectedLead.id, st)}
          onNotesChange={(notes) => handleNotesChange(selectedLead.id, notes)}
          onDelete={() => handleDeleteLead(selectedLead.id)}
          getWhatsAppUrl={getWhatsAppUrl}
        />
      )}

      {/* ADD NEW LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink">
                  Add New Lead / Student
                </h2>
                <p className="text-xs text-muted-foreground">
                  Record offline inquiries, phone walk-ins, or manual registrations.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.name}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newLeadForm.phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-ink">Age</label>
                  <input
                    type="number"
                    min="3"
                    max="120"
                    placeholder="e.g. 14"
                    value={newLeadForm.age}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, age: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Course</label>
                  <select
                    value={newLeadForm.course}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, course: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  >
                    {COURSES.filter((c) => c !== "All Courses").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 110009"
                    value={newLeadForm.pincode}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, pincode: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink">Initial Status</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, status: e.target.value as LeadStatus })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">Channel / Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Walk-in, Phone Call, Google"
                    value={newLeadForm.utm_source}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, utm_source: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">Notes / Requirements</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Looking for weekend guitar batch for beginner..."
                  value={newLeadForm.notes}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, notes: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-muted/30 p-2.5 text-sm text-ink focus:border-primary focus:bg-background focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLeadForm.in_service_area}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        in_service_area: e.target.checked,
                      })
                    }
                    className="rounded border-border text-primary"
                  />
                  <span>In Service Area (GTB Nagar / North Delhi)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-ink hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
                  >
                    Save Lead
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* KANBAN LEAD CARD COMPONENT */
function LeadCard({
  lead,
  onSelect,
  onStatusChange,
  onQuickNote,
  getWhatsAppUrl,
}: {
  lead: any;
  onSelect: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onQuickNote: (notes: string) => void;
  getWhatsAppUrl: (lead: any) => string;
}) {
  return (
    <div
      onClick={onSelect}
      className="group relative rounded-xl border border-border bg-background p-3.5 shadow-xs transition hover:border-primary/60 hover:shadow-md cursor-pointer"
    >
      {/* Top row: Name & Date */}
      <div className="flex items-start justify-between gap-2">
        <div className="font-display font-extrabold text-sm text-ink group-hover:text-primary transition line-clamp-1">
          {lead.name}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground shrink-0">
          {format(parseISO(lead.created_at), "d MMM")}
        </span>
      </div>

      {/* Course & Age */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-ink">
          {lead.course || "Music"}
        </span>
        {lead.age && (
          <span className="text-[11px] text-muted-foreground">Age {lead.age}</span>
        )}
      </div>

      {/* Location Badge */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-[11px]">
          <MapPin className="h-3 w-3 text-muted-foreground/80" />
          {lead.pincode || "Delhi"}
        </span>
        {!lead.in_service_area && (
          <span className="rounded bg-amber-100 dark:bg-amber-950 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">
            out-of-area
          </span>
        )}
      </div>

      {/* Direct Contact Bar */}
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
        <div className="flex items-center gap-1">
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-border bg-muted/40 p-1.5 text-ink hover:border-primary hover:text-primary transition"
            title={`Call ${lead.phone}`}
          >
            <Phone className="h-3 w-3" />
          </a>
          {lead.whatsapp_ok && (
            <a
              href={getWhatsAppUrl(lead)}
              target="_blank"
              rel="noopener"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 text-emerald-600 hover:bg-emerald-100 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Quick Shift Dropdown */}
        <select
          onClick={(e) => e.stopPropagation()}
          value={lead.status}
          onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
          className="rounded-lg border border-border bg-background px-2 py-0.5 text-[11px] font-bold text-muted-foreground hover:text-ink focus:border-primary focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Note preview if any */}
      {lead.notes && (
        <div className="mt-2 rounded-lg bg-muted/40 p-1.5 text-[11px] text-muted-foreground italic line-clamp-1">
          "{lead.notes}"
        </div>
      )}
    </div>
  );
}

/* LEAD DETAIL MODAL / DRAWER COMPONENT */
function LeadDetailModal({
  lead,
  onClose,
  onStatusChange,
  onNotesChange,
  onDelete,
  getWhatsAppUrl,
}: {
  lead: any;
  onClose: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onNotesChange: (notes: string) => void;
  onDelete: () => void;
  getWhatsAppUrl: (lead: any) => string;
}) {
  const [noteText, setNoteText] = useState(lead.notes ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-extrabold text-ink">
                {lead.name}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  STATUS_CONFIG[lead.status as LeadStatus]?.color || ""
                }`}
              >
                {STATUS_CONFIG[lead.status as LeadStatus]?.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lead ID: <code className="text-[11px] font-mono">{lead.id}</code> · Received on{" "}
              {format(parseISO(lead.created_at), "d MMMM yyyy, h:mm a")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* 1-Click Action Hub */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition text-center"
          >
            <Phone className="h-4 w-4" /> Call {lead.phone}
          </a>
          <a
            href={getWhatsAppUrl(lead)}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition text-center"
          >
            <MessageCircle className="h-4 w-4" /> Open WhatsApp
          </a>
          <div className="col-span-2 sm:col-span-1">
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-3 text-xs font-bold text-ink focus:border-primary focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  Move to: {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Inquiry & Profile Information
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-muted-foreground">Course Interest:</span>
              <div className="font-bold text-ink text-sm mt-0.5">
                {lead.course || "General Music"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Student Age:</span>
              <div className="font-bold text-ink text-sm mt-0.5">
                {lead.age ? `${lead.age} years` : "Not provided"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Pincode / Location:</span>
              <div className="font-bold text-ink text-sm mt-0.5">
                {lead.pincode || "Delhi"} (
                {lead.in_service_area ? (
                  <span className="text-emerald-600">In Area</span>
                ) : (
                  <span className="text-amber-600">Out of Area</span>
                )}
                )
              </div>
            </div>
          </div>
        </div>

        {/* Notes Editor */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-ink">
              Follow-up Notes & Trial Feedback
            </label>
            <span className="text-[11px] text-muted-foreground">
              Auto-saves on blur
            </span>
          </div>
          <textarea
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => {
              if (noteText !== (lead.notes ?? "")) {
                onNotesChange(noteText);
              }
            }}
            placeholder="Add discussion points, trial dates discussed, instrument experience, parent requirements..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>

        {/* Marketing Attribution */}
        <div className="mt-5 rounded-xl border border-border/70 bg-muted/10 p-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Ad Attribution & Tracking
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
            <div>
              <span className="text-muted-foreground">Source:</span>{" "}
              <span className="font-semibold text-ink">{lead.utm_source || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Medium:</span>{" "}
              <span className="font-semibold text-ink">{lead.utm_medium || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Campaign:</span>{" "}
              <span className="font-semibold text-ink">{lead.utm_campaign || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">GCLID:</span>{" "}
              <span className="font-mono text-[10px] text-ink truncate block">
                {lead.gclid || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Lead
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-ink px-5 py-2 text-xs font-bold text-white hover:bg-ink/90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* KPI CARD COMPONENT */
function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  highlight = false,
  trend,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: any;
  highlight?: boolean;
  trend?: "up" | "down";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-xs transition ${
        highlight
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon
          className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`}
        />
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-muted-foreground">
        {subtext}
      </div>
    </div>
  );
}
