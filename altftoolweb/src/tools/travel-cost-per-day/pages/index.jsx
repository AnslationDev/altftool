"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  CreditCard,
  Download,
  Filter,
  Hotel,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";

const CURRENCIES = {
  INR: { symbol: "₹", label: "INR" },
  USD: { symbol: "$", label: "USD" },
  EUR: { symbol: "€", label: "EUR" },
  GBP: { symbol: "£", label: "GBP" },
  AED: { symbol: "د.إ", label: "AED" },
};

const TRIP_STYLES = {
  budget: {
    label: "Budget",
    multiplier: 0.85,
    note: "Local stays, public transport, simple food, and controlled experiences.",
  },
  balanced: {
    label: "Balanced",
    multiplier: 1,
    note: "Comfortable hotels, planned food, local transport, and selected activities.",
  },
  comfort: {
    label: "Comfort",
    multiplier: 1.25,
    note: "Better stays, cabs when needed, flexible activities, and higher buffer.",
  },
  premium: {
    label: "Premium",
    multiplier: 1.65,
    note: "Premium stay, curated experiences, relaxed transfers, and extra cash margin.",
  },
};

const MODES = {
  perTrip: "Trip total",
  perDay: "Per day",
  perNight: "Per night",
  perPerson: "Per person",
  perPersonDay: "Person/day",
  percent: "% buffer",
};

const TIMINGS = ["Pre-trip", "On-trip", "Reserve"];

const CATEGORY_META = {
  Transport: { icon: Plane, color: "bg-blue-500" },
  Stay: { icon: Hotel, color: "bg-indigo-500" },
  Food: { icon: Utensils, color: "bg-emerald-500" },
  Activities: { icon: CalendarDays, color: "bg-violet-500" },
  Shopping: { icon: ShoppingBag, color: "bg-amber-500" },
  Documents: { icon: CreditCard, color: "bg-cyan-500" },
  Buffer: { icon: AlertTriangle, color: "bg-rose-500" },
  Other: { icon: Wallet, color: "bg-slate-500" },
};

const DEFAULT_COSTS = [
  { id: "travel", name: "Flights / trains", category: "Transport", mode: "perTrip", amount: 18000, timing: "Pre-trip", active: true },
  { id: "stay", name: "Hotel / stay", category: "Stay", mode: "perNight", amount: 3200, timing: "Pre-trip", active: true },
  { id: "food", name: "Food and drinks", category: "Food", mode: "perPersonDay", amount: 850, timing: "On-trip", active: true },
  { id: "local", name: "Local transport", category: "Transport", mode: "perDay", amount: 900, timing: "On-trip", active: true },
  { id: "activities", name: "Activities / tickets", category: "Activities", mode: "perPerson", amount: 3500, timing: "On-trip", active: true },
  { id: "shopping", name: "Shopping", category: "Shopping", mode: "perPerson", amount: 2500, timing: "On-trip", active: true },
  { id: "docs", name: "Insurance / visa", category: "Documents", mode: "perPerson", amount: 1200, timing: "Pre-trip", active: false },
  { id: "buffer", name: "Emergency buffer", category: "Buffer", mode: "percent", amount: 10, timing: "Reserve", active: true },
];

function formatMoney(value, currency) {
  const symbol = CURRENCIES[currency]?.symbol || "";
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${symbol}${Math.round(safe).toLocaleString("en-IN")}`;
}

function costTotal(cost, trip, baseWithoutPercent, multiplier = 1) {
  if (!cost.active) return 0;
  const amount = (Number(cost.amount) || 0) * multiplier;
  const days = Math.max(1, Number(trip.days) || 1);
  const nights = Math.max(0, Number(trip.nights) || 0);
  const travelers = Math.max(1, Number(trip.travelers) || 1);

  if (cost.mode === "perTrip") return amount;
  if (cost.mode === "perDay") return amount * days;
  if (cost.mode === "perNight") return amount * nights;
  if (cost.mode === "perPerson") return amount * travelers;
  if (cost.mode === "perPersonDay") return amount * travelers * days;
  if (cost.mode === "percent") return (baseWithoutPercent * (Number(cost.amount) || 0)) / 100;
  return amount;
}

function dailyShare(cost, trip, baseWithoutPercent, multiplier = 1) {
  const total = costTotal(cost, trip, baseWithoutPercent, multiplier);
  const days = Math.max(1, Number(trip.days) || 1);
  if (cost.mode === "perNight") return total / days;
  if (cost.mode === "perTrip" || cost.mode === "perPerson" || cost.mode === "percent") return total / days;
  return total / days;
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

function buildSummary(trip, costs, stats) {
  return [
    `# Travel Cost Per Day - ${trip.destination || "Untitled Trip"}`,
    `Duration: ${trip.days} day(s), ${trip.nights} night(s)`,
    `Travelers: ${trip.travelers}`,
    `Style: ${TRIP_STYLES[trip.style]?.label}`,
    `Total cost: ${formatMoney(stats.totalCost, trip.currency)}`,
    `Per day: ${formatMoney(stats.perDay, trip.currency)}`,
    `Per person per day: ${formatMoney(stats.perPersonDay, trip.currency)}`,
    `Daily target: ${formatMoney(trip.dailyTarget, trip.currency)}`,
    "",
    "## Cost Items",
    ...costs
      .filter((cost) => cost.active)
      .map((cost) => `- ${cost.name}: ${formatMoney(stats.byId[cost.id], trip.currency)} (${MODES[cost.mode]}, ${cost.timing})`),
  ].join("\n");
}

function exportCsv(trip, costs, stats) {
  const rows = [
    ["Destination", "Cost Name", "Category", "Mode", "Base Amount", "Calculated Total", "Timing", "Active"],
    ...costs.map((cost) => [
      trip.destination,
      cost.name,
      cost.category,
      MODES[cost.mode],
      cost.amount,
      stats.byId[cost.id] || 0,
      cost.timing,
      cost.active ? "Yes" : "No",
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile("travel-cost-per-day.csv", csv, "text/csv");
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function CategoryBar({ label, value, max, currency }) {
  const meta = CATEGORY_META[label] || CATEGORY_META.Other;
  const Icon = meta.icon;
  const width = max ? Math.max(8, Math.round((value / max) * 100)) : 0;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[var(--foreground)]">
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-white ${meta.color}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 break-words">{label}</span>
        </span>
        <span className="shrink-0 text-sm font-black text-[var(--primary)]">{formatMoney(value, currency)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function TimingTile({ label, value, total, currency }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-[var(--foreground)]">{formatMoney(value, currency)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--muted-foreground)]">{percent}% of trip cost</p>
    </article>
  );
}

export default function TravelCostPerDay() {
  const [trip, setTrip] = useState({
    destination: "Goa, India",
    days: 5,
    nights: 4,
    travelers: 2,
    currency: "INR",
    style: "balanced",
    dailyTarget: 6500,
    cashInHand: 30000,
  });
  const [costs, setCosts] = useState(DEFAULT_COSTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newCost, setNewCost] = useState({
    name: "",
    category: "Other",
    mode: "perTrip",
    amount: 1000,
    timing: "On-trip",
  });

  const style = TRIP_STYLES[trip.style];

  const stats = useMemo(() => {
    const multiplier = style?.multiplier || 1;
    const baseWithoutPercent = costs
      .filter((cost) => cost.mode !== "percent")
      .reduce((sum, cost) => sum + costTotal(cost, trip, 0, multiplier), 0);
    const byId = {};
    const categoryTotals = {};
    const timingTotals = TIMINGS.reduce((acc, timing) => ({ ...acc, [timing]: 0 }), {});
    let totalCost = 0;

    costs.forEach((cost) => {
      const total = costTotal(cost, trip, baseWithoutPercent, multiplier);
      byId[cost.id] = total;
      totalCost += total;
      if (cost.active) {
        categoryTotals[cost.category] = (categoryTotals[cost.category] || 0) + total;
        timingTotals[cost.timing] = (timingTotals[cost.timing] || 0) + total;
      }
    });

    const days = Math.max(1, Number(trip.days) || 1);
    const travelers = Math.max(1, Number(trip.travelers) || 1);
    const perDay = totalCost / days;
    const perPerson = totalCost / travelers;
    const perPersonDay = totalCost / travelers / days;
    const targetGap = perDay - (Number(trip.dailyTarget) || 0);
    const cashGap = timingTotals["On-trip"] + timingTotals.Reserve - (Number(trip.cashInHand) || 0);
    const dailyRows = Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const dayTotal = costs.reduce((sum, cost) => sum + dailyShare(cost, trip, baseWithoutPercent, multiplier), 0);
      return { day, total: dayTotal };
    });

    return {
      baseWithoutPercent,
      byId,
      categoryTotals,
      timingTotals,
      totalCost,
      perDay,
      perPerson,
      perPersonDay,
      targetGap,
      cashGap,
      dailyRows,
    };
  }, [costs, trip, style]);

  const categories = useMemo(
    () => Array.from(new Set([...Object.keys(CATEGORY_META), ...costs.map((cost) => cost.category)])).sort(),
    [costs],
  );
  const maxCategory = useMemo(() => Math.max(1, ...Object.values(stats.categoryTotals)), [stats.categoryTotals]);

  const filteredCosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return costs
      .filter((cost) => categoryFilter === "all" || cost.category === categoryFilter)
      .filter((cost) => !term || `${cost.name} ${cost.category} ${cost.mode} ${cost.timing}`.toLowerCase().includes(term));
  }, [costs, search, categoryFilter]);

  const updateTrip = (key, value) => {
    setTrip((current) => ({ ...current, [key]: value }));
  };

  const updateCost = (id, patch) => {
    setCosts((current) => current.map((cost) => (cost.id === id ? { ...cost, ...patch } : cost)));
  };

  const addCost = () => {
    const name = newCost.name.trim();
    if (!name) return;
    setCosts((current) => [
      ...current,
      {
        id: makeId("cost"),
        name,
        category: newCost.category.trim() || "Other",
        mode: newCost.mode,
        amount: Math.max(0, Number(newCost.amount) || 0),
        timing: newCost.timing,
        active: true,
      },
    ]);
    setNewCost((current) => ({ ...current, name: "" }));
  };

  const copySummary = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildSummary(trip, costs, stats));
    }
  };

  const resetSample = () => {
    setTrip({
      destination: "Goa, India",
      days: 5,
      nights: 4,
      travelers: 2,
      currency: "INR",
      style: "balanced",
      dailyTarget: 6500,
      cashInHand: 30000,
    });
    setCosts(DEFAULT_COSTS);
    setSearch("");
    setCategoryFilter("all");
  };

  const dailyTone = stats.targetGap > 0 ? "warn" : "good";
  const cashTone = stats.cashGap > 0 ? "warn" : "good";
  const capText =
    stats.targetGap > 0
      ? `${formatMoney(stats.targetGap, trip.currency)} over your daily target.`
      : `${formatMoney(Math.abs(stats.targetGap), trip.currency)} under your daily target.`;

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Smart travel spend planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${stats.targetGap > 0 ? "tool-status-warn" : "tool-status-good"}`}>
              {stats.targetGap > 0 ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {stats.targetGap > 0 ? "Above daily cap" : "Within daily cap"}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Travel Cost Per Day
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Turn trip costs into a clear daily number. Compare total spend, cost per day, per-person/day split, category load, payment timing, and cash needed during travel.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={Wallet} label="Total Trip Cost" value={formatMoney(stats.totalCost, trip.currency)} detail={`${trip.days} days, ${trip.travelers} traveler(s).`} />
          <MetricCard icon={CalendarDays} label="Cost Per Day" value={formatMoney(stats.perDay, trip.currency)} detail={capText} tone={dailyTone} />
          <MetricCard icon={Users} label="Person / Day" value={formatMoney(stats.perPersonDay, trip.currency)} detail={`${formatMoney(stats.perPerson, trip.currency)} per traveler total.`} />
          <MetricCard icon={CreditCard} label="Cash Gap" value={stats.cashGap > 0 ? formatMoney(stats.cashGap, trip.currency) : "Covered"} detail="On-trip plus reserve minus cash in hand." tone={cashTone} />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Calculator className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Trip Inputs</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{style.note}</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Destination</span>
                <input
                  value={trip.destination}
                  onChange={(event) => updateTrip("destination", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Days</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={trip.days}
                  onChange={(event) => updateTrip("days", Math.max(1, Math.min(90, Number(event.target.value) || 1)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Nights</span>
                <input
                  type="number"
                  min="0"
                  max="89"
                  value={trip.nights}
                  onChange={(event) => updateTrip("nights", Math.max(0, Math.min(89, Number(event.target.value) || 0)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Travelers</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={trip.travelers}
                  onChange={(event) => updateTrip("travelers", Math.max(1, Math.min(30, Number(event.target.value) || 1)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Currency</span>
                <select
                  value={trip.currency}
                  onChange={(event) => updateTrip("currency", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(CURRENCIES).map(([key, currency]) => (
                    <option key={key} value={key}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Travel style</span>
                <select
                  value={trip.style}
                  onChange={(event) => updateTrip("style", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(TRIP_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label} - {Math.round(item.multiplier * 100)}%
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Daily target</span>
                <input
                  type="number"
                  min="0"
                  value={trip.dailyTarget}
                  onChange={(event) => updateTrip("dailyTarget", Math.max(0, Number(event.target.value) || 0))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Cash in hand</span>
                <input
                  type="number"
                  min="0"
                  value={trip.cashInHand}
                  onChange={(event) => updateTrip("cashInHand", Math.max(0, Number(event.target.value) || 0))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={copySummary}>
                <Clipboard className="h-4 w-4" />
                Copy Summary
              </button>
              <button type="button" className="btn-secondary" onClick={() => exportCsv(trip, costs, stats)}>
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
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Add Cost</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Add rentals, SIM cards, permits, tips, or any custom spend.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Cost name</span>
                <input
                  value={newCost.name}
                  onChange={(event) => setNewCost((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Bike rental, SIM, airport cab..."
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Category</span>
                <input
                  value={newCost.category}
                  onChange={(event) => setNewCost((current) => ({ ...current, category: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Mode</span>
                <select
                  value={newCost.mode}
                  onChange={(event) => setNewCost((current) => ({ ...current, mode: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(MODES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Amount</span>
                <input
                  type="number"
                  min="0"
                  value={newCost.amount}
                  onChange={(event) => setNewCost((current) => ({ ...current, amount: Math.max(0, Number(event.target.value) || 0) }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Timing</span>
                <select
                  value={newCost.timing}
                  onChange={(event) => setNewCost((current) => ({ ...current, timing: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {TIMINGS.map((timing) => (
                    <option key={timing}>{timing}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="btn-primary mt-4 w-full" onClick={addCost}>
              <Plus className="h-4 w-4" />
              Add Cost
            </button>
          </article>
        </div>

        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                    <Filter className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Cost Planner</h2>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Turn each expense into a daily and per-person cost.</p>
                  </div>
                </div>
              </div>
              <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
                <label className="relative block min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    placeholder="Search cost..."
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
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              {filteredCosts.map((cost) => {
                const meta = CATEGORY_META[cost.category] || CATEGORY_META.Other;
                const Icon = meta.icon;
                return (
                  <article key={cost.id} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
                    <div className="tool-form-grid min-w-0 gap-3">
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Cost</span>
                        <input
                          value={cost.name}
                          onChange={(event) => updateCost(cost.id, { name: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Category</span>
                        <input
                          value={cost.category}
                          onChange={(event) => updateCost(cost.id, { category: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Mode</span>
                        <select
                          value={cost.mode}
                          onChange={(event) => updateCost(cost.id, { mode: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {Object.entries(MODES).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Amount</span>
                        <input
                          type="number"
                          min="0"
                          value={cost.amount}
                          onChange={(event) => updateCost(cost.id, { amount: Math.max(0, Number(event.target.value) || 0) })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Timing</span>
                        <select
                          value={cost.timing}
                          onChange={(event) => updateCost(cost.id, { timing: event.target.value })}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {TIMINGS.map((timing) => (
                            <option key={timing}>{timing}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="btn-secondary !h-11 !w-11 !p-0"
                        onClick={() => setCosts((current) => current.filter((entry) => entry.id !== cost.id))}
                        aria-label={`Delete ${cost.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-white ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {cost.category}
                      </span>
                      <span className="rounded-full bg-[var(--muted)] px-3 py-1">Total {formatMoney(stats.byId[cost.id], trip.currency)}</span>
                      <span className="rounded-full bg-[var(--muted)] px-3 py-1">
                        Day {formatMoney((stats.byId[cost.id] || 0) / Math.max(1, Number(trip.days) || 1), trip.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCost(cost.id, { active: !cost.active })}
                        className={`rounded-full px-3 py-1 font-bold ${cost.active ? "tool-status-good" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}
                      >
                        {cost.active ? "Active" : "Paused"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[1fr_0.8fr]">
            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Category Breakdown</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Which part of the trip is driving daily cost.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {Object.entries(stats.categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, value]) => (
                    <CategoryBar key={category} label={category} value={value} max={maxCategory} currency={trip.currency} />
                  ))}
              </div>
            </article>

            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Target className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Payment Timing</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Know what is prepaid and what you need during travel.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {TIMINGS.map((timing) => (
                  <TimingTile key={timing} label={timing} value={stats.timingTotals[timing] || 0} total={stats.totalCost} currency={trip.currency} />
                ))}
              </div>
            </article>
          </section>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Daily Spread</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Average cost pressure across every travel day.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {stats.dailyRows.slice(0, 12).map((row) => {
                const percent = trip.dailyTarget ? Math.min(140, Math.round((row.total / trip.dailyTarget) * 100)) : 0;
                const over = row.total > Number(trip.dailyTarget || 0);
                return (
                  <div key={row.day} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-[var(--foreground)]">Day {row.day}</p>
                      <p className={`text-sm font-black ${over ? "tool-text-warn" : "tool-text-good"}`}>
                        {formatMoney(row.total, trip.currency)}
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div className={`h-full rounded-full ${over ? "bg-amber-500" : "bg-[var(--primary)]"}`} style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
