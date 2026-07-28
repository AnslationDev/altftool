"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import {
  CARPET_AREA_DEFINITION,
  DEFINITION_READ_ON,
  areaBasisLabel,
  compareProjects,
  describeLoadingConvention,
  loadingBasisLabel,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const areaFmt = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pctFmt = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const AREA_BASIS_OPTIONS = [
  ["super", "Super built-up area"],
  ["builtup", "Built-up area"],
  ["carpet", "Carpet area (RERA)"],
];

const LOADING_BASIS_OPTIONS = [
  ["carpet", "on carpet — (super − carpet) ÷ carpet"],
  ["builtup", "on built-up — (super − built-up) ÷ built-up"],
  ["super", "on super built-up — (super − carpet) ÷ super"],
];

const UNIT_OPTIONS = [
  ["sqft", "sq ft"],
  ["sqm", "sq m"],
];

const DEFAULT_A = {
  quotedArea: "1200",
  areaBasis: "super",
  unit: "sqft",
  loadingPercent: "30",
  loadingBasis: "carpet",
  wallFactorPercent: "10",
  totalPrice: "9600000",
};

const DEFAULT_B = {
  quotedArea: "850",
  areaBasis: "carpet",
  unit: "sqft",
  loadingPercent: "25",
  loadingBasis: "carpet",
  wallFactorPercent: "10",
  totalPrice: "7800000",
};

function money0(value) {
  return money.format(Math.round(value));
}

function ProjectFields({ id, title, values, onChange }) {
  const unitLabel = values.unit === "sqm" ? "sq m" : "sq ft";
  return (
    <section className={CARD_CLASS}>
      <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor={`${id}-area`}>
            Quoted area ({unitLabel})
          </label>
          <input
            id={`${id}-area`}
            className={INPUT_CLASS}
            inputMode="decimal"
            value={values.quotedArea}
            onChange={(event) => onChange("quotedArea", event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`${id}-unit`}>
            Unit
          </label>
          <select
            id={`${id}-unit`}
            className={INPUT_CLASS}
            value={values.unit}
            onChange={(event) => onChange("unit", event.target.value)}
          >
            {UNIT_OPTIONS.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor={`${id}-basis`}>
            That number is the…
          </label>
          <select
            id={`${id}-basis`}
            className={INPUT_CLASS}
            value={values.areaBasis}
            onChange={(event) => onChange("areaBasis", event.target.value)}
          >
            {AREA_BASIS_OPTIONS.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`${id}-loading`}>
            Loading (%)
          </label>
          <input
            id={`${id}-loading`}
            className={INPUT_CLASS}
            inputMode="decimal"
            value={values.loadingPercent}
            onChange={(event) => onChange("loadingPercent", event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`${id}-wall`}>
            Wall + balcony premium (%)
          </label>
          <input
            id={`${id}-wall`}
            className={INPUT_CLASS}
            inputMode="decimal"
            value={values.wallFactorPercent}
            onChange={(event) => onChange("wallFactorPercent", event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor={`${id}-loadingbasis`}>
            That loading % is measured…
          </label>
          <select
            id={`${id}-loadingbasis`}
            className={INPUT_CLASS}
            value={values.loadingBasis}
            onChange={(event) => onChange("loadingBasis", event.target.value)}
          >
            {LOADING_BASIS_OPTIONS.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor={`${id}-price`}>
            Total price (₹)
          </label>
          <input
            id={`${id}-price`}
            className={INPUT_CLASS}
            inputMode="decimal"
            value={values.totalPrice}
            onChange={(event) => onChange("totalPrice", event.target.value)}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        The wall + balcony premium is how much built-up exceeds carpet. It only changes the answer when a
        built-up figure is part of the quote.
      </p>
    </section>
  );
}

export default function ToolHome() {
  const [projectA, setProjectA] = useState(DEFAULT_A);
  const [projectB, setProjectB] = useState(DEFAULT_B);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compareProjects(projectA, projectB), [projectA, projectB]);
  const failed = Boolean(result.error);
  const a = failed ? null : result.a;
  const b = failed ? null : result.b;

  const headline = useMemo(() => {
    if (failed) return "";
    const rateA = money0(a.rates.carpetRatePerSqft);
    const rateB = money0(b.rates.carpetRatePerSqft);
    if (!result.cheaper) {
      return `Project A is ${rateA} per sq ft of carpet and Project B is ${rateB} — the same rate per usable foot.`;
    }
    const winner = result.cheaper === "A" ? "A" : "B";
    return `Project A is ${rateA}/sq ft of carpet, Project B is ${rateB} — ${winner} is ${pctFmt.format(result.percentCheaper)}% cheaper per usable foot.`;
  }, [failed, a, b, result]);

  function updateA(field, value) {
    setProjectA((prev) => ({ ...prev, [field]: value }));
  }

  function updateB(field, value) {
    setProjectB((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setProjectA(DEFAULT_A);
    setProjectB(DEFAULT_B);
    setCopied(false);
  }

  async function copySummary() {
    if (failed) return;
    const lines = [
      "Super built-up loading decoded — common carpet-area basis",
      headline,
      "",
      ...[a, b].map((project) =>
        [
          `${project.label}: ${areaFmt.format(project.areas.quotedSqft)} sq ft quoted as ${areaBasisLabel(project.areaBasis).toLowerCase()}, ${pctFmt.format(project.loadingPercentEntered)}% loading ${loadingBasisLabel(project.loadingBasis)}`,
          `  Carpet ${areaFmt.format(project.areas.carpetSqft)} sq ft (${areaFmt.format(project.areas.carpetSqm)} sq m)`,
          `  Built-up ${areaFmt.format(project.areas.builtUpSqft)} sq ft | Super built-up ${areaFmt.format(project.areas.superSqft)} sq ft`,
          `  Price ${money0(project.price)} | Quoted rate ${money0(project.rates.quotedRatePerSqft)}/sq ft | Carpet rate ${money0(project.rates.carpetRatePerSqft)}/sq ft`,
          `  Implied loading: ${pctFmt.format(project.impliedLoading.onCarpet)}% on carpet, ${pctFmt.format(project.impliedLoading.onBuiltUp)}% on built-up, ${pctFmt.format(project.impliedLoading.onSuper)}% on super built-up`,
        ].join("\n"),
      ),
      "",
      `Definition: ${CARPET_AREA_DEFINITION}`,
      `Read on ${DEFINITION_READ_ON}.`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const rows = [
    ["Quoted area", (p) => `${areaFmt.format(p.areas.quotedSqft)} sq ft`],
    ["Quoted as", (p) => areaBasisLabel(p.areaBasis)],
    ["Carpet area (RERA)", (p) => `${areaFmt.format(p.areas.carpetSqft)} sq ft`],
    ["Carpet area", (p) => `${areaFmt.format(p.areas.carpetSqm)} sq m`],
    ["Built-up area", (p) => `${areaFmt.format(p.areas.builtUpSqft)} sq ft`],
    ["Super built-up area", (p) => `${areaFmt.format(p.areas.superSqft)} sq ft`],
    ["Area you cannot walk on", (p) => `${areaFmt.format(p.unusableSqft)} sq ft`],
    ["Total price", (p) => money0(p.price)],
    ["Advertised rate (as quoted)", (p) => `${money0(p.rates.quotedRatePerSqft)} / sq ft`],
    ["Rate per sq ft of carpet", (p) => `${money0(p.rates.carpetRatePerSqft)} / sq ft`],
    ["Rate per sq m of carpet", (p) => `${money0(p.rates.carpetRatePerSqm)} / sq m`],
    ["Gap hidden by the quote", (p) => `${money0(p.rates.hiddenPremiumPerSqft)} / sq ft`],
    ["Implied loading on carpet", (p) => `${pctFmt.format(p.impliedLoading.onCarpet)}%`],
    ["Implied loading on built-up", (p) => `${pctFmt.format(p.impliedLoading.onBuiltUp)}%`],
    ["Implied loading on super built-up", (p) => `${pctFmt.format(p.impliedLoading.onSuper)}%`],
  ];

  const warnings = failed ? [] : [...a.warnings.map((w) => ["Project A", w]), ...b.warnings.map((w) => ["Project B", w])];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Ruler aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Super Built-Up Loading Decoder
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Two flats quoted on two different area bases, restated on one common carpet-area basis, with the true
          price per square foot of carpet and the loading each seller is actually applying.
        </p>
      </header>

      <div className={`${CARD_CLASS} mb-6`}>
        <h2 className="text-sm font-bold text-[var(--foreground)]">What counts as carpet area</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{CARPET_AREA_DEFINITION}</p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Section 2(k) wording read on {DEFINITION_READ_ON}. Built-up area adds wall thickness and the balcony;
          super built-up adds a share of lobbies, lifts, stairs and other common areas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectFields id="proj-a" title="Project A" values={projectA} onChange={updateA} />
        <ProjectFields id="proj-b" title="Project B" values={projectB} onChange={updateB} />
      </div>

      <div className="mt-6 rounded-xl p-5 ring-1 ring-[var(--border)] bg-[var(--card)]">
        {failed ? (
          <div
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </div>
        ) : null}

        <p className="mt-1 text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
          Price per square foot of carpet
        </p>
        <p className="mt-2 text-2xl leading-8 font-bold text-[var(--foreground)] sm:text-3xl sm:leading-10">
          {failed ? DASH : headline}
        </p>
        {!failed && result.cheaper ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            The gap is {money0(result.rateGapPerSqft)} per square foot of carpet. Project A hands over{" "}
            {areaFmt.format(a.unusableSqft)} sq ft of non-carpet area, Project B {areaFmt.format(b.unusableSqft)}{" "}
            sq ft.
          </p>
        ) : null}

        {warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {warnings.map(([who, text]) => (
              <li
                key={`${who}-${text}`}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                <span className="font-semibold">{who}: </span>
                {text}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 -mx-1 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Both projects restated on a carpet-area basis</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="py-2 pr-3 text-left font-semibold text-[var(--muted-foreground)]">
                  Measure
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold text-[var(--foreground)]">
                  Project A
                </th>
                <th scope="col" className="py-2 text-right font-semibold text-[var(--foreground)]">
                  Project B
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label} className="border-b border-[var(--border)]/60">
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">
                    {label}
                  </th>
                  <td className="py-2 pr-3 text-right font-medium text-[var(--foreground)] tabular-nums">
                    {failed ? DASH : render(a)}
                  </td>
                  <td className="py-2 text-right font-medium text-[var(--foreground)] tabular-nums">
                    {failed ? DASH : render(b)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 space-y-3">
          <div>
            <dt className="text-sm font-semibold text-[var(--foreground)]">
              What Project A&apos;s loading number means
            </dt>
            <dd className="text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : describeLoadingConvention(a)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--foreground)]">
              What Project B&apos;s loading number means
            </dt>
            <dd className="text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : describeLoadingConvention(b)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copySummary}
            disabled={failed}
            aria-label="Copy the carpet-area comparison to the clipboard"
          >
            {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset both projects to the example figures">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className={`${CARD_CLASS} mt-6`}>
        <h2 className="text-sm font-bold text-[var(--foreground)]">The three loading conventions</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The same flat produces three different headline percentages depending on which area sits under the
          division line. A flat with 923 sq ft carpet, 1,015 sq ft built-up and 1,200 sq ft super built-up is
          &ldquo;30% loading&rdquo; on carpet, &ldquo;18.18% loading&rdquo; on built-up and &ldquo;23.08%
          loading&rdquo; on super built-up — all three describe one identical flat.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <span className="font-semibold text-[var(--foreground)]">On carpet:</span> (super − carpet) ÷ carpet.
            The most common quote in Indian listings and the largest of the three numbers.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">On built-up:</span> (super − built-up) ÷
            built-up. Counts only the common-area share, so walls and balcony are already inside the base.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">On super built-up:</span> (super − carpet) ÷
            super. Sometimes presented as an efficiency figure; always the smallest of the three.
          </li>
        </ul>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          This page is arithmetic on the figures you enter. It reports what the numbers are and which rule
          produced them; it does not value a property or advise on a purchase. Confirm the carpet area against
          the RERA-registered agreement for sale before relying on any figure.
        </p>
      </div>
    </div>
  );
}
