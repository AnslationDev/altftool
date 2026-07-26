"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hammer, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const num0 = (value) => NUM0.format(Number.isFinite(value) ? value : 0);

const QUALITY = {
  economy: { label: "Economy / basic finish", rate: 1600 },
  standard: { label: "Standard finish", rate: 2000 },
  premium: { label: "Premium finish", rate: 2600 },
  luxury: { label: "Luxury finish", rate: 3600 },
};

const CITY = {
  metro: { label: "Metro (Mumbai, Delhi NCR, Bengaluru)", factor: 1.15 },
  tier1: { label: "Tier 1 city", factor: 1 },
  tier2: { label: "Tier 2 city", factor: 0.92 },
  tier3: { label: "Tier 3 / small town", factor: 0.85 },
};

/** Share of the civil construction cost by work head. Sums to 100%. */
const WORK_HEADS = [
  ["Excavation & foundation", 8],
  ["Steel for RCC", 13],
  ["Cement & concrete", 12],
  ["Sand & aggregate", 9],
  ["Brickwork / blockwork", 8],
  ["Plastering & waterproofing", 6],
  ["Flooring & tiling", 11],
  ["Doors & windows", 9],
  ["Painting & finishes", 6],
  ["Plumbing & sanitary", 7],
  ["Electrical & wiring", 7],
  ["Site overheads & miscellaneous", 4],
];

/** Thumb-rule material quantities per sq ft of built-up area. */
const MATERIALS = [
  ["Cement", 0.4, "bags (50 kg)"],
  ["Steel (TMT)", 4, "kg"],
  ["Sand", 1.8, "cu ft"],
  ["Aggregate", 1.35, "cu ft"],
  ["Bricks / blocks", 8, "nos"],
];

const DEFAULTS = {
  areaPerFloor: 1200,
  floors: 2,
  quality: "standard",
  city: "tier1",
  rate: 2000,
  customRate: false,
  external: 0,
  architect: 5,
  contingency: 5,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [areaPerFloor, setAreaPerFloor] = useState(String(DEFAULTS.areaPerFloor));
  const [floors, setFloors] = useState(String(DEFAULTS.floors));
  const [quality, setQuality] = useState(DEFAULTS.quality);
  const [city, setCity] = useState(DEFAULTS.city);
  const [customRate, setCustomRate] = useState(DEFAULTS.customRate);
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [external, setExternal] = useState(String(DEFAULTS.external));
  const [architect, setArchitect] = useState(String(DEFAULTS.architect));
  const [contingency, setContingency] = useState(String(DEFAULTS.contingency));
  const [copied, setCopied] = useState(false);

  const baseRate = customRate ? toNumber(rate) : QUALITY[quality].rate;

  const calc = useMemo(() => {
    const a = toNumber(areaPerFloor);
    const f = toNumber(floors);
    const ext = toNumber(external);
    const arch = toNumber(architect);
    const cont = toNumber(contingency);
    const r = baseRate;

    if ([a, f, ext, arch, cont, r].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (a <= 0) return { error: "Built-up area per floor must be greater than zero." };
    if (f < 1 || f > 10) return { error: "Number of floors should be between 1 and 10." };
    if (r <= 0) return { error: "Construction rate per sq ft must be greater than zero." };
    if (ext < 0) return { error: "External works cost cannot be negative." };
    if (arch < 0 || arch > 20) return { error: "Professional fees should be between 0% and 20%." };
    if (cont < 0 || cont > 30) return { error: "Contingency should be between 0% and 30%." };

    const floorsValue = Math.round(f);
    const totalArea = a * floorsValue;
    const factor = CITY[city].factor;
    const effectiveRate = r * factor;
    const civil = totalArea * effectiveRate;
    const archFee = (civil * arch) / 100;
    const contFee = (civil * cont) / 100;
    const total = civil + archFee + contFee + ext;
    const allInRate = totalArea > 0 ? total / totalArea : 0;

    const heads = WORK_HEADS.map(([label, share]) => ({
      label,
      share,
      amount: (civil * share) / 100,
    }));

    const materials = MATERIALS.map(([label, perSqft, unit]) => ({
      label,
      unit,
      quantity: totalArea * perSqft,
    }));

    return {
      totalArea,
      floorsValue,
      effectiveRate,
      baseRateValue: r,
      factor,
      civil,
      archFee,
      contFee,
      external: ext,
      total,
      allInRate,
      heads,
      materials,
      low: total * 0.9,
      high: total * 1.12,
    };
  }, [areaPerFloor, floors, city, external, architect, contingency, baseRate]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Construction Cost Estimate",
      `Built-up area: ${num(calc.totalArea)} sq ft (${num(toNumber(areaPerFloor))} sq ft × ${calc.floorsValue} floor(s))`,
      `Quality: ${customRate ? "Custom rate" : QUALITY[quality].label}`,
      `Location: ${CITY[city].label} (factor ${num(calc.factor)})`,
      `Effective rate: ${money(calc.effectiveRate)} per sq ft`,
      `Civil construction cost: ${money(calc.civil)}`,
      `Design & professional fees: ${money(calc.archFee)}`,
      `Contingency: ${money(calc.contFee)}`,
      `External works: ${money(calc.external)}`,
      `Total estimated cost: ${money(calc.total)}`,
      `All-in cost per sq ft: ${money(calc.allInRate)}`,
      `Likely range: ${money(calc.low)} – ${money(calc.high)}`,
    ].join("\n");
  }, [calc, areaPerFloor, quality, city, customRate]);

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
    setAreaPerFloor(String(DEFAULTS.areaPerFloor));
    setFloors(String(DEFAULTS.floors));
    setQuality(DEFAULTS.quality);
    setCity(DEFAULTS.city);
    setCustomRate(DEFAULTS.customRate);
    setRate(String(DEFAULTS.rate));
    setExternal(String(DEFAULTS.external));
    setArchitect(String(DEFAULTS.architect));
    setContingency(String(DEFAULTS.contingency));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hammer className="h-4 w-4" aria-hidden="true" />
          Build cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Construction Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate what it costs to build a house from the built-up area, the quality of finish and
          the city, then see the money split across work heads and the rough material quantities you
          will need to order.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-area">
              Built-up area per floor (sq ft)
            </label>
            <input
              id="cce-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={areaPerFloor}
              onChange={(event) => setAreaPerFloor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-floors">
              Number of floors
            </label>
            <input
              id="cce-floors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={floors}
              onChange={(event) => setFloors(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-quality">
              Quality of construction
            </label>
            <select
              id="cce-quality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={quality}
              onChange={(event) => {
                setQuality(event.target.value);
                setRate(String(QUALITY[event.target.value].rate));
              }}
              disabled={customRate}
            >
              {Object.entries(QUALITY).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label} — {money(value.rate)}/sq ft
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-city">
              Location
            </label>
            <select
              id="cce-city"
              className={`mt-2 ${INPUT_CLASS}`}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              {Object.entries(CITY).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--foreground)]"
              htmlFor="cce-custom"
            >
              <input
                id="cce-custom"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={customRate}
                onChange={(event) => setCustomRate(event.target.checked)}
              />
              Use my own rate per sq ft
            </label>
          </div>
          {customRate ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cce-rate">
                Rate per sq ft (INR, before city factor)
              </label>
              <input
                id="cce-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="50"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-external">
              Compound wall & external works (INR)
            </label>
            <input
              id="cce-external"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={external}
              onChange={(event) => setExternal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-architect">
              Design & professional fees (% of civil cost)
            </label>
            <input
              id="cce-architect"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={architect}
              onChange={(event) => setArchitect(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cce-contingency">
              Contingency (% of civil cost)
            </label>
            <input
              id="cce-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={contingency}
              onChange={(event) => setContingency(event.target.value)}
            />
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Estimated construction cost
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.total)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.allInRate)} per sq ft over {num(calc.totalArea)} sq ft · likely range{" "}
                  {money(calc.low)} – {money(calc.high)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy construction cost estimate"
                  className={GHOST_BTN}
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
                  aria-label="Reset all inputs"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total built-up area", `${num(calc.totalArea)} sq ft`],
                ["Base rate", `${money(calc.baseRateValue)} per sq ft`],
                ["City factor applied", `× ${num(calc.factor)}`],
                ["Effective rate", `${money(calc.effectiveRate)} per sq ft`],
                ["Civil construction cost", money(calc.civil)],
                ["Design & professional fees", money(calc.archFee)],
                ["Contingency", money(calc.contFee)],
                ["Compound wall & external works", money(calc.external)],
                ["Total estimated cost", money(calc.total)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where the civil cost goes</h2>
            <div className="mt-3 space-y-3">
              {calc.heads.map((head) => (
                <div key={head.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-[var(--muted-foreground)]">{head.label}</span>
                    <span className="font-semibold">
                      {money(head.amount)}{" "}
                      <span className="text-xs font-normal text-[var(--muted-foreground)]">
                        {head.share}%
                      </span>
                    </span>
                  </div>
                  <div
                    className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                    role="img"
                    aria-label={`${head.label}: ${head.share} percent of civil cost`}
                  >
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${(head.share / 13) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Approximate material requirement</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Standard thumb rules for an RCC-framed residential building, per sq ft of built-up
              area.
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {calc.materials.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item.label}</dt>
                  <dd className="text-right font-semibold">
                    {num0(item.quantity)} {item.unit}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Actual cost depends on soil and foundation type, structural
        design, site access, local material and labour rates, and how much of the finishing you
        upgrade. Approval fees, GST on contractor billing, borewell, lift and solar are not included
        unless you add them to external works. Always get a priced bill of quantities from a
        qualified engineer before committing.
      </p>
    </main>
  );
}
