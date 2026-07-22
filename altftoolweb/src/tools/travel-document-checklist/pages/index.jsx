"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Copy,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Filter,
  FolderCheck,
  Globe2,
  HeartPulse,
  Hotel,
  IdCard,
  ListChecks,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";

const TRIP_TYPES = {
  international: {
    label: "International Trip",
    icon: Globe2,
    note: "Passport, visa, insurance, tickets, stay proof, forex, and emergency copies.",
    items: [
      ["Passport", "Identity", "Critical", "Original + scanned copy", true, "Original", true],
      ["Visa / eVisa approval", "Immigration", "Critical", "Print and offline PDF", false, "Digital + print", true],
      ["Return flight tickets", "Travel", "High", "PNR, airline app, and PDF backup", false, "Digital + print", true],
      ["Hotel booking proof", "Stay", "High", "All nights covered", false, "Digital", true],
      ["Travel insurance", "Safety", "High", "Medical cover and policy number", false, "Digital + print", false],
      ["Forex card / cash proof", "Money", "Medium", "Split cash and keep card helpline", true, "Original", false],
      ["International driving permit", "Transport", "Low", "Only if self-driving", false, "Original", false],
      ["Emergency contacts sheet", "Safety", "Medium", "Embassy, hotel, family, insurance", true, "Digital + print", false],
      ["Passport photos", "Identity", "Medium", "For SIM, visa desk, permits", false, "Print", false],
    ],
  },
  domestic: {
    label: "Domestic Trip",
    icon: Plane,
    note: "Tickets, government ID, hotel proof, vehicle permits, medicine copies, and quick backups.",
    items: [
      ["Government ID proof", "Identity", "Critical", "Aadhaar, passport, voter ID, or DL", true, "Original", true],
      ["Train / flight / bus tickets", "Travel", "Critical", "PNR and offline copy", false, "Digital", true],
      ["Hotel / homestay booking", "Stay", "High", "Address, phone, check-in time", false, "Digital", true],
      ["Local permits", "Access", "Medium", "Required for restricted areas", false, "Digital + print", false],
      ["Medical prescription", "Health", "Medium", "If carrying regular medicines", true, "Digital + print", false],
      ["Vehicle documents", "Transport", "Medium", "RC, insurance, PUC, DL if road trip", true, "Original", false],
      ["Emergency contact note", "Safety", "Medium", "Family and accommodation contacts", false, "Digital", false],
    ],
  },
  visa: {
    label: "Visa File",
    icon: FileCheck2,
    note: "Embassy-ready file with identity, finance, travel plan, purpose, insurance, and cover letter.",
    items: [
      ["Visa application form", "Application", "Critical", "Filled, signed, and dated", false, "Print", true],
      ["Passport", "Identity", "Critical", "Minimum 6 months validity and blank pages", true, "Original", true],
      ["Passport-size photos", "Identity", "High", "Country-specific size and background", false, "Print", true],
      ["Bank statement", "Finance", "Critical", "Last 3 to 6 months", true, "Print", true],
      ["ITR / Form 16", "Finance", "High", "Latest financial proof", true, "Print", false],
      ["Cover letter", "Purpose", "High", "Clear travel purpose and dates", false, "Print", false],
      ["Flight reservation", "Travel", "High", "As per visa requirement", false, "Digital + print", false],
      ["Accommodation proof", "Stay", "High", "Hotel booking or invitation address", false, "Digital + print", false],
      ["Travel insurance", "Safety", "Medium", "Schengen/visa-specific coverage", false, "Digital + print", false],
    ],
  },
  family: {
    label: "Family Travel",
    icon: Users,
    note: "Grouped checklist for IDs, child documents, medicines, bookings, and shared emergency files.",
    items: [
      ["All traveler IDs", "Identity", "Critical", "Original IDs for every traveler", true, "Original", true],
      ["Child birth certificate", "Identity", "High", "If traveling with children", true, "Digital + print", false],
      ["Tickets for all travelers", "Travel", "Critical", "Names match ID exactly", false, "Digital", true],
      ["Hotel booking with occupancy", "Stay", "High", "Check guest count and child policy", false, "Digital", true],
      ["Medical kit prescription", "Health", "High", "Child and senior medicines", true, "Digital + print", false],
      ["Travel insurance for family", "Safety", "Medium", "Policy covers every traveler", false, "Digital", false],
      ["Emergency contact card", "Safety", "Medium", "One copy per bag", false, "Print", false],
      ["Consent letter", "Compliance", "Medium", "If one parent or guardian is traveling", true, "Print", false],
    ],
  },
  business: {
    label: "Business Travel",
    icon: Briefcase,
    note: "Client-ready travel file with tickets, invitation, hotel, business cards, ID, and reimbursements.",
    items: [
      ["Government ID / passport", "Identity", "Critical", "Matches ticket and hotel booking", true, "Original", true],
      ["Flight / train tickets", "Travel", "Critical", "PNR and invoice copy", false, "Digital", true],
      ["Hotel booking invoice", "Stay", "High", "GST details if reimbursable", false, "Digital", true],
      ["Client invitation / meeting agenda", "Work", "High", "Venue, date, contact person", false, "Digital", false],
      ["Company authorization letter", "Work", "Medium", "If needed for site entry", false, "Digital + print", false],
      ["Business cards", "Work", "Low", "Carry enough for meetings", false, "Print", false],
      ["Expense policy / reimbursement form", "Finance", "Medium", "Keep receipts in one place", false, "Digital", false],
      ["Laptop declaration / asset note", "Tech", "Low", "For company devices if required", true, "Digital", false],
    ],
  },
  student: {
    label: "Student Travel",
    icon: FolderCheck,
    note: "Admission, hostel, scholarship, visa, insurance, finance, and guardian documents.",
    items: [
      ["Passport / ID proof", "Identity", "Critical", "Original + scanned copy", true, "Original", true],
      ["Admission letter", "Education", "Critical", "University or institution acceptance", false, "Digital + print", true],
      ["Fee payment receipt", "Finance", "High", "Tuition, hostel, deposit", true, "Digital + print", false],
      ["Student visa / permit", "Immigration", "Critical", "If international", false, "Digital + print", true],
      ["Education certificates", "Education", "High", "Marksheets and transcripts", true, "Print", false],
      ["Medical insurance", "Health", "High", "Campus or country requirement", false, "Digital", false],
      ["Guardian consent / contact sheet", "Safety", "Medium", "If minor or hostel requires it", true, "Print", false],
      ["Scholarship / loan documents", "Finance", "Medium", "If applicable", true, "Digital + print", false],
    ],
  },
};

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const FORMATS = ["Original", "Digital", "Print", "Digital + print"];
const STATUSES = ["Pending", "Ready", "Review", "Not needed"];
const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUS_TONE = {
  Ready: "tool-status-good",
  Review: "tool-status-warn",
  Pending: "tool-status-bad",
  "Not needed": "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(targetDate) {
  if (!targetDate) return 0;
  const target = new Date(`${targetDate}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (Number.isNaN(target.getTime())) return 0;
  return Math.ceil((target - today) / 86400000);
}

function makeItem(row, index, tripType, departureDate) {
  const [name, category, priority, note, sensitive, format, required] = row;
  const dueOffset = priority === "Critical" ? -21 : priority === "High" ? -14 : priority === "Medium" ? -7 : -3;
  const due = new Date(`${departureDate}T00:00:00`);
  due.setDate(due.getDate() + dueOffset);
  return {
    id: `${tripType}-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    category,
    priority,
    note,
    sensitive,
    format,
    required,
    status: required ? "Pending" : "Review",
    copies: priority === "Critical" || priority === "High" ? 2 : 1,
    dueDate: due.toISOString().slice(0, 10),
  };
}

function createItems(tripType, departureDate) {
  return TRIP_TYPES[tripType].items.map((row, index) => makeItem(row, index, tripType, departureDate));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildMarkdown(trip, tripType, items, stats) {
  const template = TRIP_TYPES[tripType];
  return [
    `# ${template.label} Document Checklist`,
    `Destination: ${trip.destination || "Not set"}`,
    `Departure: ${trip.departureDate}`,
    `Travelers: ${trip.travelers}`,
    `Readiness: ${stats.readiness}%`,
    "",
    "## Documents",
    ...items.map(
      (item) =>
        `- [${item.status === "Ready" ? "x" : " "}] ${item.name} (${item.priority}, ${item.format}, copies: ${item.copies}, due: ${item.dueDate}) - ${item.note}`,
    ),
    "",
    "Privacy note: Keep sensitive IDs masked where accepted and store offline backups separately.",
  ].join("\n");
}

function exportCsv(trip, tripType, items) {
  const rows = [
    ["Trip Type", "Destination", "Departure", "Travelers", "Document", "Category", "Priority", "Format", "Copies", "Sensitive", "Required", "Due Date", "Status", "Note"],
    ...items.map((item) => [
      TRIP_TYPES[tripType].label,
      trip.destination,
      trip.departureDate,
      trip.travelers,
      item.name,
      item.category,
      item.priority,
      item.format,
      item.copies,
      item.sensitive ? "Yes" : "No",
      item.required ? "Yes" : "Optional",
      item.dueDate,
      item.status,
      item.note,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile("travel-document-checklist.csv", csv, "text/csv");
}

function MetricCard({ icon: Icon, label, value, detail, tone = "info" }) {
  const toneClass = {
    info: "bg-[var(--section-highlight)] text-[var(--primary)]",
    good: "tool-status-good",
    warn: "tool-status-warn",
    bad: "tool-status-bad",
  }[tone];

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 text-center sm:!p-5 xl:!p-6">
      <div className="grid min-w-0 gap-3">
        <span className={`mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">
            {label}
          </p>
          <p className="mt-1 whitespace-nowrap text-2xl font-black leading-tight text-[var(--foreground)] sm:text-[1.7rem]">
            {value}
          </p>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function CategoryBar({ label, ready, total, max }) {
  const width = max ? Math.max(8, Math.round((total / max) * 100)) : 0;
  const percent = total ? Math.round((ready / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-bold text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 text-sm font-black text-[var(--primary)]">{ready}/{total}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--muted-foreground)]">{percent}% ready</p>
    </div>
  );
}

export default function TravelDocumentChecklist() {
  const initialDeparture = addDaysIso(28);
  const [tripType, setTripType] = useState("international");
  const [trip, setTrip] = useState({
    destination: "Dubai, UAE",
    departureDate: initialDeparture,
    returnDate: addDaysIso(34),
    travelers: 2,
    passportExpiry: "2031-08-15",
    contactName: "Emergency Contact",
    contactPhone: "+91 98765 43210",
  });
  const [items, setItems] = useState(() => createItems("international", initialDeparture));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customItem, setCustomItem] = useState({
    name: "",
    category: "Travel",
    priority: "Medium",
    format: "Digital",
  });

  const template = TRIP_TYPES[tripType];
  const TemplateIcon = template.icon;

  const stats = useMemo(() => {
    const activeItems = items.filter((item) => item.status !== "Not needed");
    const ready = activeItems.filter((item) => item.status === "Ready").length;
    const pendingCritical = activeItems.filter((item) => item.priority === "Critical" && item.status !== "Ready").length;
    const sensitive = activeItems.filter((item) => item.sensitive).length;
    const dueSoon = activeItems.filter((item) => item.status !== "Ready" && daysBetween(item.dueDate) <= 7).length;
    const departureIn = daysBetween(trip.departureDate);
    const passportExpiryIn = daysBetween(trip.passportExpiry);
    const passportRisk = passportExpiryIn < 180 && ["international", "visa", "student"].includes(tripType);
    const categories = activeItems.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || { total: 0, ready: 0 };
      acc[item.category].total += 1;
      if (item.status === "Ready") acc[item.category].ready += 1;
      return acc;
    }, {});
    const readiness = activeItems.length ? Math.round((ready / activeItems.length) * 100) : 100;
    return { activeItems, ready, pendingCritical, sensitive, dueSoon, departureIn, passportExpiryIn, passportRisk, categories, readiness };
  }, [items, trip.departureDate, trip.passportExpiry, tripType]);

  const categories = useMemo(() => Object.keys(stats.categories).sort(), [stats.categories]);
  const maxCategory = useMemo(() => Math.max(1, ...Object.values(stats.categories).map((item) => item.total)), [stats.categories]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...items]
      .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => !term || `${item.name} ${item.category} ${item.priority} ${item.note}`.toLowerCase().includes(term))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || daysBetween(a.dueDate) - daysBetween(b.dueDate));
  }, [items, search, categoryFilter, statusFilter]);

  const updateTrip = (key, value) => {
    setTrip((current) => ({ ...current, [key]: value }));
  };

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const changeTripType = (value) => {
    setTripType(value);
    setItems(createItems(value, trip.departureDate));
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const regenerateDueDates = () => {
    setItems((current) =>
      current.map((item) => {
        const due = new Date(`${trip.departureDate}T00:00:00`);
        const offset = item.priority === "Critical" ? -21 : item.priority === "High" ? -14 : item.priority === "Medium" ? -7 : -3;
        due.setDate(due.getDate() + offset);
        return { ...item, dueDate: due.toISOString().slice(0, 10) };
      }),
    );
  };

  const addCustomItem = () => {
    const name = customItem.name.trim();
    if (!name) return;
    setItems((current) => [
      ...current,
      {
        id: makeId("travel-doc"),
        name,
        category: customItem.category.trim() || "Travel",
        priority: customItem.priority,
        note: "Added manually",
        sensitive: false,
        format: customItem.format,
        required: false,
        status: "Pending",
        copies: customItem.priority === "Critical" || customItem.priority === "High" ? 2 : 1,
        dueDate: trip.departureDate,
      },
    ]);
    setCustomItem((current) => ({ ...current, name: "" }));
  };

  const markCriticalReady = () => {
    setItems((current) => current.map((item) => (item.priority === "Critical" ? { ...item, status: "Ready" } : item)));
  };

  const copyChecklist = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildMarkdown(trip, tripType, items, stats));
    }
  };

  const copyPending = async () => {
    const pending = items
      .filter((item) => item.status !== "Ready" && item.status !== "Not needed")
      .map((item) => `- ${item.name} (${item.priority}, due ${item.dueDate})`)
      .join("\n");
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(pending || "All travel documents are ready.");
    }
  };

  const resetSample = () => {
    const nextDeparture = addDaysIso(28);
    setTripType("international");
    setTrip({
      destination: "Dubai, UAE",
      departureDate: nextDeparture,
      returnDate: addDaysIso(34),
      travelers: 2,
      passportExpiry: "2031-08-15",
      contactName: "Emergency Contact",
      contactPhone: "+91 98765 43210",
    });
    setItems(createItems("international", nextDeparture));
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const readinessTone = stats.pendingCritical || stats.passportRisk ? "bad" : stats.readiness < 70 ? "warn" : "good";
  const readinessText =
    stats.passportRisk
      ? "Passport expiry risk for international travel."
      : stats.pendingCritical
        ? `${stats.pendingCritical} critical document(s) still pending.`
        : "Core travel file looks ready.";

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Travel file planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${stats.pendingCritical || stats.passportRisk ? "tool-status-bad" : "tool-status-good"}`}>
              {stats.pendingCritical || stats.passportRisk ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {stats.pendingCritical || stats.passportRisk ? "Action needed" : "Ready track"}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Travel Document Checklist
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Prepare passport, visa, tickets, hotel proof, IDs, insurance, medical papers, forex, emergency contacts, and sensitive copies before departure with a clean readiness dashboard.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={CheckCircle2} label="Readiness" value={`${stats.readiness}%`} detail={`${stats.ready}/${stats.activeItems.length} active documents ready.`} tone={readinessTone} />
          <MetricCard icon={AlertTriangle} label="Critical Pending" value={stats.pendingCritical} detail={readinessText} tone={stats.pendingCritical || stats.passportRisk ? "bad" : "good"} />
          <MetricCard icon={CalendarDays} label="Departure In" value={`${stats.departureIn}d`} detail={`Due soon: ${stats.dueSoon} pending item(s).`} tone={stats.departureIn <= 7 ? "warn" : "info"} />
          <MetricCard icon={ShieldCheck} label="Sensitive Docs" value={stats.sensitive} detail="Mask IDs where accepted before sharing." />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <TemplateIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Trip Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{template.note}</p>
              </div>
            </div>

            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Checklist type</span>
              <select
                value={tripType}
                onChange={(event) => changeTripType(event.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {Object.entries(TRIP_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-6 grid min-w-0 gap-5 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Destination</span>
                <input
                  value={trip.destination}
                  onChange={(event) => updateTrip("destination", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Departure</span>
                <input
                  type="date"
                  value={trip.departureDate}
                  onChange={(event) => updateTrip("departureDate", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Return</span>
                <input
                  type="date"
                  value={trip.returnDate}
                  onChange={(event) => updateTrip("returnDate", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Travelers</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={trip.travelers}
                  onChange={(event) => updateTrip("travelers", Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Passport expiry</span>
                <input
                  type="date"
                  value={trip.passportExpiry}
                  onChange={(event) => updateTrip("passportExpiry", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Emergency contact</span>
                <input
                  value={trip.contactName}
                  onChange={(event) => updateTrip("contactName", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Contact phone</span>
                <input
                  value={trip.contactPhone}
                  onChange={(event) => updateTrip("contactPhone", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={regenerateDueDates}>
                <CalendarDays className="h-4 w-4" />
                Rebuild Dates
              </button>
              <button type="button" className="btn-secondary" onClick={markCriticalReady}>
                <CheckCircle2 className="h-4 w-4" />
                Critical Ready
              </button>
              <button type="button" className="btn-secondary" onClick={copyChecklist}>
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button type="button" className="btn-secondary" onClick={copyPending}>
                <Clipboard className="h-4 w-4" />
                Pending
              </button>
              <button type="button" className="btn-secondary" onClick={() => exportCsv(trip, tripType, items)}>
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button type="button" className="btn-secondary" onClick={resetSample}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Plus className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Add Document</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Add special permits, vouchers, cards, or country-specific travel papers.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Document name</span>
                <input
                  value={customItem.name}
                  onChange={(event) => setCustomItem((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="SIM registration, permit, vaccine proof..."
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Category</span>
                <input
                  value={customItem.category}
                  onChange={(event) => setCustomItem((current) => ({ ...current, category: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Priority</span>
                <select
                  value={customItem.priority}
                  onChange={(event) => setCustomItem((current) => ({ ...current, priority: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Format</span>
                <select
                  value={customItem.format}
                  onChange={(event) => setCustomItem((current) => ({ ...current, format: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {FORMATS.map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="btn-primary mt-4 w-full" onClick={addCustomItem}>
              <Plus className="h-4 w-4" />
              Add Document
            </button>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Travel Safety Signals</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Quick issues to resolve before departure.</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className={`rounded-lg border p-4 ${stats.passportRisk ? "tool-callout-bad" : "tool-callout-good"}`}>
                <p className="text-sm font-black text-[var(--foreground)]">Passport validity</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  {stats.passportRisk ? `Expires in ${stats.passportExpiryIn} days. Many countries need 6 months validity.` : `${stats.passportExpiryIn} days validity remaining.`}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${stats.dueSoon ? "tool-callout-warn" : "tool-callout-good"}`}>
                <p className="text-sm font-black text-[var(--foreground)]">Due soon</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  {stats.dueSoon ? `${stats.dueSoon} pending item(s) should be finished within 7 days.` : "No urgent due-date pressure."}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-black text-[var(--foreground)]">Emergency contact</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{trip.contactName} · {trip.contactPhone}</p>
              </div>
            </div>
          </article>
        </div>

        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                    <ListChecks className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Document Board</h2>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Track required, optional, sensitive, due, and ready documents in one place.</p>
                  </div>
                </div>
              </div>
              <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_150px_150px]">
                <label className="relative block min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    placeholder="Search document..."
                  />
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="all">All status</option>
                  {STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              {filteredItems.map((item) => {
                const dueIn = daysBetween(item.dueDate);
                const dueTone = item.status === "Ready" ? "tool-text-good" : dueIn < 0 ? "tool-text-bad" : dueIn <= 7 ? "tool-text-warn" : "text-[var(--muted-foreground)]";
                return (
                  <article key={item.id} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
                    <div className="tool-form-grid min-w-0 gap-3">
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Document</span>
                        <input
                          value={item.name}
                          onChange={(event) => updateItem(item.id, { name: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Priority</span>
                        <select
                          value={item.priority}
                          onChange={(event) => updateItem(item.id, { priority: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {PRIORITIES.map((priority) => (
                            <option key={priority}>{priority}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Format</span>
                        <select
                          value={item.format}
                          onChange={(event) => updateItem(item.id, { format: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {FORMATS.map((format) => (
                            <option key={format}>{format}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Status</span>
                        <select
                          value={item.status}
                          onChange={(event) => updateItem(item.id, { status: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Copies</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={item.copies}
                          onChange={(event) => updateItem(item.id, { copies: Math.max(0, Math.min(20, Number(event.target.value) || 0)) })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                      <button
                        type="button"
                        className="btn-secondary !h-11 !w-11 !p-0"
                        onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_160px] md:items-center">
                      <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                        <span className="rounded-full bg-[var(--section-highlight)] px-3 py-1 text-[var(--primary)]">{item.category}</span>
                        <span className={`rounded-full px-3 py-1 ${STATUS_TONE[item.status]}`}>{item.status}</span>
                        <span className={`rounded-full bg-[var(--muted)] px-3 py-1 ${dueTone}`}>Due {item.dueDate}</span>
                        {item.required ? <span className="rounded-full tool-status-bad px-3 py-1">Required</span> : <span className="rounded-full bg-[var(--muted)] px-3 py-1">Optional</span>}
                        {item.sensitive ? <span className="rounded-full tool-status-warn px-3 py-1">Sensitive</span> : null}
                      </div>
                      <button
                        type="button"
                        className={`rounded-lg border px-4 py-2 text-sm font-black ${item.status === "Ready" ? "tool-callout-good tool-text-good" : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"}`}
                        onClick={() => updateItem(item.id, { status: item.status === "Ready" ? "Pending" : "Ready" })}
                      >
                        {item.status === "Ready" ? "Ready" : "Mark Ready"}
                      </button>
                    </div>
                    <label className="mt-3 block min-w-0">
                      <span className="sr-only">Document note</span>
                      <textarea
                        value={item.note}
                        onChange={(event) => updateItem(item.id, { note: event.target.value })}
                        className="min-h-16 w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                  </article>
                );
              })}
            </div>
          </article>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[1fr_0.8fr]">
            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <FolderCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Category Readiness</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">See which document group needs attention.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {Object.entries(stats.categories)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([category, value]) => (
                    <CategoryBar key={category} label={category} ready={value.ready} total={value.total} max={maxCategory} />
                  ))}
              </div>
            </article>

            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Travel File Tips</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Keep one clean system for offline and printed backups.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <IdCard className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Mask sensitive IDs</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Use masked Aadhaar/PAN copies where accepted.</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <FileText className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Offline folder</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Save PDFs to phone files, email, and cloud backup.</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <Ticket className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-black text-[var(--foreground)]">Print core docs</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Passport, visa, insurance, tickets, and hotel proof.</p>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
