"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  Clipboard,
  Clock,
  Coffee,
  Compass,
  Download,
  Filter,
  Hotel,
  MapPin,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";

const CURRENCIES = {
  INR: { symbol: "₹", label: "INR" },
  USD: { symbol: "$", label: "USD" },
  EUR: { symbol: "€", label: "EUR" },
  GBP: { symbol: "£", label: "GBP" },
};

const PACE_PRESETS = {
  relaxed: {
    label: "Relaxed",
    maxHours: 5,
    note: "Easy mornings, longer breaks, and fewer bookings per day.",
  },
  balanced: {
    label: "Balanced",
    maxHours: 7,
    note: "Good mix of sightseeing, meals, travel time, and rest.",
  },
  packed: {
    label: "Packed",
    maxHours: 9,
    note: "Best for short trips where every hour is planned tightly.",
  },
};

const CATEGORY_META = {
  Travel: { icon: Plane, color: "bg-blue-500" },
  Stay: { icon: Hotel, color: "bg-indigo-500" },
  Food: { icon: Utensils, color: "bg-emerald-500" },
  Sightseeing: { icon: Camera, color: "bg-violet-500" },
  Transport: { icon: Car, color: "bg-cyan-500" },
  Break: { icon: Coffee, color: "bg-amber-500" },
  Shopping: { icon: Wallet, color: "bg-rose-500" },
};

const DEFAULT_ACTIVITIES = [
  {
    id: "flight-arrival",
    day: 1,
    start: "09:00",
    duration: 90,
    title: "Arrival and hotel transfer",
    place: "Airport to hotel",
    category: "Travel",
    cost: 1800,
    booked: true,
    note: "Keep ID, booking voucher, and local transport cash ready.",
  },
  {
    id: "checkin",
    day: 1,
    start: "11:30",
    duration: 75,
    title: "Check-in and freshen up",
    place: "Hotel",
    category: "Stay",
    cost: 0,
    booked: true,
    note: "Ask reception for nearby food and transport options.",
  },
  {
    id: "lunch",
    day: 1,
    start: "13:00",
    duration: 60,
    title: "Local lunch",
    place: "Old market cafe",
    category: "Food",
    cost: 1200,
    booked: false,
    note: "Pick one local dish and keep the meal light.",
  },
  {
    id: "heritage-walk",
    day: 1,
    start: "15:00",
    duration: 150,
    title: "Heritage walk",
    place: "City center",
    category: "Sightseeing",
    cost: 2200,
    booked: false,
    note: "Carry water, power bank, and comfortable footwear.",
  },
  {
    id: "sunset",
    day: 1,
    start: "18:00",
    duration: 90,
    title: "Sunset viewpoint",
    place: "Cliff point",
    category: "Sightseeing",
    cost: 600,
    booked: false,
    note: "Reach early for photos and return before it gets crowded.",
  },
  {
    id: "breakfast",
    day: 2,
    start: "08:30",
    duration: 45,
    title: "Breakfast",
    place: "Hotel cafe",
    category: "Food",
    cost: 700,
    booked: true,
    note: "Confirm breakfast timing the night before.",
  },
  {
    id: "museum",
    day: 2,
    start: "10:00",
    duration: 120,
    title: "Museum visit",
    place: "Art museum",
    category: "Sightseeing",
    cost: 1600,
    booked: false,
    note: "Check ticket counter and photography rules.",
  },
  {
    id: "shopping",
    day: 2,
    start: "16:00",
    duration: 120,
    title: "Souvenir shopping",
    place: "Handicraft street",
    category: "Shopping",
    cost: 2500,
    booked: false,
    note: "Keep a fixed shopping cap to avoid budget spill.",
  },
];

const CATEGORY_NAMES = Object.keys(CATEGORY_META);

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00")
    .split(":")
    .map((part) => Number(part) || 0);
  return hours * 60 + minutes;
}

function minutesToTime(value) {
  const total = Math.max(0, Math.round(value));
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatMoney(value, currency) {
  const symbol = CURRENCIES[currency]?.symbol || "";
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${symbol}${Math.round(safe).toLocaleString("en-IN")}`;
}

function dayLabel(startDate, day) {
  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return `Day ${day}`;
  date.setDate(date.getDate() + day - 1);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function activityEnd(activity) {
  return minutesToTime(timeToMinutes(activity.start) + (Number(activity.duration) || 0));
}

function buildConflicts(activities) {
  const conflicts = new Set();
  const byDay = activities.reduce((acc, activity) => {
    acc[activity.day] = acc[activity.day] || [];
    acc[activity.day].push(activity);
    return acc;
  }, {});

  Object.values(byDay).forEach((dayActivities) => {
    const sorted = [...dayActivities].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    sorted.forEach((activity, index) => {
      const next = sorted[index + 1];
      if (!next) return;
      const end = timeToMinutes(activity.start) + (Number(activity.duration) || 0);
      if (end > timeToMinutes(next.start)) {
        conflicts.add(activity.id);
        conflicts.add(next.id);
      }
    });
  });

  return conflicts;
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

function buildMarkdown(trip, activities, stats) {
  return [
    `# ${trip.destination || "Trip"} Itinerary`,
    `Dates: ${trip.startDate} for ${trip.days} day(s)`,
    `Travelers: ${trip.travelers}`,
    `Pace: ${PACE_PRESETS[trip.pace]?.label}`,
    `Estimated cost: ${formatMoney(stats.totalCost, trip.currency)}`,
    `Booked items: ${stats.booked}/${activities.length}`,
    "",
    ...Array.from({ length: Number(trip.days) || 1 }, (_, index) => {
      const day = index + 1;
      const dayItems = activities
        .filter((activity) => Number(activity.day) === day)
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
      return [
        `## Day ${day} - ${dayLabel(trip.startDate, day)}`,
        dayItems.length
          ? dayItems
              .map(
                (activity) =>
                  `- ${activity.start}-${activityEnd(activity)} ${activity.title} at ${activity.place} (${activity.category}, ${formatMoney(activity.cost, trip.currency)})`,
              )
              .join("\n")
          : "- Open day. Add activities or keep it flexible.",
      ].join("\n");
    }),
  ].join("\n\n");
}

function exportCsv(trip, activities) {
  const rows = [
    ["Destination", "Day", "Date", "Start", "End", "Duration Minutes", "Title", "Place", "Category", "Cost", "Booked", "Note"],
    ...activities.map((activity) => [
      trip.destination,
      activity.day,
      dayLabel(trip.startDate, activity.day),
      activity.start,
      activityEnd(activity),
      activity.duration,
      activity.title,
      activity.place,
      activity.category,
      activity.cost,
      activity.booked ? "Yes" : "No",
      activity.note,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile("itinerary-builder.csv", csv, "text/csv");
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
  const meta = CATEGORY_META[label] || CATEGORY_META.Sightseeing;
  const width = max ? Math.max(8, Math.round((value / max) * 100)) : 0;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-bold text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 text-sm font-black text-[var(--primary)]">{formatMoney(value, currency)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function ItineraryBuilder() {
  const [trip, setTrip] = useState({
    destination: "Jaipur, India",
    startDate: "2026-05-20",
    days: 3,
    travelers: 2,
    currency: "INR",
    pace: "balanced",
    startTime: "08:00",
    endTime: "21:00",
    dailyBudget: 7000,
  });
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [selectedDay, setSelectedDay] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newActivity, setNewActivity] = useState({
    title: "",
    place: "",
    category: "Sightseeing",
    start: "10:00",
    duration: 90,
    cost: 1000,
    note: "",
  });

  const conflicts = useMemo(() => buildConflicts(activities), [activities]);

  const stats = useMemo(() => {
    const totalCost = activities.reduce((sum, activity) => sum + (Number(activity.cost) || 0), 0);
    const totalMinutes = activities.reduce((sum, activity) => sum + (Number(activity.duration) || 0), 0);
    const booked = activities.filter((activity) => activity.booked).length;
    const perPerson = totalCost / Math.max(1, Number(trip.travelers) || 1);
    const dailyCost = totalCost / Math.max(1, Number(trip.days) || 1);
    const dailyWindow = Math.max(0, timeToMinutes(trip.endTime) - timeToMinutes(trip.startTime));
    const categoryCost = activities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + (Number(activity.cost) || 0);
      return acc;
    }, {});
    const dayMinutes = Array.from({ length: Number(trip.days) || 1 }, (_, index) => {
      const day = index + 1;
      return activities
        .filter((activity) => Number(activity.day) === day)
        .reduce((sum, activity) => sum + (Number(activity.duration) || 0), 0);
    });
    const heavyDays = dayMinutes.filter((minutes) => minutes / 60 > PACE_PRESETS[trip.pace].maxHours).length;
    return {
      totalCost,
      totalMinutes,
      booked,
      perPerson,
      dailyCost,
      dailyWindow,
      categoryCost,
      dayMinutes,
      heavyDays,
    };
  }, [activities, trip]);

  const dayActivities = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities
      .filter((activity) => Number(activity.day) === Number(selectedDay))
      .filter((activity) => categoryFilter === "all" || activity.category === categoryFilter)
      .filter((activity) => !term || `${activity.title} ${activity.place} ${activity.category} ${activity.note}`.toLowerCase().includes(term))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [activities, selectedDay, search, categoryFilter]);

  const maxCategory = useMemo(() => Math.max(1, ...Object.values(stats.categoryCost)), [stats.categoryCost]);
  const selectedMinutes = stats.dayMinutes[selectedDay - 1] || 0;
  const selectedLoad = stats.dailyWindow ? Math.round((selectedMinutes / stats.dailyWindow) * 100) : 0;
  const selectedDayCost = activities
    .filter((activity) => Number(activity.day) === Number(selectedDay))
    .reduce((sum, activity) => sum + (Number(activity.cost) || 0), 0);

  const updateTrip = (key, value) => {
    setTrip((current) => ({ ...current, [key]: value }));
  };

  const updateActivity = (id, patch) => {
    setActivities((current) => current.map((activity) => (activity.id === id ? { ...activity, ...patch } : activity)));
  };

  const addActivity = () => {
    const title = newActivity.title.trim();
    if (!title) return;
    setActivities((current) => [
      ...current,
      {
        id: makeId("activity"),
        day: selectedDay,
        start: newActivity.start,
        duration: Math.max(15, Number(newActivity.duration) || 15),
        title,
        place: newActivity.place.trim() || trip.destination,
        category: newActivity.category,
        cost: Math.max(0, Number(newActivity.cost) || 0),
        booked: false,
        note: newActivity.note.trim() || "Added manually.",
      },
    ]);
    setNewActivity((current) => ({ ...current, title: "", note: "" }));
  };

  const addBreaks = () => {
    const hasLunch = activities.some((activity) => Number(activity.day) === Number(selectedDay) && activity.category === "Food");
    if (hasLunch) return;
    setActivities((current) => [
      ...current,
      {
        id: makeId("lunch"),
        day: selectedDay,
        start: "13:00",
        duration: 60,
        title: "Lunch break",
        place: "Nearby restaurant",
        category: "Food",
        cost: 900,
        booked: false,
        note: "Add a buffer meal so the day does not become too rushed.",
      },
    ]);
  };

  const copyPlan = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildMarkdown(trip, activities, stats));
    }
  };

  const resetSample = () => {
    setTrip({
      destination: "Jaipur, India",
      startDate: "2026-05-20",
      days: 3,
      travelers: 2,
      currency: "INR",
      pace: "balanced",
      startTime: "08:00",
      endTime: "21:00",
      dailyBudget: 7000,
    });
    setActivities(DEFAULT_ACTIVITIES);
    setSelectedDay(1);
    setSearch("");
    setCategoryFilter("all");
  };

  const scheduleTone = conflicts.size ? "bad" : stats.heavyDays ? "warn" : "good";
  const scheduleText = conflicts.size
    ? `${conflicts.size} overlapping activity cards need timing fixes.`
    : stats.heavyDays
      ? `${stats.heavyDays} day(s) are heavier than your selected pace.`
      : "Your current schedule is balanced.";

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Smart trip planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${conflicts.size ? "tool-status-bad" : "tool-status-good"}`}>
              {conflicts.size ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {conflicts.size ? "Timing conflict" : "Schedule ready"}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
            Itinerary Builder
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Plan a day-wise travel schedule with exact time slots, places, categories, booking status, cost estimates, pace warnings, and export-ready itinerary notes.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={CalendarDays} label="Trip Days" value={trip.days} detail={`${dayLabel(trip.startDate, 1)} onward.`} />
          <MetricCard icon={Clock} label="Planned Time" value={`${(stats.totalMinutes / 60).toFixed(1)}h`} detail={`${selectedLoad}% load on selected day.`} tone={scheduleTone} />
          <MetricCard icon={Wallet} label="Total Cost" value={formatMoney(stats.totalCost, trip.currency)} detail={`${formatMoney(stats.perPerson, trip.currency)} per person.`} />
          <MetricCard icon={CheckCircle2} label="Booked" value={`${stats.booked}/${activities.length}`} detail={scheduleText} tone={scheduleTone} />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Compass className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Trip Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{PACE_PRESETS[trip.pace].note}</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Destination</span>
                <input
                  value={trip.destination}
                  onChange={(event) => updateTrip("destination", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="City, country, route..."
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Start date</span>
                <input
                  type="date"
                  value={trip.startDate}
                  onChange={(event) => updateTrip("startDate", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Days</span>
                <input
                  type="number"
                  min="1"
                  max="21"
                  value={trip.days}
                  onChange={(event) => {
                    const days = Math.max(1, Math.min(21, Number(event.target.value) || 1));
                    updateTrip("days", days);
                    setSelectedDay((current) => Math.min(current, days));
                  }}
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
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Pace</span>
                <select
                  value={trip.pace}
                  onChange={(event) => updateTrip("pace", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(PACE_PRESETS).map(([key, pace]) => (
                    <option key={key} value={key}>
                      {pace.label} - max {pace.maxHours}h planned/day
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Day start</span>
                <input
                  type="time"
                  value={trip.startTime}
                  onChange={(event) => updateTrip("startTime", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Day end</span>
                <input
                  type="time"
                  value={trip.endTime}
                  onChange={(event) => updateTrip("endTime", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Daily budget</span>
                <input
                  type="number"
                  min="0"
                  value={trip.dailyBudget}
                  onChange={(event) => updateTrip("dailyBudget", Math.max(0, Number(event.target.value) || 0))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={addBreaks}>
                <Utensils className="h-4 w-4" />
                Add Lunch
              </button>
              <button type="button" className="btn-secondary" onClick={copyPlan}>
                <Clipboard className="h-4 w-4" />
                Copy
              </button>
              <button type="button" className="btn-secondary" onClick={() => exportCsv(trip, activities)}>
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
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Add Activity</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">New activities are added to selected day {selectedDay}.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Activity title</span>
                <input
                  value={newActivity.title}
                  onChange={(event) => setNewActivity((current) => ({ ...current, title: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Fort visit, dinner, boat ride..."
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Place</span>
                <input
                  value={newActivity.place}
                  onChange={(event) => setNewActivity((current) => ({ ...current, place: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Location"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Category</span>
                <select
                  value={newActivity.category}
                  onChange={(event) => setNewActivity((current) => ({ ...current, category: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {CATEGORY_NAMES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Start time</span>
                <input
                  type="time"
                  value={newActivity.start}
                  onChange={(event) => setNewActivity((current) => ({ ...current, start: event.target.value }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Duration min</span>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={newActivity.duration}
                  onChange={(event) => setNewActivity((current) => ({ ...current, duration: Math.max(15, Number(event.target.value) || 15) }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Estimated cost</span>
                <input
                  type="number"
                  min="0"
                  value={newActivity.cost}
                  onChange={(event) => setNewActivity((current) => ({ ...current, cost: Math.max(0, Number(event.target.value) || 0) }))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block min-w-0 md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Note</span>
                <textarea
                  value={newActivity.note}
                  onChange={(event) => setNewActivity((current) => ({ ...current, note: event.target.value }))}
                  className="min-h-24 w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Tickets, food, transport, reminder..."
                />
              </label>
            </div>
            <button type="button" className="btn-primary mt-4 w-full" onClick={addActivity}>
              <Plus className="h-4 w-4" />
              Add To Day {selectedDay}
            </button>
          </article>
        </div>

        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Day Timeline</h2>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Day {selectedDay} uses {(selectedMinutes / 60).toFixed(1)}h and costs {formatMoney(selectedDayCost, trip.currency)}.
                    </p>
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
                    placeholder="Search activity..."
                  />
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="all">All categories</option>
                  {CATEGORY_NAMES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex min-w-0 gap-2 overflow-x-auto pb-2">
              {Array.from({ length: Number(trip.days) || 1 }, (_, index) => {
                const day = index + 1;
                const isActive = day === selectedDay;
                const minutes = stats.dayMinutes[index] || 0;
                const heavy = minutes / 60 > PACE_PRESETS[trip.pace].maxHours;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`shrink-0 rounded-lg border px-4 py-3 text-left transition ${isActive ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wide opacity-80">Day {day}</span>
                    <span className="mt-1 block text-sm font-black">{dayLabel(trip.startDate, day)}</span>
                    <span className={`mt-1 block text-xs font-semibold ${isActive ? "text-white/85" : heavy ? "tool-text-warn" : "text-[var(--muted-foreground)]"}`}>
                      {(minutes / 60).toFixed(1)}h planned
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid min-w-0 gap-3">
              {dayActivities.length ? (
                dayActivities.map((activity) => {
                  const meta = CATEGORY_META[activity.category] || CATEGORY_META.Sightseeing;
                  const Icon = meta.icon;
                  const hasConflict = conflicts.has(activity.id);
                  return (
                    <article
                      key={activity.id}
                      className={`min-w-0 rounded-xl border bg-[var(--background)] p-3 sm:p-4 ${hasConflict ? "border-[var(--danger-border)]" : "border-[var(--border)]"}`}
                    >
                      <div className="tool-form-grid min-w-0 gap-3">
                        <label className="block min-w-0">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Time</span>
                          <input
                            type="time"
                            value={activity.start}
                            onChange={(event) => updateActivity(activity.id, { start: event.target.value })}
                            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Activity</span>
                          <input
                            value={activity.title}
                            onChange={(event) => updateActivity(activity.id, { title: event.target.value })}
                            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Category</span>
                          <select
                            value={activity.category}
                            onChange={(event) => updateActivity(activity.id, { category: event.target.value })}
                            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                          >
                            {CATEGORY_NAMES.map((category) => (
                              <option key={category}>{category}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block min-w-0">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Minutes</span>
                          <input
                            type="number"
                            min="15"
                            step="15"
                            value={activity.duration}
                            onChange={(event) => updateActivity(activity.id, { duration: Math.max(15, Number(event.target.value) || 15) })}
                            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Cost</span>
                          <input
                            type="number"
                            min="0"
                            value={activity.cost}
                            onChange={(event) => updateActivity(activity.id, { cost: Math.max(0, Number(event.target.value) || 0) })}
                            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                          />
                        </label>
                        <button
                          type="button"
                          className="btn-secondary !h-11 !w-11 !p-0"
                          onClick={() => setActivities((current) => current.filter((entry) => entry.id !== activity.id))}
                          aria-label={`Delete ${activity.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-white ${meta.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {activity.category}
                          </span>
                          <span className="rounded-full bg-[var(--muted)] px-3 py-1">{activity.start} - {activityEnd(activity)}</span>
                          <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="min-w-0 break-words">{activity.place}</span>
                          </span>
                          {hasConflict ? <span className="rounded-full tool-status-bad px-3 py-1">Overlap</span> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateActivity(activity.id, { booked: !activity.booked })}
                          className={`rounded-lg border px-4 py-2 text-sm font-bold ${activity.booked ? "tool-callout-good tool-text-good" : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"}`}
                        >
                          {activity.booked ? "Booked" : "Planned"}
                        </button>
                      </div>

                      <label className="mt-3 block min-w-0">
                        <span className="sr-only">Activity note</span>
                        <textarea
                          value={activity.note}
                          onChange={(event) => updateActivity(activity.id, { note: event.target.value })}
                          className="min-h-16 w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center">
                  <CalendarDays className="mx-auto h-10 w-10 text-[var(--primary)]" />
                  <p className="mt-3 text-lg font-black text-[var(--foreground)]">No activities on this view</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Clear filters or add a new activity for this day.</p>
                </div>
              )}
            </div>
          </article>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[1fr_0.8fr]">
            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Wallet className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Cost Breakdown</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Category-wise planned spend.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {Object.entries(stats.categoryCost)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, value]) => (
                    <CategoryBar key={category} label={category} value={value} max={maxCategory} currency={trip.currency} />
                  ))}
              </div>
            </article>

            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Filter className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Trip Signals</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Quick quality checks for the plan.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className={`rounded-lg border p-4 ${conflicts.size ? "tool-callout-bad" : "tool-callout-good"}`}>
                  <p className="text-sm font-black text-[var(--foreground)]">Timing</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{conflicts.size ? `${conflicts.size} activities overlap.` : "No visible overlaps."}</p>
                </div>
                <div className={`rounded-lg border p-4 ${stats.dailyCost > Number(trip.dailyBudget) ? "tool-callout-warn" : "tool-callout-good"}`}>
                  <p className="text-sm font-black text-[var(--foreground)]">Budget</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Daily avg {formatMoney(stats.dailyCost, trip.currency)} vs target {formatMoney(trip.dailyBudget, trip.currency)}.
                  </p>
                </div>
                <div className={`rounded-lg border p-4 ${stats.heavyDays ? "tool-callout-warn" : "tool-callout-good"}`}>
                  <p className="text-sm font-black text-[var(--foreground)]">Pace</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {stats.heavyDays ? `${stats.heavyDays} heavy day(s). Add breaks or reduce stops.` : "Pace matches selected style."}
                  </p>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
