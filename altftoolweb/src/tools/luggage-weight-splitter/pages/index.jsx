"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clipboard,
  Download,
  Filter,
  Gauge,
  Luggage,
  PackagePlus,
  Plane,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Weight,
} from "lucide-react";

const AIRLINE_PRESETS = {
  domestic: {
    label: "India domestic",
    cabin: 7,
    checked: 15,
    note: "Common cabin and checked baggage split for short domestic trips.",
  },
  international: {
    label: "International economy",
    cabin: 7,
    checked: 23,
    note: "Useful for long-haul economy routes with one checked bag.",
  },
  lowCost: {
    label: "Low-cost carrier",
    cabin: 7,
    checked: 20,
    note: "Good for budget airlines where every extra kilo matters.",
  },
  custom: {
    label: "Custom limits",
    cabin: 8,
    checked: 20,
    note: "Use your ticket allowance when the airline has special rules.",
  },
};

const DEFAULT_BAGS = [
  { id: "cabin-a", name: "Cabin Bag", traveler: "Saurabh", type: "Cabin", limit: 7 },
  { id: "check-a", name: "Checked Bag", traveler: "Saurabh", type: "Checked", limit: 15 },
  { id: "check-b", name: "Family Checked", traveler: "Anu", type: "Checked", limit: 15 },
];

const DEFAULT_ITEMS = [
  { id: "laptop", name: "Laptop + charger", category: "Tech", weight: 2.1, qty: 1, owner: "Saurabh", priority: "High", bagId: "cabin-a" },
  { id: "clothes-a", name: "Clothes set", category: "Clothing", weight: 0.42, qty: 8, owner: "Saurabh", priority: "High", bagId: "check-a" },
  { id: "toiletries", name: "Toiletry pouch", category: "Toiletries", weight: 0.75, qty: 1, owner: "Shared", priority: "Medium", bagId: "check-a" },
  { id: "shoes", name: "Extra shoes", category: "Footwear", weight: 1.15, qty: 1, owner: "Saurabh", priority: "Medium", bagId: "check-a" },
  { id: "documents", name: "Documents pouch", category: "Documents", weight: 0.25, qty: 1, owner: "Shared", priority: "High", bagId: "cabin-a" },
  { id: "snacks", name: "Snacks pack", category: "Food", weight: 0.9, qty: 1, owner: "Shared", priority: "Low", bagId: "check-b" },
  { id: "gifts", name: "Gifts / shopping", category: "Extras", weight: 2.8, qty: 1, owner: "Anu", priority: "Low", bagId: "check-b" },
  { id: "jacket", name: "Jacket", category: "Clothing", weight: 0.9, qty: 1, owner: "Anu", priority: "Medium", bagId: "check-b" },
];

const CATEGORY_COLORS = {
  Clothing: "bg-blue-500",
  Tech: "bg-indigo-500",
  Toiletries: "bg-cyan-500",
  Footwear: "bg-amber-500",
  Documents: "bg-emerald-500",
  Food: "bg-violet-500",
  Extras: "bg-rose-500",
};

const PRIORITIES = ["High", "Medium", "Low"];
const BAG_TYPES = ["Cabin", "Checked", "Backpack", "Personal"];

function formatKg(value, digits = 1) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safe.toFixed(digits)} kg`;
}

function itemTotal(item) {
  return (Number(item.weight) || 0) * (Number(item.qty) || 0);
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

function buildSummary(bags, items, stats) {
  return [
    "# Luggage Weight Split Plan",
    `Total packed weight: ${formatKg(stats.totalWeight)}`,
    `Allowance used: ${stats.totalLimit ? Math.round((stats.totalWeight / stats.totalLimit) * 100) : 0}%`,
    `Overweight bags: ${stats.overweightBags.length}`,
    "",
    "## Bags",
    ...bags.map((bag) => {
      const total = stats.bagTotals[bag.id] || 0;
      const left = bag.limit - total;
      return `- ${bag.name} (${bag.traveler}, ${bag.type}): ${formatKg(total)} / ${formatKg(bag.limit)} (${left >= 0 ? `${formatKg(left)} left` : `${formatKg(Math.abs(left))} over`})`;
    }),
    "",
    "## Items",
    ...items.map((item) => `- ${item.name} x${item.qty}: ${formatKg(itemTotal(item))} -> ${bags.find((bag) => bag.id === item.bagId)?.name || "Unassigned"}`),
  ].join("\n");
}

function exportCsv(bags, items, stats) {
  const rows = [
    ["Bag", "Traveler", "Type", "Limit kg", "Item", "Category", "Owner", "Priority", "Qty", "Weight each kg", "Total kg", "Bag total kg"],
    ...items.map((item) => {
      const bag = bags.find((entry) => entry.id === item.bagId);
      return [
        bag?.name || "Unassigned",
        bag?.traveler || "",
        bag?.type || "",
        bag?.limit || "",
        item.name,
        item.category,
        item.owner,
        item.priority,
        item.qty,
        item.weight,
        itemTotal(item).toFixed(2),
        bag ? (stats.bagTotals[bag.id] || 0).toFixed(2) : "0",
      ];
    }),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile("luggage-weight-split.csv", csv, "text/csv");
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

function BagCard({ bag, total, itemCount, onChange, onDelete }) {
  const percent = bag.limit ? Math.min(140, Math.round((total / bag.limit) * 100)) : 0;
  const over = total > bag.limit;
  const close = !over && total >= bag.limit * 0.85;
  const tone = over ? "bg-rose-500" : close ? "bg-amber-500" : "bg-[var(--primary)]";

  return (
    <article className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Bag name</span>
            <input
              value={bag.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
          </label>
        </div>
        <button type="button" className="btn-secondary !h-11 !w-11 !p-0" onClick={onDelete} aria-label={`Delete ${bag.name}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-2 gap-3">
        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Traveler</span>
          <input
            value={bag.traveler}
            onChange={(event) => onChange({ traveler: event.target.value })}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Type</span>
          <select
            value={bag.type}
            onChange={(event) => onChange({ type: event.target.value })}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          >
            {BAG_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Limit kg</span>
          <input
            type="number"
            min="1"
            step="0.5"
            value={bag.limit}
            onChange={(event) => onChange({ limit: Math.max(1, Number(event.target.value) || 1) })}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </label>
        <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--section-highlight)] px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Items</p>
          <p className="mt-1 text-lg font-black text-[var(--foreground)]">{itemCount}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className={`text-sm font-black ${over ? "tool-text-bad" : "text-[var(--foreground)]"}`}>
            {formatKg(total)} / {formatKg(bag.limit)}
          </p>
          <p className="shrink-0 text-xs font-bold text-[var(--muted-foreground)]">{Math.round(percent)}%</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--muted)]">
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, percent)}%` }} />
        </div>
        <p className={`mt-2 text-xs font-semibold ${over ? "tool-text-bad" : close ? "tool-text-warn" : "tool-text-good"}`}>
          {over ? `${formatKg(total - bag.limit)} over limit` : `${formatKg(bag.limit - total)} space left`}
        </p>
      </div>
    </article>
  );
}

function CategoryBar({ label, total, max }) {
  const width = max ? Math.max(8, Math.round((total / max) * 100)) : 0;
  const tone = CATEGORY_COLORS[label] || "bg-[var(--primary)]";
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-bold text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 text-sm font-black text-[var(--primary)]">{formatKg(total)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function LuggageWeightSplitter() {
  const [preset, setPreset] = useState("domestic");
  const [bags, setBags] = useState(DEFAULT_BAGS);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newItem, setNewItem] = useState({ name: "", category: "Extras", weight: 0.5, qty: 1, owner: "Shared", priority: "Medium" });

  const activePreset = AIRLINE_PRESETS[preset];

  const stats = useMemo(() => {
    const bagTotals = bags.reduce((acc, bag) => ({ ...acc, [bag.id]: 0 }), {});
    const bagCounts = bags.reduce((acc, bag) => ({ ...acc, [bag.id]: 0 }), {});
    const categoryTotals = {};
    const travelerTotals = {};

    items.forEach((item) => {
      const total = itemTotal(item);
      if (item.bagId) {
        bagTotals[item.bagId] = (bagTotals[item.bagId] || 0) + total;
        bagCounts[item.bagId] = (bagCounts[item.bagId] || 0) + 1;
      }
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + total;
      travelerTotals[item.owner] = (travelerTotals[item.owner] || 0) + total;
    });

    const totalWeight = Object.values(bagTotals).reduce((sum, value) => sum + value, 0);
    const totalLimit = bags.reduce((sum, bag) => sum + (Number(bag.limit) || 0), 0);
    const overweightBags = bags.filter((bag) => (bagTotals[bag.id] || 0) > bag.limit);
    const nearLimitBags = bags.filter((bag) => {
      const total = bagTotals[bag.id] || 0;
      return total <= bag.limit && total >= bag.limit * 0.85;
    });
    const lightestBag = bags.reduce((best, bag) => {
      const free = bag.limit - (bagTotals[bag.id] || 0);
      const bestFree = best ? best.limit - (bagTotals[best.id] || 0) : -Infinity;
      return free > bestFree ? bag : best;
    }, null);
    const heaviestOverItem = items
      .filter((item) => overweightBags.some((bag) => bag.id === item.bagId))
      .sort((a, b) => itemTotal(b) - itemTotal(a))[0];

    return {
      bagTotals,
      bagCounts,
      categoryTotals,
      travelerTotals,
      totalWeight,
      totalLimit,
      overweightBags,
      nearLimitBags,
      lightestBag,
      heaviestOverItem,
    };
  }, [bags, items]);

  const categories = useMemo(() => Object.keys(stats.categoryTotals).sort(), [stats.categoryTotals]);
  const maxCategory = useMemo(() => Math.max(1, ...Object.values(stats.categoryTotals)), [stats.categoryTotals]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
      .filter((item) => !term || `${item.name} ${item.category} ${item.owner} ${item.priority}`.toLowerCase().includes(term));
  }, [items, search, categoryFilter]);

  const updateBag = (id, patch) => {
    setBags((current) => current.map((bag) => (bag.id === id ? { ...bag, ...patch } : bag)));
  };

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const applyPreset = (key) => {
    const nextPreset = AIRLINE_PRESETS[key];
    setPreset(key);
    setBags((current) =>
      current.map((bag) => ({
        ...bag,
        limit: bag.type === "Cabin" ? nextPreset.cabin : bag.type === "Checked" ? nextPreset.checked : bag.limit,
      })),
    );
  };

  const addBag = () => {
    const checkedCount = bags.filter((bag) => bag.type === "Checked").length + 1;
    setBags((current) => [
      ...current,
      {
        id: makeId("bag"),
        name: `Checked Bag ${checkedCount}`,
        traveler: "Shared",
        type: "Checked",
        limit: activePreset.checked,
      },
    ]);
  };

  const deleteBag = (id) => {
    if (bags.length <= 1) return;
    const fallback = bags.find((bag) => bag.id !== id)?.id;
    setBags((current) => current.filter((bag) => bag.id !== id));
    setItems((current) => current.map((item) => (item.bagId === id ? { ...item, bagId: fallback } : item)));
  };

  const addItem = () => {
    const name = newItem.name.trim();
    if (!name) return;
    const targetBag =
      stats.lightestBag?.id ||
      bags[0]?.id ||
      "";
    setItems((current) => [
      ...current,
      {
        id: makeId("item"),
        name,
        category: newItem.category.trim() || "Extras",
        weight: Math.max(0, Number(newItem.weight) || 0),
        qty: Math.max(1, Number(newItem.qty) || 1),
        owner: newItem.owner.trim() || "Shared",
        priority: newItem.priority,
        bagId: targetBag,
      },
    ]);
    setNewItem((current) => ({ ...current, name: "" }));
  };

  const autoBalance = () => {
    const nextItems = [...items].sort((a, b) => itemTotal(b) - itemTotal(a));
    const nextTotals = bags.reduce((acc, bag) => ({ ...acc, [bag.id]: 0 }), {});

    const balanced = nextItems.map((item) => {
      const bestBag = [...bags].sort((a, b) => {
        const aFree = a.limit - nextTotals[a.id];
        const bFree = b.limit - nextTotals[b.id];
        return bFree - aFree;
      })[0];
      if (!bestBag) return item;
      nextTotals[bestBag.id] += itemTotal(item);
      return { ...item, bagId: bestBag.id };
    });

    setItems(balanced);
  };

  const copySummary = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildSummary(bags, items, stats));
    }
  };

  const resetSample = () => {
    setPreset("domestic");
    setBags(DEFAULT_BAGS);
    setItems(DEFAULT_ITEMS);
    setSearch("");
    setCategoryFilter("all");
  };

  const weightTone = stats.overweightBags.length ? "bad" : stats.nearLimitBags.length ? "warn" : "good";
  const usagePercent = stats.totalLimit ? Math.round((stats.totalWeight / stats.totalLimit) * 100) : 0;
  const suggestedMove =
    stats.overweightBags.length && stats.heaviestOverItem && stats.lightestBag
      ? `Move ${stats.heaviestOverItem.name} to ${stats.lightestBag.name} or reduce ${formatKg(Math.max(0, stats.totalWeight - stats.totalLimit))}.`
      : "All active bags are inside the configured limits.";

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Smart baggage planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${stats.overweightBags.length ? "tool-status-bad" : "tool-status-good"}`}>
              {stats.overweightBags.length ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {stats.overweightBags.length ? `${stats.overweightBags.length} over limit` : "Ready to fly"}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Luggage Weight Splitter
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Balance luggage across cabin bags, checked bags, travelers, and airline limits. Add items, assign bags, detect overweight sections, auto-balance heavy items, and export a clean split plan.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={Weight} label="Total Weight" value={formatKg(stats.totalWeight)} detail={`${usagePercent}% of total allowance used.`} tone={weightTone} />
          <MetricCard icon={Scale} label="Total Limit" value={formatKg(stats.totalLimit)} detail={`${bags.length} active bag allowance.`} />
          <MetricCard icon={AlertTriangle} label="Over Limit" value={stats.overweightBags.length} detail={suggestedMove} tone={stats.overweightBags.length ? "bad" : "good"} />
          <MetricCard icon={Users} label="Travelers" value={Object.keys(stats.travelerTotals).length} detail="Owner-wise weight split is tracked below." />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Plane className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Airline Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{activePreset.note}</p>
              </div>
            </div>

            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Allowance preset</span>
              <select
                value={preset}
                onChange={(event) => applyPreset(event.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {Object.entries(AIRLINE_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label} - cabin {item.cabin} kg, checked {item.checked} kg
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Cabin</p>
                <p className="mt-2 text-2xl font-black text-[var(--foreground)]">{activePreset.cabin} kg</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Checked</p>
                <p className="mt-2 text-2xl font-black text-[var(--foreground)]">{activePreset.checked} kg</p>
              </div>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={autoBalance}>
                <ArrowRightLeft className="h-4 w-4" />
                Auto Balance
              </button>
              <button type="button" className="btn-secondary" onClick={addBag}>
                <Luggage className="h-4 w-4" />
                Add Bag
              </button>
              <button type="button" className="btn-secondary" onClick={copySummary}>
                <Clipboard className="h-4 w-4" />
                Copy Plan
              </button>
              <button type="button" className="btn-secondary" onClick={() => exportCsv(bags, items, stats)}>
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
                <PackagePlus className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Add Item</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">New items are assigned to the bag with the most free space.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Item name</span>
                <input
                  value={newItem.name}
                  onChange={(event) => setNewItem((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Camera, gifts, jacket..."
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Category</span>
                <input
                  value={newItem.category}
                  onChange={(event) => setNewItem((current) => ({ ...current, category: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Owner</span>
                <input
                  value={newItem.owner}
                  onChange={(event) => setNewItem((current) => ({ ...current, owner: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Weight each kg</span>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={newItem.weight}
                  onChange={(event) => setNewItem((current) => ({ ...current, weight: Math.max(0, Number(event.target.value) || 0) }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={newItem.qty}
                  onChange={(event) => setNewItem((current) => ({ ...current, qty: Math.max(1, Number(event.target.value) || 1) }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Priority</span>
                <select
                  value={newItem.priority}
                  onChange={(event) => setNewItem((current) => ({ ...current, priority: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="btn-primary mt-4 w-full" onClick={addItem}>
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Gauge className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Weight Signals</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Quick warnings before airport check-in.</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Allowance used</p>
                <p className="mt-1 text-3xl font-black text-[var(--foreground)]">{usagePercent}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div className={`h-full rounded-full ${stats.overweightBags.length ? "bg-rose-500" : "bg-[var(--primary)]"}`} style={{ width: `${Math.min(100, usagePercent)}%` }} />
                </div>
              </div>
              <div className={`rounded-lg border p-4 ${stats.overweightBags.length ? "tool-callout-bad" : "tool-callout-good"}`}>
                <p className="text-sm font-black text-[var(--foreground)]">{stats.overweightBags.length ? "Move weight before check-in" : "Balanced enough for travel"}</p>
                <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{suggestedMove}</p>
              </div>
            </div>
          </article>
        </div>

        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row 2xl:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                    <Luggage className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Bag Split Board</h2>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Edit bag owners, limits, and see overweight risk instantly.</p>
                  </div>
                </div>
              </div>
              <button type="button" className="btn-secondary w-full lg:w-auto" onClick={addBag}>
                <Plus className="h-4 w-4" />
                Add Bag
              </button>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              {bags.map((bag) => (
                <BagCard
                  key={bag.id}
                  bag={bag}
                  total={stats.bagTotals[bag.id] || 0}
                  itemCount={stats.bagCounts[bag.id] || 0}
                  onChange={(patch) => updateBag(bag.id, patch)}
                  onDelete={() => deleteBag(bag.id)}
                />
              ))}
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                    <Filter className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Item Allocation</h2>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Assign each item to the bag where it belongs.</p>
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
                    placeholder="Search item, owner..."
                  />
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              {filteredItems.map((item) => (
                <article key={item.id} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
                  <div className="tool-form-grid min-w-0 gap-3">
                    <label className="block min-w-0">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Item</span>
                      <input
                        value={item.name}
                        onChange={(event) => updateItem(item.id, { name: event.target.value })}
                        className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Weight</span>
                      <input
                        type="number"
                        min="0"
                        step="0.05"
                        value={item.weight}
                        onChange={(event) => updateItem(item.id, { weight: Math.max(0, Number(event.target.value) || 0) })}
                        className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(event) => updateItem(item.id, { qty: Math.max(1, Number(event.target.value) || 1) })}
                        className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
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
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Bag</span>
                      <select
                        value={item.bagId}
                        onChange={(event) => updateItem(item.id, { bagId: event.target.value })}
                        className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      >
                        {bags.map((bag) => (
                          <option key={bag.id} value={bag.id}>
                            {bag.name}
                          </option>
                        ))}
                      </select>
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
                  <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                    <span className="rounded-full bg-[var(--section-highlight)] px-3 py-1 text-[var(--primary)]">{item.category}</span>
                    <span className="rounded-full bg-[var(--muted)] px-3 py-1">{item.owner}</span>
                    <span className="rounded-full bg-[var(--muted)] px-3 py-1">Total {formatKg(itemTotal(item), 2)}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[1fr_0.8fr]">
            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Scale className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Category Weight</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">See which category is taking most of the bag.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {Object.entries(stats.categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, total]) => (
                    <CategoryBar key={category} label={category} total={total} max={maxCategory} />
                  ))}
              </div>
            </article>

            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Users className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Traveler Split</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Owner-wise packing load.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {Object.entries(stats.travelerTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([owner, total]) => (
                    <div key={owner} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <p className="min-w-0 break-words text-sm font-bold text-[var(--foreground)]">{owner}</p>
                        <p className="shrink-0 text-lg font-black text-[var(--primary)]">{formatKg(total)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
