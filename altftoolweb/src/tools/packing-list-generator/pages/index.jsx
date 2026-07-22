"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Backpack,
  Briefcase,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  FileText,
  Filter,
  Luggage,
  PackageCheck,
  PackagePlus,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Shirt,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Umbrella,
  Weight,
} from "lucide-react";

const TRIP_TYPES = {
  business: {
    label: "Business Trip",
    icon: Briefcase,
    note: "Formal clothing, tech, documents, and carry-on friendly essentials.",
    items: [
      ["Formal shirt", "Clothing", "High", 280, 1, "Keep one extra if meetings are back to back.", true, "perDay"],
      ["Blazer / jacket", "Clothing", "Medium", 650, 1, "Wear during travel if luggage is tight.", false, "fixed"],
      ["Trousers", "Clothing", "High", 430, 1, "Neutral colors mix better.", false, "halfDay"],
      ["Laptop and charger", "Tech", "High", 1800, 1, "Keep in cabin bag.", true, "fixed"],
      ["Power bank", "Tech", "High", 260, 1, "Carry in cabin only.", true, "fixed"],
      ["Business cards", "Documents", "Low", 60, 1, "Useful for events and client visits.", true, "fixed"],
      ["ID proof / tickets", "Documents", "High", 120, 1, "Keep digital and physical backup.", true, "fixed"],
      ["Toiletry kit", "Toiletries", "Medium", 380, 1, "Use travel-size bottles.", false, "fixed"],
    ],
  },
  vacation: {
    label: "Family Vacation",
    icon: Sun,
    note: "Balanced list for clothes, medicines, documents, snacks, and family comfort.",
    items: [
      ["T-shirts / tops", "Clothing", "High", 220, 1, "Pack breathable clothes.", false, "perDay"],
      ["Bottom wear", "Clothing", "High", 360, 1, "Jeans, shorts, or travel pants.", false, "halfDay"],
      ["Innerwear", "Clothing", "High", 80, 1, "Pack one spare set.", false, "perDayPlus"],
      ["Comfort footwear", "Footwear", "High", 650, 1, "Choose walking-friendly pair.", false, "fixed"],
      ["Basic medicines", "Health", "High", 180, 1, "Include prescriptions if needed.", true, "fixed"],
      ["Snacks and water bottle", "Food", "Medium", 450, 1, "Useful during transfers.", false, "perTraveler"],
      ["Travel documents", "Documents", "High", 140, 1, "IDs, bookings, permits.", true, "fixed"],
      ["Laundry pouch", "Organization", "Medium", 90, 1, "Separate used clothes.", false, "fixed"],
    ],
  },
  weekend: {
    label: "Weekend Getaway",
    icon: Backpack,
    note: "Compact two to three day checklist for quick plans.",
    items: [
      ["Outfits", "Clothing", "High", 280, 1, "Keep it light and repeatable.", false, "perDay"],
      ["Nightwear", "Clothing", "Medium", 230, 1, "One set is usually enough.", false, "fixed"],
      ["Phone charger", "Tech", "High", 90, 1, "Pack before leaving.", true, "fixed"],
      ["Sunglasses", "Accessories", "Low", 80, 1, "Optional but handy.", false, "fixed"],
      ["Toiletry pouch", "Toiletries", "High", 260, 1, "Toothbrush, paste, face wash.", false, "fixed"],
      ["Wallet and IDs", "Documents", "High", 160, 1, "Carry one government ID.", true, "fixed"],
      ["Reusable bottle", "Food", "Medium", 220, 1, "Refill through the trip.", false, "fixed"],
    ],
  },
  trek: {
    label: "Trek / Outdoor",
    icon: Umbrella,
    note: "Weather-aware gear, safety, hydration, layers, and emergency basics.",
    items: [
      ["Quick-dry layers", "Clothing", "High", 260, 1, "Avoid heavy cotton.", false, "perDay"],
      ["Rain jacket / poncho", "Weather", "High", 420, 1, "Essential for uncertain weather.", false, "fixed"],
      ["Trekking shoes", "Footwear", "High", 1100, 1, "Break them in before travel.", false, "fixed"],
      ["First-aid kit", "Health", "High", 260, 1, "Blister pads, bandage, pain relief.", true, "fixed"],
      ["Torch / headlamp", "Gear", "High", 180, 1, "Carry extra cells if needed.", true, "fixed"],
      ["Energy bars", "Food", "Medium", 80, 2, "Easy calories for trail breaks.", false, "perDay"],
      ["Sunscreen", "Toiletries", "Medium", 120, 1, "High altitude sun can be harsh.", false, "fixed"],
      ["Offline map / permits", "Documents", "High", 120, 1, "Network may be unavailable.", true, "fixed"],
    ],
  },
  international: {
    label: "International Travel",
    icon: Plane,
    note: "Passport, currency, adapters, documents, insurance, and cabin essentials.",
    items: [
      ["Passport and visa", "Documents", "High", 150, 1, "Check validity and visa pages.", true, "fixed"],
      ["Travel insurance", "Documents", "High", 90, 1, "Keep copy offline.", true, "fixed"],
      ["Universal adapter", "Tech", "High", 150, 1, "Check plug type for destination.", true, "fixed"],
      ["Forex card / cash", "Money", "High", 120, 1, "Split cash between bags.", true, "fixed"],
      ["Cabin outfit", "Clothing", "Medium", 300, 1, "Useful for long flights.", false, "fixed"],
      ["Medicines and prescriptions", "Health", "High", 200, 1, "Carry prescriptions for customs.", true, "fixed"],
      ["Neck pillow", "Comfort", "Low", 240, 1, "Helpful on long-haul flights.", false, "fixed"],
      ["Printed bookings", "Documents", "Medium", 110, 1, "Hotel, return ticket, itinerary.", true, "fixed"],
    ],
  },
  beach: {
    label: "Beach / Resort",
    icon: Sun,
    note: "Light clothes, swimwear, skin protection, dry bags, and easy footwear.",
    items: [
      ["Swimwear", "Clothing", "High", 180, 1, "Pack one spare if swimming daily.", false, "halfDay"],
      ["Light outfits", "Clothing", "High", 220, 1, "Breathable fabric works best.", false, "perDay"],
      ["Flip-flops", "Footwear", "Medium", 360, 1, "Good for beach and pool areas.", false, "fixed"],
      ["Sunscreen", "Toiletries", "High", 160, 1, "Reapply regularly.", false, "fixed"],
      ["Dry bag", "Organization", "Medium", 170, 1, "Protect phone and wallet.", true, "fixed"],
      ["Beach towel", "Comfort", "Low", 450, 1, "Skip if resort provides one.", false, "fixed"],
      ["After-sun lotion", "Toiletries", "Low", 140, 1, "Helpful for sensitive skin.", false, "fixed"],
    ],
  },
};

const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };
const BAG_LIMITS = {
  cabin: 7000,
  checked: 15000,
  backpack: 9000,
  custom: 12000,
};

function titleFromSlug(value) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function quantityFor(mode, baseQty, trip) {
  const days = Math.max(1, Number(trip.days) || 1);
  const travelers = Math.max(1, Number(trip.travelers) || 1);
  const laundryEvery = Math.max(0, Number(trip.laundryEvery) || 0);
  const effectiveDays = laundryEvery ? Math.min(days, laundryEvery + 1) : days;

  if (mode === "perDay") return Math.max(baseQty, Math.ceil(effectiveDays * baseQty * travelers));
  if (mode === "perDayPlus") return Math.max(baseQty, Math.ceil((effectiveDays + 1) * baseQty * travelers));
  if (mode === "halfDay") return Math.max(baseQty, Math.ceil((effectiveDays / 2) * baseQty * travelers));
  if (mode === "perTraveler") return Math.max(baseQty, baseQty * travelers);
  return baseQty;
}

function createItems(type, trip) {
  return TRIP_TYPES[type].items.map((row, index) => {
    const [name, category, priority, weight, baseQty, note, carryOn, mode] = row;
    const qty = quantityFor(mode, baseQty, trip);
    return {
      id: `${type}-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      category,
      priority,
      weight,
      qty,
      note,
      carryOn,
      packed: false,
    };
  });
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

function buildMarkdown(tripType, trip, items) {
  const template = TRIP_TYPES[tripType];
  const packed = items.filter((item) => item.packed).length;
  return [
    `# ${template.label} Packing List`,
    `Destination: ${trip.destination || "Not set"}`,
    `Duration: ${trip.days} day(s)`,
    `Travelers: ${trip.travelers}`,
    `Bag type: ${titleFromSlug(trip.bagType)}`,
    `Progress: ${packed}/${items.length} packed`,
    "",
    ...items.map(
      (item) =>
        `- [${item.packed ? "x" : " "}] ${item.name} x${item.qty} (${item.priority}, ${item.category}) - ${item.note}`,
    ),
    "",
    "Tip: Keep travel documents, medicines, chargers, and valuables in your cabin bag.",
  ].join("\n");
}

function exportCsv(tripType, trip, items) {
  const rows = [
    ["Trip Type", "Destination", "Item", "Category", "Priority", "Quantity", "Weight Grams", "Carry On", "Status", "Note"],
    ...items.map((item) => [
      TRIP_TYPES[tripType].label,
      trip.destination,
      item.name,
      item.category,
      item.priority,
      item.qty,
      item.weight * item.qty,
      item.carryOn ? "Yes" : "No",
      item.packed ? "Packed" : "Pending",
      item.note,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile("packing-list.csv", csv, "text/csv");
}

function formatKg(grams) {
  if (!Number.isFinite(grams)) return "0 kg";
  return `${(grams / 1000).toFixed(1)} kg`;
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

function PriorityPill({ priority }) {
  const tone =
    priority === "High"
      ? "tool-status-bad"
      : priority === "Medium"
        ? "tool-status-warn"
        : "tool-status-good";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{priority}</span>;
}

function CategoryBar({ label, count, max }) {
  const width = max ? Math.max(12, Math.round((count / max) * 100)) : 0;
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-bold text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 text-sm font-black text-[var(--primary)]">{count}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function PackingListGenerator() {
  const [tripType, setTripType] = useState("vacation");
  const [trip, setTrip] = useState({
    destination: "Goa",
    days: 5,
    travelers: 2,
    climate: "Warm",
    bagType: "checked",
    laundryEvery: 0,
  });
  const [items, setItems] = useState(() =>
    createItems("vacation", {
      destination: "Goa",
      days: 5,
      travelers: 2,
      climate: "Warm",
      bagType: "checked",
      laundryEvery: 0,
    }),
  );
  const [customItem, setCustomItem] = useState("");
  const [customCategory, setCustomCategory] = useState("Extras");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const template = TRIP_TYPES[tripType];
  const TemplateIcon = template.icon;

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter((item) => item.packed).length;
    const highPending = items.filter((item) => item.priority === "High" && !item.packed).length;
    const carryOn = items.filter((item) => item.carryOn).length;
    const totalWeight = items.reduce((sum, item) => sum + item.weight * item.qty, 0);
    const limit = BAG_LIMITS[trip.bagType] || BAG_LIMITS.custom;
    const progress = total ? Math.round((packed / total) * 100) : 0;
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    return { total, packed, pending: total - packed, highPending, carryOn, totalWeight, limit, progress, categoryCounts };
  }, [items, trip.bagType]);

  const categories = useMemo(() => Object.keys(stats.categoryCounts).sort(), [stats.categoryCounts]);
  const maxCategory = useMemo(() => Math.max(1, ...Object.values(stats.categoryCounts)), [stats.categoryCounts]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...items]
      .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
      .filter((item) => !term || `${item.name} ${item.category} ${item.note}`.toLowerCase().includes(term))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.category.localeCompare(b.category));
  }, [items, search, categoryFilter]);

  const updateTrip = (key, value) => {
    setTrip((current) => ({ ...current, [key]: value }));
  };

  const regenerate = () => {
    setItems(createItems(tripType, trip));
    setCategoryFilter("all");
    setSearch("");
  };

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addCustomItem = () => {
    const name = customItem.trim();
    if (!name) return;
    setItems((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name,
        category: customCategory.trim() || "Extras",
        priority: "Medium",
        weight: 150,
        qty: 1,
        note: "Added manually",
        carryOn: false,
        packed: false,
      },
    ]);
    setCustomItem("");
  };

  const copyPending = async () => {
    const pending = items
      .filter((item) => !item.packed)
      .map((item) => `- ${item.name} x${item.qty} (${item.priority})`)
      .join("\n");
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(pending || "Everything is packed.");
    }
  };

  const copyMarkdown = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildMarkdown(tripType, trip, items));
    }
  };

  const weightTone = stats.totalWeight > stats.limit ? "bad" : stats.totalWeight > stats.limit * 0.85 ? "warn" : "good";

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Smart travel planner</span>
            </span>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full tool-status-good px-4 py-2 text-xs font-bold uppercase tracking-wide">
              <PackageCheck className="h-4 w-4 shrink-0" />
              {stats.progress}% packed
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Packing List Generator
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Create a trip-ready packing checklist by destination, duration, traveler count, climate, luggage limit, and carry-on priority. Add custom items, track weight, copy pending items, and export a clean packing plan.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={PackageCheck} label="Packed" value={`${stats.packed}/${stats.total}`} detail={`${stats.pending} items still pending.`} tone={stats.progress === 100 ? "good" : "info"} />
          <MetricCard icon={Weight} label="Bag Weight" value={formatKg(stats.totalWeight)} detail={`Limit: ${formatKg(stats.limit)}.`} tone={weightTone} />
          <MetricCard icon={AlertTriangle} label="High Priority Left" value={stats.highPending} detail="Documents, medicines, tech, and must-carry items." tone={stats.highPending ? "warn" : "good"} />
          <MetricCard icon={ShieldCheck} label="Carry-on Items" value={stats.carryOn} detail="Keep valuables and urgent items nearby." />
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
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Trip type</span>
              <select
                value={tripType}
                onChange={(event) => setTripType(event.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {Object.entries(TRIP_TYPES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
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
                  placeholder="City, country, or route"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Days</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={trip.days}
                  onChange={(event) => updateTrip("days", Math.max(1, Math.min(60, Number(event.target.value) || 1)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Travelers</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={trip.travelers}
                  onChange={(event) => updateTrip("travelers", Math.max(1, Math.min(12, Number(event.target.value) || 1)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Climate</span>
                <select
                  value={trip.climate}
                  onChange={(event) => updateTrip("climate", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option>Warm</option>
                  <option>Cold</option>
                  <option>Rainy</option>
                  <option>Mixed</option>
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Bag type</span>
                <select
                  value={trip.bagType}
                  onChange={(event) => updateTrip("bagType", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="cabin">Cabin bag - 7 kg</option>
                  <option value="checked">Checked bag - 15 kg</option>
                  <option value="backpack">Backpack - 9 kg</option>
                  <option value="custom">Flexible - 12 kg</option>
                </select>
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Laundry after days</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={trip.laundryEvery}
                  onChange={(event) => updateTrip("laundryEvery", Math.max(0, Math.min(30, Number(event.target.value) || 0)))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-2 block text-xs text-[var(--muted-foreground)]">Use 0 when laundry is not planned.</span>
              </label>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={regenerate}>
                <Sparkles className="h-4 w-4" />
                Generate List
              </button>
              <button type="button" className="btn-secondary" onClick={() => setItems((current) => current.map((item) => ({ ...item, packed: true })))}>
                <CheckCircle2 className="h-4 w-4" />
                Pack All
              </button>
              <button type="button" className="btn-secondary" onClick={() => setItems((current) => current.map((item) => ({ ...item, packed: false })))}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <PackagePlus className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Custom Item</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Add anything personal without rebuilding the list.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_150px]">
              <input
                value={customItem}
                onChange={(event) => setCustomItem(event.target.value)}
                className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                placeholder="Example: camera batteries"
              />
              <input
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                placeholder="Category"
              />
            </div>
            <button type="button" className="btn-primary mt-3 w-full" onClick={addCustomItem}>
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Export Plan</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Copy or download a clean checklist.</p>
              </div>
            </div>
            <div className="tool-action-grid">
              <button type="button" className="btn-secondary" onClick={copyPending}>
                <Copy className="h-4 w-4" />
                Pending
              </button>
              <button type="button" className="btn-secondary" onClick={copyMarkdown}>
                <Clipboard className="h-4 w-4" />
                Markdown
              </button>
              <button type="button" className="btn-primary" onClick={() => exportCsv(tripType, trip, items)}>
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </article>
        </div>

        <section className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 flex-col gap-4 lg:flex-row 2xl:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Packing Checklist</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                Filter, edit quantities, mark packed items, and keep cabin essentials visible.
              </p>
            </div>
            <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
              <label className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  placeholder="Search items"
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

          <div className="grid min-w-0 gap-3">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
                <div className="grid min-w-0 gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { packed: !item.packed })}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                      item.packed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                    }`}
                    aria-label={item.packed ? "Mark unpacked" : "Mark packed"}
                  >
                    <PackageCheck className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className={`min-w-0 break-words text-lg font-black ${item.packed ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}>
                        {item.name}
                      </h3>
                      <PriorityPill priority={item.priority} />
                      {item.carryOn ? (
                        <span className="rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-bold text-[var(--primary)]">Carry-on</span>
                      ) : null}
                    </div>
                    <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                      {item.category} · {item.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary h-10 px-3"
                    onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="tool-form-grid mt-4 min-w-0 gap-3">
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Qty</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={item.qty}
                      onChange={(event) => updateItem(item.id, { qty: Math.max(1, Math.min(99, Number(event.target.value) || 1)) })}
                      className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Weight g</span>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={item.weight}
                      onChange={(event) => updateItem(item.id, { weight: Math.max(0, Math.min(5000, Number(event.target.value) || 0)) })}
                      className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Priority</span>
                    <select
                      value={item.priority}
                      onChange={(event) => updateItem(item.id, { priority: event.target.value })}
                      className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </label>
                  <label className="flex min-w-0 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={item.carryOn}
                      onChange={(event) => updateItem(item.id, { carryOn: event.target.checked })}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">Carry-on</span>
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-8 grid min-w-0 gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <article className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
              <Shirt className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Category Breakdown</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Spot heavy or missing sections before leaving.</p>
            </div>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryBar key={category} label={category} count={stats.categoryCounts[category]} max={maxCategory} />
            ))}
          </div>
        </article>

        <aside className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
              <Luggage className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Smart Reminders</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Small checks that save big trouble.</p>
            </div>
          </div>
          <div className="grid min-w-0 gap-3">
            {[
              `For ${trip.climate.toLowerCase()} weather, keep one flexible layer or weather cover.`,
              "Keep medicines, valuables, chargers, and key documents in cabin luggage.",
              "Photograph important documents and keep offline copies before travel.",
              stats.totalWeight > stats.limit
                ? "Your estimated bag weight is above the selected limit. Reduce bulky items or move extras."
                : "Your estimated bag weight is within the selected limit.",
            ].map((tip, index) => (
              <div key={tip} className="flex min-w-0 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                {index === 3 && stats.totalWeight > stats.limit ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 tool-text-bad" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                )}
                <p className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">{tip}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
