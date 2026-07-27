"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import { buildDesertPackingList, WATER_MAX_L_PER_DAY } from "../lib";

const DEFAULTS = {
  days: "2",
  travellers: "2",
  dayHighC: "42",
  swingC: "20",
  hoursOutdoorsPerDay: "6",
  campNights: "1",
  laundryEveryDays: "0",
  duneBashing: true,
  duneWalking: true,
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

const NUMBER_FIELDS = [
  ["days", "Trip length (days)", { min: 1, max: 60, step: 1 }],
  ["travellers", "Travellers", { min: 1, max: 12, step: 1 }],
  ["dayHighC", "Daytime high (°C)", { min: 0, max: 60, step: 1 }],
  ["swingC", "Day-to-night drop (°C)", { min: 0, max: 40, step: 1 }],
  ["hoursOutdoorsPerDay", "Hours outdoors per day", { min: 0, max: 16, step: 0.5 }],
  ["campNights", "Nights camping in the desert", { min: 0, max: 60, step: 1 }],
  ["laundryEveryDays", "Laundry every N days (0 = none)", { min: 0, max: 60, step: 1 }],
];

const TOGGLES = [
  ["duneBashing", "Dune bashing by 4x4"],
  ["duneWalking", "Walking on dunes"],
];

const LAYER_LABEL = {
  warm: "Warm night — no extra insulation needed",
  cool: "Cool night — pack a fleece or mid-layer",
  cold: "Cold night — a real insulated jacket, beanie and gloves",
};

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [ticked, setTicked] = useState({});
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildDesertPackingList({
        days: toNumber(form.days),
        travellers: toNumber(form.travellers),
        dayHighC: toNumber(form.dayHighC),
        swingC: toNumber(form.swingC),
        hoursOutdoorsPerDay: toNumber(form.hoursOutdoorsPerDay),
        campNights: toNumber(form.campNights),
        laundryEveryDays: toNumber(form.laundryEveryDays),
        duneBashing: form.duneBashing,
        duneWalking: form.duneWalking,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const lineCount = hasError
    ? 0
    : result.groups.reduce((total, group) => total + group.items.length, 0);

  const tickedCount = useMemo(() => {
    if (hasError) return 0;
    let count = 0;
    for (const group of result.groups) {
      for (const item of group.items) if (ticked[item.id]) count += 1;
    }
    return count;
  }, [hasError, result, ticked]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Desert safari packing list — ${result.days} days, ${result.travellers} traveller(s)`,
      `Water: ${result.waterLitresTotal} litres (${result.waterPerPersonPerDay} L per person per day, ${result.waterWeightKg} kg)`,
      `Night low: ${result.nightLowC} °C — ${LAYER_LABEL[result.layer]}`,
      `${result.totalItems} items, about ${NUM.format(result.totalKg)} kg with water`,
      "",
    ];
    for (const group of result.groups) {
      lines.push(group.name.toUpperCase());
      for (const item of group.items) {
        lines.push(`  [ ] ${item.qty} x ${item.name}${item.unit ? ` (${item.unit})` : ""}`);
      }
      lines.push("");
    }
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
    setTicked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Desert Safari Packing List Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Water is sized from your hours in the heat, and the layers are chosen from the night low —
          the day high minus the clear-sky temperature drop, which in deserts runs 15-25 °C.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {NUMBER_FIELDS.map(([key, label, opts]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`field-${key}`}>
                {label}
              </label>
              <input
                id={`field-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={opts.min}
                max={opts.max}
                step={opts.step}
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Activities</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`toggle-${key}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                  form[key]
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`toggle-${key}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={form[key]}
                  onChange={(event) => setField(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
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
              Water to carry
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.waterLitresTotal)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a list."
                : `${NUM.format(result.waterPerPersonPerDay)} L per person per day — ${NUM.format(result.waterWeightKg)} kg of the load`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the desert packing list to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the form and clear ticks"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Night low after sunset", hasError ? DASH : `${NUM.format(result.nightLowC)} °C`],
            ["Layers needed", hasError ? DASH : LAYER_LABEL[result.layer]],
            [
              "Sleeping bag comfort rating",
              hasError
                ? DASH
                : result.campNights > 0
                  ? `${NUM.format(result.sleepingBagComfortC)} °C or lower`
                  : "Not camping",
            ],
            ["Items to pack", hasError ? DASH : `${result.totalItems} (${tickedCount}/${lineCount} ticked)`],
            ["Total weight with water", hasError ? DASH : `${NUM.format(result.totalKg)} kg`],
            ["Weight without water", hasError ? DASH : `${NUM.format(result.gearKg)} kg`],
            ["Sunscreen needed", hasError ? DASH : `${result.sunscreenMl} ml`],
            [
              "Electrolyte sachets each",
              hasError ? DASH : `${result.electrolyteSachetsPerPerson}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.waterCapped && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Your exposure hours imply more than {WATER_MAX_L_PER_DAY} litres a day, so the figure has
            been held at that ceiling. Beyond roughly this much, the answer is less time in the sun
            and more salt, not more water.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {result.groups.map((group) => (
            <div
              key={group.name}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`item-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5"
                    >
                      <input
                        id={`item-${item.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={Boolean(ticked[item.id])}
                        onChange={(event) =>
                          setTicked((current) => ({ ...current, [item.id]: event.target.checked }))
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-semibold ${
                            ticked[item.id]
                              ? "text-[var(--muted-foreground)] line-through"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {item.qty} x {item.name}
                          {item.unit ? ` (${item.unit})` : ""}
                        </span>
                        {item.note && (
                          <span className="block text-xs text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Water and clothing figures are planning estimates for healthy adults in dry heat. Heat
        illness is a medical emergency — confusion, cramping or a person who stops sweating needs
        cooling and medical help, not another bottle of water.
      </p>
    </main>
  );
}
