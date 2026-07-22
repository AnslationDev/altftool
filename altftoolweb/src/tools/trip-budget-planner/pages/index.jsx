"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  Clipboard,
  Coins,
  CreditCard,
  Download,
  Filter,
  Hotel,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";

const CURRENCIES = {
  INR: { symbol: "₹", label: "Indian Rupee" },
  USD: { symbol: "$", label: "US Dollar" },
  EUR: { symbol: "€", label: "Euro" },
  GBP: { symbol: "£", label: "British Pound" },
  AED: { symbol: "د.إ", label: "UAE Dirham" },
};

const TRIP_STYLES = {
  budget: {
    label: "Budget",
    multiplier: 0.82,
    note: "Hostels, local transport, street food, and careful daily spending.",
  },
  balanced: {
    label: "Balanced",
    multiplier: 1,
    note: "Comfortable stay, planned activities, and controlled extras.",
  },
  comfort: {
    label: "Comfort",
    multiplier: 1.28,
    note: "Better hotels, cabs when needed, and a relaxed food/activity budget.",
  },
  premium: {
    label: "Premium",
    multiplier: 1.72,
    note: "Premium stays, flexible transport, curated experiences, and higher buffer.",
  },
};

const DEFAULT_EXPENSES = [
  ["Flights / trains", "Transport", "perTrip", 18000, true, "Pre-trip", Plane, "Book early and keep ticket PDFs offline."],
  ["Hotel / stay", "Stay", "perNight", 3200, true, "Pre-trip", Hotel, "Use nights, not days, for stay cost."],
  ["Meals", "Food", "perPersonDay", 850, true, "On-trip", Utensils, "Breakfast, lunch, dinner, and small snacks."],
  ["Local transport", "Transport", "perDay", 900, true, "On-trip", Car, "Cabs, metro, rentals, parking, fuel."],
  ["Activities / tickets", "Experiences", "perPerson", 3500, true, "On-trip", Ticket, "Tours, entry fees, shows, adventure bookings."],
  ["Shopping", "Shopping", "perPerson", 2500, true, "On-trip", ShoppingBag, "Souvenirs and unplanned purchases."],
  ["Insurance / visa", "Documents", "perPerson", 1200, false, "Pre-trip", ShieldCheck, "Visa, insurance, permits, SIM, or ID fees."],
  ["Emergency buffer", "Buffer", "percent", 10, true, "Reserve", AlertTriangle, "Calculated on active planned expenses."],
];

const MODE_LABELS = {
  perTrip: "Trip total",
  perDay: "Per day",
  perNight: "Per night",
  perPerson: "Per person",
  perPersonDay: "Person/day",
  percent: "% buffer",
};

const PAYMENT_LABELS = ["Pre-trip", "On-trip", "Reserve"];
const CATEGORY_TONES = {
  Transport: "bg-blue-500",
  Stay: "bg-indigo-500",
  Food: "bg-emerald-500",
  Experiences: "bg-violet-500",
  Shopping: "bg-amber-500",
  Documents: "bg-cyan-500",
  Buffer: "bg-rose-500",
};

function createExpense(row, index) {
  const [name, category, mode, amount, active, payment, Icon, note] = row;
  return {
    id: `${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    category,
    mode,
    amount,
    active,
    payment,
    note,
    iconName: Icon.displayName || Icon.name,
  };
}

function formatMoney(value, currency) {
  const symbol = CURRENCIES[currency]?.symbol || "";
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${symbol}${Math.round(safe).toLocaleString("en-IN")}`;
}

function expenseTotal(expense, trip, baseWithoutPercent) {
  if (!expense.active) return 0;
  const amount = Number(expense.amount) || 0;
  const days = Math.max(1, Number(trip.days) || 1);
  const nights = Math.max(0, Number(trip.nights) || 0);
  const travelers = Math.max(1, Number(trip.travelers) || 1);

  if (expense.mode === "perTrip") return amount;
  if (expense.mode === "perDay") return amount * days;
  if (expense.mode === "perNight") return amount * nights;
  if (expense.mode === "perPerson") return amount * travelers;
  if (expense.mode === "perPersonDay") return amount * travelers * days;
  if (expense.mode === "percent") return (baseWithoutPercent * amount) / 100;
  return amount;
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

function exportCsv(trip, expenses, totals) {
  const rows = [
    ["Destination", "Expense", "Category", "Mode", "Amount", "Calculated Total", "Payment", "Active", "Note"],
    ...expenses.map((expense) => [
      trip.destination,
      expense.name,
      expense.category,
      MODE_LABELS[expense.mode],
      expense.amount,
      totals.byId[expense.id],
      expense.payment,
      expense.active ? "Yes" : "No",
      expense.note,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile("trip-budget-plan.csv", csv, "text/csv");
}

function buildSummary(trip, expenses, totals) {
  return [
    `# Trip Budget Plan - ${trip.destination || "Untitled Trip"}`,
    `Travelers: ${trip.travelers}`,
    `Duration: ${trip.days} day(s), ${trip.nights} night(s)`,
    `Style: ${TRIP_STYLES[trip.style]?.label}`,
    `Total budget: ${formatMoney(totals.total, trip.currency)}`,
    `Per person: ${formatMoney(totals.perPerson, trip.currency)}`,
    `Per day: ${formatMoney(totals.perDay, trip.currency)}`,
    `Budget target gap: ${formatMoney(totals.gap, trip.currency)}`,
    "",
    "## Expense Breakdown",
    ...expenses
      .filter((expense) => expense.active)
      .map((expense) => `- ${expense.name}: ${formatMoney(totals.byId[expense.id], trip.currency)} (${MODE_LABELS[expense.mode]})`),
  ].join("\n");
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

function CategoryBar({ label, amount, max, currency }) {
  const width = max ? Math.max(8, Math.round((amount / max) * 100)) : 0;
  const tone = CATEGORY_TONES[label] || "bg-[var(--primary)]";
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-bold text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 text-sm font-black text-[var(--primary)]">{formatMoney(amount, currency)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PaymentTile({ label, value, total, currency }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-[var(--foreground)]">{formatMoney(value, currency)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--muted-foreground)]">{percent}% of total</p>
    </article>
  );
}

export default function TripBudgetPlanner() {
  const [trip, setTrip] = useState({
    destination: "Goa, India",
    travelers: 2,
    days: 5,
    nights: 4,
    currency: "INR",
    style: "balanced",
    targetBudget: 65000,
    savedAmount: 25000,
  });
  const [expenses, setExpenses] = useState(() => DEFAULT_EXPENSES.map(createExpense));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState(1000);

  const style = TRIP_STYLES[trip.style];

  const totals = useMemo(() => {
    const styleMultiplier = style?.multiplier || 1;
    const nonPercentBase = expenses
      .filter((expense) => expense.mode !== "percent")
      .reduce((sum, expense) => sum + expenseTotal({ ...expense, amount: Number(expense.amount) * styleMultiplier }, trip, 0), 0);

    const byId = {};
    expenses.forEach((expense) => {
      const scaled = expense.mode === "percent" ? expense : { ...expense, amount: Number(expense.amount) * styleMultiplier };
      byId[expense.id] = expenseTotal(scaled, trip, nonPercentBase);
    });

    const total = Object.values(byId).reduce((sum, value) => sum + value, 0);
    const travelers = Math.max(1, Number(trip.travelers) || 1);
    const days = Math.max(1, Number(trip.days) || 1);
    const target = Number(trip.targetBudget) || 0;
    const saved = Number(trip.savedAmount) || 0;
    const categoryTotals = expenses.reduce((acc, expense) => {
      if (!expense.active) return acc;
      acc[expense.category] = (acc[expense.category] || 0) + byId[expense.id];
      return acc;
    }, {});
    const paymentTotals = expenses.reduce((acc, expense) => {
      if (!expense.active) return acc;
      acc[expense.payment] = (acc[expense.payment] || 0) + byId[expense.id];
      return acc;
    }, {});

    return {
      byId,
      total,
      perPerson: total / travelers,
      perDay: total / days,
      gap: total - target,
      savingsGap: total - saved,
      target,
      saved,
      categoryTotals,
      paymentTotals,
    };
  }, [expenses, style, trip]);

  const categories = useMemo(() => [...new Set(expenses.map((expense) => expense.category))].sort(), [expenses]);
  const maxCategory = useMemo(() => Math.max(1, ...Object.values(totals.categoryTotals)), [totals.categoryTotals]);

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return expenses
      .filter((expense) => categoryFilter === "all" || expense.category === categoryFilter)
      .filter((expense) => !term || `${expense.name} ${expense.category} ${expense.note}`.toLowerCase().includes(term));
  }, [categoryFilter, expenses, search]);

  const updateTrip = (key, value) => {
    setTrip((current) => ({ ...current, [key]: value }));
  };

  const updateExpense = (id, patch) => {
    setExpenses((current) => current.map((expense) => (expense.id === id ? { ...expense, ...patch } : expense)));
  };

  const resetExpenses = () => {
    setExpenses(DEFAULT_EXPENSES.map(createExpense));
    setSearch("");
    setCategoryFilter("all");
  };

  const addCustomExpense = () => {
    const name = customName.trim();
    if (!name) return;
    setExpenses((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name,
        category: "Extras",
        mode: "perTrip",
        amount: Math.max(0, Number(customAmount) || 0),
        active: true,
        payment: "On-trip",
        note: "Added manually",
        iconName: "Coins",
      },
    ]);
    setCustomName("");
    setCustomAmount(1000);
  };

  const copySummary = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildSummary(trip, expenses, totals));
    }
  };

  const budgetTone = totals.gap > 0 ? "bad" : "good";
  const savingsTone = totals.savingsGap > 0 ? "warn" : "good";

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Smart travel finance planner</span>
            </span>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full tool-status-good px-4 py-2 text-xs font-bold uppercase tracking-wide">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {style.label} mode
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Trip Budget Planner
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Plan trip costs with travelers, nights, budget style, editable categories, contingency, pre-trip spend, on-trip cash need, and export-ready budget summaries.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={Wallet} label="Total Trip Cost" value={formatMoney(totals.total, trip.currency)} detail={`${formatMoney(totals.perPerson, trip.currency)} per person.`} />
          <MetricCard icon={Users} label="Per Person" value={formatMoney(totals.perPerson, trip.currency)} detail={`${trip.travelers} traveler budget split.`} />
          <MetricCard icon={CalendarDays} label="Per Day" value={formatMoney(totals.perDay, trip.currency)} detail={`${trip.days} day plan.`} />
          <MetricCard icon={TrendingUp} label="Target Gap" value={formatMoney(Math.abs(totals.gap), trip.currency)} detail={totals.gap > 0 ? "Above target budget." : "Inside target budget."} tone={budgetTone} />
        </section>
      </header>

      <section className="tool-feature-grid mt-8 min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Plane className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Trip Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{style.note}</p>
              </div>
            </div>

            <div className="tool-compact-grid min-w-0">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Destination</span>
                <input
                  value={trip.destination}
                  onChange={(event) => updateTrip("destination", event.target.value)}
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
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Days</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={trip.days}
                  onChange={(event) => {
                    const days = Math.max(1, Math.min(90, Number(event.target.value) || 1));
                    setTrip((current) => ({ ...current, days, nights: Math.min(current.nights, Math.max(0, days - 1)) }));
                  }}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Nights</span>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={trip.nights}
                  onChange={(event) => updateTrip("nights", Math.max(0, Math.min(90, Number(event.target.value) || 0)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Currency</span>
                <select
                  value={trip.currency}
                  onChange={(event) => updateTrip("currency", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  {Object.entries(CURRENCIES).map(([code, currency]) => (
                    <option key={code} value={code}>
                      {code} - {currency.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Travel style</span>
                <select
                  value={trip.style}
                  onChange={(event) => updateTrip("style", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  {Object.entries(TRIP_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Budget Controls</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Compare plan against your target and saved amount.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Target budget</span>
                <input
                  type="number"
                  min="0"
                  value={trip.targetBudget}
                  onChange={(event) => updateTrip("targetBudget", Math.max(0, Number(event.target.value) || 0))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Already saved</span>
                <input
                  type="number"
                  min="0"
                  value={trip.savedAmount}
                  onChange={(event) => updateTrip("savedAmount", Math.max(0, Number(event.target.value) || 0))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </label>
            </div>
            <div className="tool-compact-grid mt-4 min-w-0">
              <article className={`min-w-0 rounded-lg border p-4 ${budgetTone === "bad" ? "tool-callout-bad" : "tool-callout-good"}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--background)] text-[var(--primary)]">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Target Status</p>
                    <div className="mt-2 flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                      <p className="text-xl font-black leading-tight text-[var(--foreground)]">{totals.gap > 0 ? "Over" : "Inside"}</p>
                      <p className="whitespace-nowrap text-base font-black leading-tight text-[var(--foreground)]">
                        {formatMoney(Math.abs(totals.gap), trip.currency)}
                      </p>
                    </div>
                    <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                      {totals.gap > 0 ? "Above target budget." : "Below target budget."}
                    </p>
                  </div>
                </div>
              </article>

              <article className={`min-w-0 rounded-lg border p-4 ${savingsTone === "warn" ? "tool-callout-warn" : "tool-callout-good"}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--background)] text-[var(--primary)]">
                    <Coins className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Savings Gap</p>
                    <p className="mt-2 whitespace-nowrap text-xl font-black leading-tight text-[var(--foreground)]">
                      {formatMoney(Math.max(0, totals.savingsGap), trip.currency)}
                    </p>
                    <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">Extra amount needed before trip.</p>
                  </div>
                </div>
              </article>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Plus className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Custom Expense</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Add one-off costs like SIM, luggage, parking, or gifts.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
              <input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                placeholder="Expense name"
              />
              <input
                type="number"
                min="0"
                value={customAmount}
                onChange={(event) => setCustomAmount(Math.max(0, Number(event.target.value) || 0))}
                className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <button type="button" className="btn-primary mt-3 w-full" onClick={addCustomExpense}>
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </article>
      </section>

      <section className="tool-card mt-8 min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 flex-col gap-4 lg:flex-row 2xl:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Expense Planner</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Toggle costs, change calculation mode, and tune every category.</p>
            </div>
            <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
              <label className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  placeholder="Search expense"
                />
              </label>
              <label className="relative min-w-0">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <article key={expense.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
                <div className="grid min-w-0 gap-4">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <label className="flex min-w-0 items-center gap-2">
                        <input
                          type="checkbox"
                          checked={expense.active}
                          onChange={(event) => updateExpense(expense.id, { active: event.target.checked })}
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="min-w-0 break-words text-lg font-black text-[var(--foreground)]">{expense.name}</span>
                      </label>
                      <span className="rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
                        {expense.category}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{expense.note}</p>
                  </div>

                  <div className="tool-form-grid min-w-0">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Amount</span>
                      <input
                        type="number"
                        min="0"
                        value={expense.amount}
                        onChange={(event) => updateExpense(expense.id, { amount: Math.max(0, Number(event.target.value) || 0) })}
                        className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Mode</span>
                      <select
                        value={expense.mode}
                        onChange={(event) => updateExpense(expense.id, { mode: event.target.value })}
                        className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                      >
                        {Object.entries(MODE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block min-w-0 col-span-2 sm:col-span-1">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Payment</span>
                      <select
                        value={expense.payment}
                        onChange={(event) => updateExpense(expense.id, { payment: event.target.value })}
                        className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                      >
                        {PAYMENT_LABELS.map((label) => (
                          <option key={label}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Total</p>
                      <p className="mt-1 whitespace-nowrap text-base font-black text-[var(--foreground)]">
                        {formatMoney(totals.byId[expense.id], trip.currency)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary h-10 justify-self-start px-3"
                    onClick={() => setExpenses((current) => current.filter((row) => row.id !== expense.id))}
                    aria-label="Remove expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
      </section>

      <section className="mt-8 grid min-w-0 gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <article className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
              <Coins className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Budget Breakdown</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">See where the trip money is going.</p>
            </div>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {Object.entries(totals.categoryTotals).map(([category, amount]) => (
              <CategoryBar key={category} label={category} amount={amount} max={maxCategory} currency={trip.currency} />
            ))}
          </div>
        </article>

        <aside className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
              <Wallet className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Cash Flow</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Separate prepaid, on-trip, and reserve money.</p>
            </div>
          </div>
          <div className="grid min-w-0 gap-3">
            {PAYMENT_LABELS.map((label) => (
              <PaymentTile key={label} label={label} value={totals.paymentTotals[label] || 0} total={totals.total} currency={trip.currency} />
            ))}
          </div>
          <div className="tool-action-grid mt-5">
            <button type="button" className="btn-secondary" onClick={resetExpenses}>
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button type="button" className="btn-secondary" onClick={copySummary}>
              <Clipboard className="h-4 w-4" />
              Copy
            </button>
            <button type="button" className="btn-primary" onClick={() => exportCsv(trip, expenses, totals)}>
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
