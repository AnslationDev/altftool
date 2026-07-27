"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";

import {
  buildCarryOnPlan,
  CABIN_PRESETS,
  LIQUID_BAG_MAX_ML,
  LIQUID_CONTAINER_MAX_ML,
  LIQUID_ITEMS,
} from "../lib";

const DEFAULT_LIQUIDS = ["shampoo", "toothpaste", "deodorant", "sunscreen"];

const DEFAULTS = {
  days: "7",
  laundryEveryDays: "0",
  cabinPreset: "indianLcc",
  extraShoePairs: "1",
  wearBulkiestOnPlane: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [liquids, setLiquids] = useState(DEFAULT_LIQUIDS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const toggleLiquid = (id) => {
    setLiquids((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildCarryOnPlan({
        days: toNumber(form.days),
        laundryEveryDays: toNumber(form.laundryEveryDays),
        cabinPreset: form.cabinPreset,
        liquids,
        wearBulkiestOnPlane: form.wearBulkiestOnPlane,
        extraShoePairs: toNumber(form.extraShoePairs),
      }),
    [form, liquids],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Carry-on plan — ${result.days} days`,
      `Capsule: ${result.capsule.tops} tops x ${result.capsule.bottoms} bottoms = ${result.capsule.outfits} outfits`,
      `Packed: ${NUM.format(result.packedKg)} kg, ${NUM.format(result.packedVolumeL)} L of ${NUM.format(result.usableLitres)} L usable`,
      `Liquids: ${result.liquids.totalMl} ml of ${LIQUID_BAG_MAX_ML} ml`,
      result.fitsCarryOn ? "Verdict: fits in the cabin bag" : "Verdict: does not fit yet",
      "",
      "CLOTHING",
    ];
    for (const item of result.clothing) {
      lines.push(`  [ ] ${item.total} x ${item.name}${item.worn ? ` (${item.worn} worn on the plane)` : ""}`);
    }
    lines.push("", "KIT");
    for (const item of result.kit) lines.push(`  [ ] ${item.name}`);
    lines.push("", "LIQUIDS BAG");
    for (const item of result.liquids.items) lines.push(`  [ ] ${item.name} — ${item.ml} ml`);
    return lines.join("\n").trim();
  }, [hasError, result]);

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
    setForm(DEFAULTS);
    setLiquids(DEFAULT_LIQUIDS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Cabin bag only
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Carry-On Only Trip Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The fewest garments that still dress you for every day, a liquids bag that will clear
          security, and both checked against your cabin weight and size limits.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="days">
              Trip length (days)
            </label>
            <input
              id="days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              value={form.days}
              onChange={(event) => setField("days", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="laundry">
              Laundry every N days (0 = none)
            </label>
            <input
              id="laundry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              value={form.laundryEveryDays}
              onChange={(event) => setField("laundryEveryDays", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="extra-shoes">
              Extra pairs of shoes packed
            </label>
            <input
              id="extra-shoes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="3"
              value={form.extraShoePairs}
              onChange={(event) => setField("extraShoePairs", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cabin-preset">
              Cabin bag allowance
            </label>
            <select
              id="cabin-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.cabinPreset}
              onChange={(event) => setField("cabinPreset", event.target.value)}
            >
              {Object.entries(CABIN_PRESETS).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="wear-bulkiest"
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                form.wearBulkiestOnPlane
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)] bg-[var(--background)]"
              }`}
            >
              <input
                id="wear-bulkiest"
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                checked={form.wearBulkiestOnPlane}
                onChange={(event) => setField("wearBulkiestOnPlane", event.target.checked)}
              />
              Wear the jacket, shoes and one outfit on the plane
            </label>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Liquids you plan to carry
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {LIQUID_ITEMS.map((item) => {
              const checked = liquids.includes(item.id);
              return (
                <label
                  key={item.id}
                  htmlFor={`liquid-${item.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`liquid-${item.id}`}
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleLiquid(item.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {item.ml} ml{item.solidSwap ? ` · solid option: ${item.solidSwap}` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Packed weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.packedKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : result.fitsCarryOn
                  ? "Fits the cabin allowance on weight, size and liquids"
                  : "Does not clear every cabin limit yet"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the carry-on plan to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Capsule wardrobe",
              hasError
                ? DASH
                : `${result.capsule.tops} tops x ${result.capsule.bottoms} bottoms = ${result.capsule.outfits} outfits`,
            ],
            ["Outfits actually needed", hasError ? DASH : String(result.capsule.outfitsNeeded)],
            [
              "Weight limit",
              hasError
                ? DASH
                : result.weightLimitKg === 0
                  ? "No stated weight limit"
                  : `${result.weightLimitKg} kg — ${NUM.format(Math.abs(result.weightSpareKg))} kg ${result.weightOk ? "spare" : "over"}`,
            ],
            [
              "Packed volume",
              hasError
                ? DASH
                : `${NUM.format(result.packedVolumeL)} L of ${NUM.format(result.usableLitres)} L usable`,
            ],
            ["Bag interior volume", hasError ? DASH : `${NUM.format(result.bagLitres)} L`],
            [
              "Liquids bag",
              hasError
                ? DASH
                : `${result.liquids.totalMl} ml of ${LIQUID_BAG_MAX_ML} ml — ${result.liquids.fits ? "clears security" : "over the limit"}`,
            ],
            [
              "Volume freed by solid swaps",
              hasError ? DASH : `${result.liquids.solidSavingMl} ml`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.fitsCarryOn && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {!result.liquids.fits
              ? `The liquids bag is over ${LIQUID_BAG_MAX_ML} ml, or holds a container above ${LIQUID_CONTAINER_MAX_ML} ml. Swap the biggest bottles for solid formats.`
              : !result.volumeOk
                ? "The bag is out of space before it is out of weight. Drop a pair of shoes — they are the bulkiest thing in it."
                : "Over the weight limit. Wear the heaviest layer and shoes on the plane, or drop a pair."}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Wardrobe</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Item
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Total
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      In the bag
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Packed volume
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.clothing.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 font-semibold">{item.name}</td>
                      <td className="py-2 pr-3">{item.total}</td>
                      <td className="py-2 pr-3">
                        {item.packed}
                        {item.worn > 0 && (
                          <span className="text-[var(--muted-foreground)]"> ({item.worn} worn)</span>
                        )}
                      </td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {NUM.format(item.litres)} L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Everything else</h2>
            <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
              {result.kit.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span>{item.name}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {NUM.format(item.litres)} L
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">The 1 litre liquids bag</h2>
            {result.liquids.items.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing selected — you are travelling entirely on solids, which is the fastest way
                through security.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
                {result.liquids.items.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[var(--muted-foreground)]">{item.ml} ml</span>
                    </div>
                    {item.solidSwap && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Solid alternative: {item.solidSwap} — does not count towards the limit
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {result.liquids.remainingMl >= 0
                ? `${result.liquids.remainingMl} ml of the bag still free.`
                : `${Math.abs(result.liquids.remainingMl)} ml over the 1 litre bag.`}
            </p>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Garment weights and packed volumes are planning figures. Cabin size and weight allowances vary
        by airline, fare and aircraft — confirm both against your own booking before packing to the
        limit.
      </p>
    </main>
  );
}
