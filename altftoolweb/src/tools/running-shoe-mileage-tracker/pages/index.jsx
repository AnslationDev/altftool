"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Footprints, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  MAX_LIFE_KM,
  MIN_LIFE_KM,
  REPLACE_SOON_AT,
  SHOE_TYPES,
  defaultLifeKm,
  kmToMiles,
  summariseFleet,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const STORAGE_KEY = "altft-running-shoe-mileage";

const km = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} km` : DASH);
const kmMi = (value) =>
  Number.isFinite(value) ? `${NUM0.format(value)} km (${NUM0.format(kmToMiles(value))} mi)` : DASH;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  fresh: "bg-[var(--success-soft)] text-[var(--success)]",
  good: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  soon: "bg-[var(--warning-soft)] text-[var(--warning)]",
  retire: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const BAR_STYLE = {
  fresh: "bg-[var(--success)]",
  good: "bg-[var(--primary)]",
  soon: "bg-[var(--warning)]",
  retire: "bg-[var(--danger)]",
};

const seedShoes = (todayIso) => [
  {
    id: 1,
    name: "Daily trainer",
    typeId: "daily-trainer",
    lifeKm: "640",
    distanceKm: "420",
    firstUsedIso: `${Number(todayIso.slice(0, 4)) - 1}-11-01`,
  },
  {
    id: 2,
    name: "Race day",
    typeId: "racer",
    lifeKm: "320",
    distanceKm: "265",
    firstUsedIso: `${todayIso.slice(0, 4)}-02-15`,
  },
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10));
  const [shoes, setShoes] = useState(() => seedShoes(new Date().toISOString().slice(0, 10)));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) setShoes(parsed);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shoes));
    } catch {
      /* storage may be full or blocked */
    }
  }, [shoes]);

  const fleet = useMemo(
    () =>
      summariseFleet(
        shoes.map((shoe) => ({
          name: shoe.name || "Untitled pair",
          typeId: shoe.typeId,
          lifeKm: toNumber(shoe.lifeKm),
          distanceKm: toNumber(shoe.distanceKm),
          firstUsedIso: shoe.firstUsedIso,
        })),
        todayIso
      ),
    [shoes, todayIso]
  );

  const firstError = fleet.rows.find((row) => row.error)?.error ?? "";
  const hasFleet = fleet.pairs > 0;

  const summary = useMemo(() => {
    if (!hasFleet) return "";
    const lines = ["Running Shoe Mileage Tracker", `Total logged: ${kmMi(fleet.totalDistanceKm)}`];
    fleet.rows.forEach((row) => {
      if (row.error) return;
      lines.push(
        `${row.name}: ${NUM0.format(row.distanceKm)} / ${NUM0.format(row.lifeKm)} km · ${NUM0.format(
          row.percentUsed
        )}% used · ${row.status.label}`
      );
    });
    return lines.join("\n");
  }, [fleet, hasFleet]);

  const updateShoe = (id, patch) => {
    setShoes((list) => list.map((shoe) => (shoe.id === id ? { ...shoe, ...patch } : shoe)));
  };

  const addShoe = () => {
    setShoes((list) => {
      const nextId = list.reduce((max, shoe) => Math.max(max, shoe.id), 0) + 1;
      return [
        ...list,
        {
          id: nextId,
          name: `Pair ${list.length + 1}`,
          typeId: "daily-trainer",
          lifeKm: String(defaultLifeKm("daily-trainer")),
          distanceKm: "0",
          firstUsedIso: todayIso,
        },
      ];
    });
  };

  const removeShoe = (id) => setShoes((list) => list.filter((shoe) => shoe.id !== id));

  const addKm = (id, amount) => {
    setShoes((list) =>
      list.map((shoe) => {
        if (shoe.id !== id) return shoe;
        const current = toNumber(shoe.distanceKm);
        const base = Number.isNaN(current) ? 0 : current;
        return { ...shoe, distanceKm: String(base + amount) };
      })
    );
  };

  const changeType = (id, typeId) => updateShoe(id, { typeId, lifeKm: String(defaultLifeKm(typeId)) });

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setShoes(seedShoes(todayIso));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Shoe rotation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Running Shoe Mileage Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log the kilometres on every pair, watch the percentage of rated midsole life used, and get
          a warning at {REPLACE_SOON_AT}% so the next pair is broken in before the old one is done.
          Everything stays in this browser.
        </p>
      </header>

      {firstError && (
        <p
          role="alert"
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {firstError}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total logged across the rotation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasFleet ? km(fleet.totalDistanceKm) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasFleet
                ? `${NUM0.format(kmToMiles(fleet.totalDistanceKm))} miles across ${fleet.pairs} pair${
                    fleet.pairs === 1 ? "" : "s"
                  }`
                : "Add a pair to start tracking."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy shoe mileage summary"
              className={GHOST_BTN}
              disabled={!hasFleet}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the tracker to the sample rotation"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pairs tracked", hasFleet ? NUM0.format(fleet.pairs) : DASH],
            ["Needing replacement soon", hasFleet ? NUM0.format(fleet.needsAttention) : DASH],
            ["Rated life still left", hasFleet ? kmMi(fleet.totalRemainingKm) : DASH],
            [
              "Combined weekly volume",
              Number.isFinite(fleet.fleetWeeklyKm)
                ? `${NUM1.format(fleet.fleetWeeklyKm)} km / week`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6 space-y-4">
        {shoes.map((shoe, index) => {
          const row = fleet.rows[index] ?? {};
          const invalid = Boolean(row.error);
          return (
            <section key={shoe.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{shoe.name || "Untitled pair"}</h2>
                  {!invalid && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLE[row.status.id]
                      }`}
                    >
                      {row.status.label}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeShoe(shoe.id)}
                  aria-label={`Remove ${shoe.name || "this pair"}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-3">
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={
                    invalid
                      ? "Mileage unavailable"
                      : `${NUM0.format(row.percentUsed)} percent of rated life used`
                  }
                >
                  <span
                    className={`block h-full ${invalid ? "bg-[var(--muted)]" : BAR_STYLE[row.status.id]}`}
                    style={{ width: invalid ? "0%" : `${row.percentClamped}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {invalid
                    ? row.error
                    : `${NUM0.format(row.percentUsed)}% of rated life used · ${row.status.advice}`}
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`shoe-name-${shoe.id}`}>
                    Pair name
                  </label>
                  <input
                    id={`shoe-name-${shoe.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={shoe.name}
                    onChange={(event) => updateShoe(shoe.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`shoe-type-${shoe.id}`}>
                    Shoe type
                  </label>
                  <select
                    id={`shoe-type-${shoe.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={shoe.typeId}
                    onChange={(event) => changeType(shoe.id, event.target.value)}
                  >
                    {SHOE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label} · {type.lifeKm} km
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`shoe-distance-${shoe.id}`}>
                    Kilometres logged
                  </label>
                  <input
                    id={`shoe-distance-${shoe.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={shoe.distanceKm}
                    onChange={(event) => updateShoe(shoe.id, { distanceKm: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`shoe-life-${shoe.id}`}>
                    Rated life (km)
                  </label>
                  <input
                    id={`shoe-life-${shoe.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min={MIN_LIFE_KM}
                    max={MAX_LIFE_KM}
                    step="10"
                    value={shoe.lifeKm}
                    onChange={(event) => updateShoe(shoe.id, { lifeKm: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`shoe-date-${shoe.id}`}>
                    First run in them
                  </label>
                  <input
                    id={`shoe-date-${shoe.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={shoe.firstUsedIso}
                    onChange={(event) => updateShoe(shoe.id, { firstUsedIso: event.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[5, 10, 21, 42].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => addKm(shoe.id, amount)}
                    aria-label={`Add ${amount} kilometres to ${shoe.name || "this pair"}`}
                    className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    +{amount} km
                  </button>
                ))}
              </div>

              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Distance", invalid ? DASH : kmMi(row.distanceKm)],
                  ["Rated life", invalid ? DASH : kmMi(row.lifeKm)],
                  ["Left before retirement", invalid ? DASH : kmMi(row.remainingKm)],
                  [
                    "Average since first run",
                    !invalid && Number.isFinite(row.weeklyKm)
                      ? `${NUM1.format(row.weeklyKm)} km / week`
                      : DASH,
                  ],
                  [
                    "Projected retirement",
                    !invalid && row.retireDateIso
                      ? `${row.retireDateIso} (${NUM1.format(row.weeksRemaining)} weeks)`
                      : DASH,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <button type="button" onClick={addShoe} className={`mt-4 w-full sm:w-auto ${PRIMARY_BTN}`}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add another pair
      </button>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rated life is guidance, not a hard limit — heavier runners, rough surfaces and hot storage
        all shorten it, while a rotation of two or three pairs lengthens it. Informational only; see
        a physiotherapist if new aches appear as a pair ages.
      </p>
    </main>
  );
}
