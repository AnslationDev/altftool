"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  CircleAlert,
  Clock,
  Copy,
  Package,
  Refrigerator,
  Search,
  Snowflake,
  Soup,
  ThermometerSnowflake,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { CATEGORIES, FOODS, LOCATIONS, STORAGE_ZONES, riskOf } from "../data";

const LOCATION_ICONS = { pantry: Package, fridge: Refrigerator, freezer: Snowflake };

const STORED_PRESETS = [
  { label: "Just now", hours: 0 },
  { label: "This morning", hours: 8 },
  { label: "Yesterday", hours: 24 },
  { label: "2 days ago", hours: 48 },
  { label: "A week ago", hours: 168 },
  { label: "A month ago", hours: 720 },
];

const normalize = (value) => String(value || "").toLowerCase().trim();

function shortDuration(hours) {
  if (!hours || hours <= 0) return "No";
  if (hours < 24) return `${hours} hr`;
  if (hours < 168) return `${Math.round(hours / 24)} d`;
  if (hours < 720) return `${Math.round(hours / 168)} wk`;
  if (hours < 8760) return `${Math.round(hours / 720)} mo`;
  const years = hours / 8760;
  return `${years % 1 === 0 ? years : years.toFixed(1)} yr`;
}

function elapsedLabel(hours) {
  if (hours < 1) return `${Math.max(0, Math.round(hours * 60))} minutes`;
  if (hours < 48) {
    const whole = Math.floor(hours);
    const minutes = Math.round((hours - whole) * 60);
    return `${whole} hour${whole === 1 ? "" : "s"}${minutes ? ` ${minutes} min` : ""}`;
  }
  const days = Math.floor(hours / 24);
  const rest = Math.round(hours - days * 24);
  return `${days} day${days === 1 ? "" : "s"}${rest ? ` ${rest} hr` : ""}`;
}

function toLocalInputValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const VERDICTS = {
  fresh: {
    label: "Fresh",
    tone: "var(--anslation-ds-success)",
    soft: "var(--anslation-ds-success-soft)",
    Icon: BadgeCheck,
  },
  soon: {
    label: "Use today",
    tone: "var(--anslation-ds-warning)",
    soft: "var(--anslation-ds-warning-soft)",
    Icon: Clock,
  },
  risky: {
    label: "Risky",
    tone: "var(--anslation-ds-danger)",
    soft: "var(--anslation-ds-danger-soft)",
    Icon: TriangleAlert,
  },
  past: {
    label: "Past its best",
    tone: "var(--anslation-ds-warning)",
    soft: "var(--anslation-ds-warning-soft)",
    Icon: CircleAlert,
  },
  unsuitable: {
    label: "Wrong place",
    tone: "var(--anslation-ds-danger)",
    soft: "var(--anslation-ds-danger-soft)",
    Icon: TriangleAlert,
  },
};

function DurationPill({ locationId, entry }) {
  const Icon = LOCATION_ICONS[locationId];
  const usable = entry && entry.max > 0;
  return (
    <div
      className={`rounded-md border p-2.5 ${
        usable
          ? "border-[var(--border)] bg-[var(--background)]"
          : "border-dashed border-[var(--border)] bg-[var(--muted)]"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {locationId}
      </div>
      <p
        className={`mt-1 text-sm font-semibold ${
          usable ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
        }`}
      >
        {shortDuration(entry?.max)}
      </p>
      <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted-foreground)]">
        {entry?.label || "Not suitable"}
      </p>
    </div>
  );
}

function FoodCard({ food, expanded, onToggle }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold">{food.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {CATEGORIES.find((category) => category.id === food.category)?.label}
            {food.indian ? " · Indian kitchen" : ""}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {LOCATIONS.map((location) => (
          <DurationPill key={location.id} locationId={location.id} entry={food[location.id]} />
        ))}
      </div>

      {expanded && (
        <div className="mt-3 grid gap-3 border-t border-[var(--border)] pt-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Storage tip
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{food.tips}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Signs it has gone
            </p>
            <ul className="mt-1 grid gap-1">
              {food.signs.map((sign) => (
                <li key={sign} className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--anslation-ds-danger)]" />
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState("dal-cooked");

  const [checkFoodId, setCheckFoodId] = useState("dal-cooked");
  const [checkLocation, setCheckLocation] = useState("fridge");
  const [storedAt, setStoredAt] = useState("");
  const [now, setNow] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const start = Date.now();
    setNow(start);
    setStoredAt(toLocalInputValue(new Date(start - 12 * 3600000)));
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return FOODS.filter((food) => {
      const inCategory =
        activeCategory === "all" ||
        (activeCategory === "indian" ? food.indian : food.category === activeCategory);
      if (!inCategory) return false;
      if (!needle) return true;
      return (
        normalize(food.name).includes(needle) ||
        normalize(food.tips).includes(needle) ||
        food.signs.some((sign) => normalize(sign).includes(needle))
      );
    });
  }, [query, activeCategory]);

  const checkFood = useMemo(
    () => FOODS.find((food) => food.id === checkFoodId) || FOODS[0],
    [checkFoodId]
  );

  const availableLocations = useMemo(
    () => LOCATIONS.filter((location) => (checkFood[location.id]?.max || 0) > 0),
    [checkFood]
  );

  const verdict = useMemo(() => {
    if (!now || !storedAt) return null;
    const entry = checkFood[checkLocation];
    const stamp = new Date(storedAt).getTime();
    if (Number.isNaN(stamp)) return null;

    if (!entry || entry.max <= 0) {
      return {
        key: "unsuitable",
        headline: entry?.label || "Not suitable",
        detail: `${checkFood.name} should not be kept in the ${checkLocation}. Move it to a place from the table above.`,
        ratio: 1,
      };
    }

    const elapsed = (now - stamp) / 3600000;
    if (elapsed < 0) {
      return {
        key: "fresh",
        headline: "Stored in the future",
        detail: "Pick a time in the past to get a verdict.",
        ratio: 0,
      };
    }

    const ratio = elapsed / entry.max;
    const remaining = entry.max - elapsed;
    const highRisk = riskOf(checkFood) === "high";

    if (ratio <= 0.6) {
      return {
        key: "fresh",
        headline: `Fresh — about ${elapsedLabel(remaining)} of the window left`,
        detail: `Kept in the ${checkLocation}, ${checkFood.name.toLowerCase()} is good for ${entry.label.toLowerCase()}. You are ${elapsedLabel(elapsed)} in.`,
        ratio,
        elapsed,
        remaining,
        entry,
      };
    }
    if (ratio <= 1) {
      return {
        key: "soon",
        headline: `Use today — roughly ${elapsedLabel(Math.max(remaining, 0))} left`,
        detail: `You are ${elapsedLabel(elapsed)} into a ${entry.label.toLowerCase()} window. Still fine if it smells and looks right, but eat it now rather than tomorrow.`,
        ratio,
        elapsed,
        remaining,
        entry,
      };
    }
    return {
      key: highRisk ? "risky" : "past",
      headline: highRisk
        ? `Risky — ${elapsedLabel(elapsed - entry.max)} past the safe window`
        : `Past its best — ${elapsedLabel(elapsed - entry.max)} over`,
      detail: highRisk
        ? `${checkFood.name} in the ${checkLocation} is rated for ${entry.label.toLowerCase()}. You are at ${elapsedLabel(elapsed)}. Food poisoning bacteria do not always change the smell or taste — when in doubt, throw it out.`
        : `${checkFood.name} in the ${checkLocation} is rated for ${entry.label.toLowerCase()}. You are at ${elapsedLabel(elapsed)}. This is usually a quality problem rather than a safety one, so check it against the signs below.`,
      ratio,
      elapsed,
      remaining,
      entry,
    };
  }, [now, storedAt, checkFood, checkLocation]);

  const setStoredHoursAgo = (hours) => {
    if (!now) return;
    setStoredAt(toLocalInputValue(new Date(now - hours * 3600000)));
  };

  const copySummary = async () => {
    if (!verdict) return;
    const text = [
      `${checkFood.name} — ${VERDICTS[verdict.key].label}`,
      `Stored in: ${checkLocation}`,
      `Safe window: ${checkFood[checkLocation]?.label || "not suitable"}`,
      verdict.headline,
      "",
      "Check for:",
      ...checkFood.signs.map((sign) => `- ${sign}`),
      "",
      "Guide values only. Your eyes, nose and the packaging date always win.",
    ].join("\n");
    const success = await safeCopyText(text);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const verdictMeta = verdict ? VERDICTS[verdict.key] : null;
  const VerdictIcon = verdictMeta?.Icon || Clock;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Refrigerator className="h-4 w-4" />
            Kitchen reference
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Food Shelf Life Guide</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            How long does it actually keep? Look up {FOODS.length} everyday foods — including paneer,
            curd, cooked dal, chapati dough and coconut chutney — with pantry, fridge and freezer
            windows, storage tips and the exact signs of spoilage. Then check whether last night&apos;s
            leftovers are still worth eating.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
              Is it still good?
            </h2>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Food</span>
              <select
                value={checkFoodId}
                onChange={(event) => {
                  const next = event.target.value;
                  setCheckFoodId(next);
                  const food = FOODS.find((item) => item.id === next);
                  if (food && (food[checkLocation]?.max || 0) <= 0) {
                    const fallback = LOCATIONS.find((location) => (food[location.id]?.max || 0) > 0);
                    if (fallback) setCheckLocation(fallback.id);
                  }
                }}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {CATEGORIES.map((category) => (
                  <optgroup key={category.id} label={category.label}>
                    {FOODS.filter((food) => food.category === category.id).map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="mt-4">
              <span className="text-sm font-semibold">Stored in</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {LOCATIONS.map((location) => {
                  const Icon = LOCATION_ICONS[location.id];
                  const usable = (checkFood[location.id]?.max || 0) > 0;
                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => setCheckLocation(location.id)}
                      className={`flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs font-semibold capitalize transition ${
                        checkLocation === location.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : usable
                            ? "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                            : "border-dashed border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {location.id}
                    </button>
                  );
                })}
              </div>
              {availableLocations.length < LOCATIONS.length && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Dashed options are not recommended for this food.
                </p>
              )}
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Cooked or stored at</span>
              <input
                type="datetime-local"
                value={storedAt}
                onChange={(event) => setStoredAt(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {STORED_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setStoredHoursAgo(preset.hours)}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {verdict && verdictMeta && (
              <div className="mt-5" aria-live="polite">
                <div
                  className="rounded-lg border p-4"
                  style={{ borderColor: verdictMeta.tone, background: verdictMeta.soft }}
                >
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase"
                    style={{ color: verdictMeta.tone }}
                  >
                    <VerdictIcon className="h-4 w-4" />
                    {verdictMeta.label}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {verdict.headline}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)] opacity-80">
                    {verdict.detail}
                  </p>
                  {verdict.entry && (
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, verdict.ratio * 100)}%`,
                            background: verdictMeta.tone,
                          }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] font-semibold text-[var(--foreground)] opacity-70">
                        {Math.round(verdict.ratio * 100)}% of the {shortDuration(verdict.entry.max)}{" "}
                        window used
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Before you eat it, check for
                  </p>
                  <ul className="mt-2 grid gap-1">
                    {checkFood.signs.map((sign) => (
                      <li key={sign} className="flex gap-2 text-sm leading-6">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--anslation-ds-danger)]" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={copySummary}
                  className="btn-secondary mt-3 min-h-9 w-full px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy verdict"}
                </button>

                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  Method: elapsed time ÷ the storage window from the table. Under 60% used is fresh,
                  60-100% means use it today, over 100% is past the window.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <label className="block">
              <span className="text-sm font-semibold">Search the guide</span>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="paneer, cooked rice, chapati dough, mango..."
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </div>
            </label>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All foods" },
                ...CATEGORIES,
                { id: "indian", label: "Indian kitchen" },
              ].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    activeCategory === category.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase text-[var(--muted-foreground)]" aria-live="polite">
              Showing {filtered.length} of {FOODS.length} foods
            </p>

            <div className="mt-3 grid max-h-[900px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 2xl:grid-cols-2">
              {filtered.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  expanded={expandedId === food.id}
                  onToggle={() => setExpandedId((prev) => (prev === food.id ? null : food.id))}
                />
              ))}
              {filtered.length === 0 && (
                <div className="rounded-md bg-[var(--muted)] p-8 text-center sm:col-span-2">
                  <Search className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="mt-3 text-sm font-semibold">Nothing matched that</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Try a simpler word, or browse by category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border-2 p-6" style={{ borderColor: "var(--anslation-ds-danger)", background: "var(--anslation-ds-danger-soft)" }}>
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase"
            style={{ color: "var(--anslation-ds-danger)" }}
          >
            <TriangleAlert className="h-4 w-4" />
            The danger zone
          </div>
          <h2 className="mt-3 text-2xl font-semibold">The 2-hour rule</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7">
            Bacteria multiply fastest between <strong>4 °C and 60 °C</strong>. Cooked food left in
            that band doubles its bacterial load roughly every 20 minutes.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Under 32 °C", "2 hours", "Refrigerate cooked food within 2 hours of it coming off the stove."],
              ["Above 32 °C", "1 hour", "An Indian summer afternoon halves the clock. Lunch left out until evening is not safe."],
              ["Reheating", "Rolling boil", "Reheat to steaming hot all the way through, not lukewarm. Reheat only once."],
            ].map(([title, value, detail]) => (
              <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{title}</p>
                <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                  {value}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7">
            The clock is cumulative. Food that sat out for 90 minutes at lunch has 30 minutes left in
            its budget at dinner — not another two hours. Cooked rice is the sharpest case:{" "}
            <strong>Bacillus cereus</strong> spores survive boiling and make a toxin that reheating
            cannot destroy.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_390px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex items-center gap-2">
              <ThermometerSnowflake className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-2xl font-semibold">Fridge zone map</h2>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              A fridge is not one temperature. The door swings 5-6 °C every time you open it, and the
              bottom shelf is the coldest spot. Putting the right thing in the right zone buys days.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="py-2 pr-3 font-semibold">Zone</th>
                    <th className="py-2 pr-3 font-semibold">Temp</th>
                    <th className="py-2 pr-3 font-semibold">Put here</th>
                    <th className="py-2 font-semibold">Keep out</th>
                  </tr>
                </thead>
                <tbody>
                  {STORAGE_ZONES.map((zone) => (
                    <tr key={zone.id} className="border-b border-[var(--border)] align-top">
                      <td className="py-3 pr-3 font-semibold">{zone.zone}</td>
                      <td className="py-3 pr-3 text-[var(--muted-foreground)]">{zone.temp}</td>
                      <td className="py-3 pr-3 text-[var(--muted-foreground)]">{zone.keep}</td>
                      <td className="py-3 text-[var(--muted-foreground)]">{zone.avoid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Soup className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">FIFO: first in, first out</h2>
              </div>
              <ul className="mt-3 grid gap-2.5">
                {[
                  "New stock goes behind the old, never in front of it.",
                  "Label leftovers with the date, not the day of the week — Tuesday means nothing on Friday.",
                  "Keep one shelf as the eat-me-first shelf and raid it before you cook anything new.",
                  "Cool food in shallow boxes, not deep pots. A full patila keeps its centre warm for hours.",
                  "Decant only what you will use. Never pour leftovers back into the original packet.",
                  "Shop your fridge before you shop the store — this is where the money leaks.",
                ].map((line) => (
                  <li key={line} className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Freezer truths</h2>
              </div>
              <ul className="mt-3 grid gap-2.5">
                {[
                  "At a true -18 °C, frozen food stays safe indefinitely. The dates here are about quality, not safety.",
                  "Thaw in the fridge or under cold running water, never on the kitchen counter.",
                  "Never refreeze food that has thawed all the way through unless you cook it first.",
                  "Freezer burn is dry, greyish patches. It is ugly, not dangerous — cut it away.",
                  "Freeze flat in portions. A brick takes hours to thaw; a flat bag takes minutes.",
                ].map((line) => (
                  <li key={line} className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <h2 className="text-sm font-semibold">Your senses and the packaging date always win</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            These are general guide values based on standard food-safety guidance and typical Indian
            kitchen conditions. Real shelf life depends on your fridge temperature, the weather, how
            the food was handled before you bought it, and how often the container was opened. A
            printed use-by date on a sealed pack overrides anything here, and so does your own nose.
            Some dangerous bacteria change nothing you can see, smell or taste — when in doubt, throw
            it out. This tool offers general awareness, not medical advice; if you think you have
            eaten spoiled food and feel unwell, consult a doctor.
          </p>
        </section>
      </div>
    </main>
  );
}
