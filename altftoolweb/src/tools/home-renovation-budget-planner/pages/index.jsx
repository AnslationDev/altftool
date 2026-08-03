"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hammer, Plus, RotateCcw, Trash2 } from "lucide-react";

import { QUALITY_TIERS, planRenovationBudget } from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STARTER_ROOMS = [
  { id: 1, name: "Kitchen", area: "120", ratePerSqft: "2500" },
  { id: 2, name: "Living & dining", area: "250", ratePerSqft: "1200" },
  { id: 3, name: "Master bedroom", area: "150", ratePerSqft: "1000" },
  { id: 4, name: "Bathroom", area: "60", ratePerSqft: "2000" },
];

const DEFAULTS = {
  tier: "premium",
  extras: "150000",
  fees: "8",
  contingency: "10",
  applyGst: true,
  gstRate: "18",
  months: "6",
  existing: "500000",
  returnPct: "6",
};

const blankRoom = (id) => ({ id, name: "", area: "", ratePerSqft: "" });

export default function ToolHome() {
  const [rooms, setRooms] = useState(STARTER_ROOMS);
  const [nextId, setNextId] = useState(STARTER_ROOMS.length + 1);
  const [tier, setTier] = useState(DEFAULTS.tier);
  const [extras, setExtras] = useState(DEFAULTS.extras);
  const [fees, setFees] = useState(DEFAULTS.fees);
  const [contingency, setContingency] = useState(DEFAULTS.contingency);
  const [applyGst, setApplyGst] = useState(DEFAULTS.applyGst);
  const [gstRate, setGstRate] = useState(DEFAULTS.gstRate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      planRenovationBudget({
        rooms,
        qualityTier: tier,
        extras,
        professionalFeesPct: fees,
        contingencyPct: contingency,
        applyGst,
        gstRatePct: gstRate,
        monthsToStart: months,
        existingSavings: existing,
        savingsReturn: returnPct,
      }),
    [rooms, tier, extras, fees, contingency, applyGst, gstRate, months, existing, returnPct],
  );

  const hasError = Boolean(result.error);

  const updateRoom = (id, key, value) => {
    setRooms((current) => current.map((room) => (room.id === id ? { ...room, [key]: value } : room)));
  };

  const addRoom = () => {
    setRooms((current) => [...current, blankRoom(nextId)]);
    setNextId((current) => current + 1);
  };

  const removeRoom = (id) => {
    setRooms((current) => (current.length > 1 ? current.filter((room) => room.id !== id) : current));
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the budget? This will replace every room and setting with the starter example and cannot be undone.",
      )
    ) {
      return;
    }
    setRooms(STARTER_ROOMS);
    setNextId(STARTER_ROOMS.length + 1);
    setTier(DEFAULTS.tier);
    setExtras(DEFAULTS.extras);
    setFees(DEFAULTS.fees);
    setContingency(DEFAULTS.contingency);
    setApplyGst(DEFAULTS.applyGst);
    setGstRate(DEFAULTS.gstRate);
    setMonths(DEFAULTS.months);
    setExisting(DEFAULTS.existing);
    setReturnPct(DEFAULTS.returnPct);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Home Renovation Budget",
      `Finish quality: ${result.tierLabel} (rate × ${result.tierMultiplier})`,
      `Works across ${num(result.totalArea)} sq ft: ${money(result.worksTotal)}`,
      `Appliances, furniture and permits: ${money(result.extras)}`,
      `Professional fees: ${money(result.fees)}`,
      `Contingency: ${money(result.contingency)}`,
      result.gstApplied ? `GST at ${num(result.gstRatePct)}%: ${money(result.gst)}` : "GST: not applied",
      `Grand total: ${money(result.grandTotal)}${result.costPerSqft === null ? "" : ` (${money(result.costPerSqft)} per sq ft)`}`,
      result.fullyFunded
        ? "Already funded."
        : `Save ${money(result.monthlySaving)} a month for ${result.monthsToStart} months.`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => copy("summary", summary, { label: "Renovation budget" });

  const settingFields = [
    { id: "rn-extras", label: "Appliances, furniture & permits (₹)", value: extras, set: setExtras, step: "10000", min: "0" },
    { id: "rn-fees", label: "Architect or designer fee (% of project cost)", value: fees, set: setFees, step: "0.5", min: "0" },
    { id: "rn-contingency", label: "Contingency buffer (%)", value: contingency, set: setContingency, step: "1", min: "0" },
    { id: "rn-gstrate", label: "GST rate on the works contract (%)", value: gstRate, set: setGstRate, step: "0.5", min: "0" },
    { id: "rn-months", label: "Months before work starts", value: months, set: setMonths, step: "1", min: "1" },
    { id: "rn-existing", label: "Already saved (₹)", value: existing, set: setExisting, step: "50000", min: "0" },
    { id: "rn-return", label: "Return on those savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
  ];

  const rows = hasError
    ? [
        ["Works across all rooms", DASH],
        ["Appliances, furniture & permits", DASH],
        ["Subtotal", DASH],
        ["Professional fees", DASH],
        ["Contingency", DASH],
        ["GST", DASH],
        ["Cost per square foot", DASH],
        ["Save each month", DASH],
      ]
    : [
        ["Works across all rooms", `${money(result.worksTotal)} · ${num(result.totalArea)} sq ft`],
        ["Appliances, furniture & permits", money(result.extras)],
        ["Subtotal", money(result.subtotal)],
        ["Professional fees", money(result.fees)],
        ["Contingency", money(result.contingency)],
        ["GST", result.gstApplied ? `${money(result.gst)} at ${num(result.gstRatePct)}%` : "Not applied"],
        ["Cost per square foot", result.costPerSqft === null ? DASH : money(result.costPerSqft)],
        [
          "Save each month",
          result.fullyFunded
            ? "Already funded"
            : `${money(result.monthlySaving)} for ${result.monthsToStart} months`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hammer className="h-4 w-4" aria-hidden="true" />
          Renovation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Home Renovation Budget Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price each room on its own rate per square foot — a kitchen is not a bedroom — then add
          the parts of a quote that surprise people: designer fees, GST on the works contract, and
          a contingency for what the walls hide.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rooms</h2>
        <ul className="mt-4 space-y-4">
          {rooms.map((room, index) => (
            <li key={room.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`rn-name-${room.id}`}>
                    Room
                  </label>
                  <input
                    id={`rn-name-${room.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    placeholder={`Room ${index + 1}`}
                    value={room.name}
                    onChange={(event) => updateRoom(room.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rn-area-${room.id}`}>
                    Area (sq ft)
                  </label>
                  <input
                    id={`rn-area-${room.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="5"
                    value={room.area}
                    onChange={(event) => updateRoom(room.id, "area", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rn-rate-${room.id}`}>
                    Rate (₹ per sq ft)
                  </label>
                  <input
                    id={`rn-rate-${room.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    value={room.ratePerSqft}
                    onChange={(event) => updateRoom(room.id, "ratePerSqft", event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  disabled={rooms.length <= 1}
                  aria-label={`Remove ${room.name || `room ${index + 1}`}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addRoom} className={`mt-4 ${GHOST_BTN}`} aria-label="Add another room">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add room
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Quality, fees and funding</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rn-tier">
              Finish quality
            </label>
            <select
              id="rn-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tier}
              onChange={(event) => setTier(event.target.value)}
            >
              {QUALITY_TIERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} (×{entry.multiplier})
                </option>
              ))}
            </select>
          </div>
          {settingFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
          <div className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium sm:col-span-2">
            <input
              id="rn-gst"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={applyGst}
              onChange={(event) => setApplyGst(event.target.checked)}
            />
            <label htmlFor="rn-gst" className="flex-1 cursor-pointer py-2">
              Registered contractor billing a works contract (apply GST)
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total renovation budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {hasError ? DASH : money(result.grandTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the budget."
                : `${result.tierLabel.split(" — ")[0]} finish · rate × ${result.tierMultiplier}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy renovation budget"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("summary") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("summary") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the budget" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span aria-live="polite" role="status" className="sr-only">
          {announcement}
        </span>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Room by room</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Room</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Area</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate used</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cost</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.rooms.map((room) => (
                  <tr key={room.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{room.name}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num(room.area)} sq ft
                    </td>
                    <td className="py-2 pr-3 text-right">{money(room.effectiveRate)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(room.cost)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {num(room.sharePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            &ldquo;Rate used&rdquo; is the rate you entered multiplied by the finish-quality factor,
            so a premium kitchen at a ₹2,500 base rate is costed at ₹3,500 a square foot.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates per square foot vary widely by city, contractor and the condition of the existing
        structure — get at least two written quotes before committing. GST treatment depends on
        whether you engage a registered contractor for a works contract or buy materials yourself;
        confirm it with a tax professional. Informational only, not tax advice.
      </p>
    </main>
  );
}
