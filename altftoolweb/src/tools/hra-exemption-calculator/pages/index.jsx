"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Copy, House, ListChecks, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const slabOptions = [5, 10, 15, 20, 30];

const presets = [
  { label: "Mumbai renter", basic: 80000, hra: 40000, rent: 35000, metro: true },
  { label: "Bengaluru renter", basic: 60000, hra: 24000, rent: 25000, metro: false },
  { label: "Starter budget", basic: 30000, hra: 12000, rent: 10000, metro: false },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));

export default function ToolHome() {
  const [basic, setBasic] = useState(50000);
  const [hra, setHra] = useState(20000);
  const [rent, setRent] = useState(18000);
  const [metro, setMetro] = useState(true);
  const [slab, setSlab] = useState(20);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const basicDa = Math.max(0, Number(basic) || 0);
    const hraReceived = Math.max(0, Number(hra) || 0);
    const rentPaid = Math.max(0, Number(rent) || 0);

    const ruleActual = hraReceived;
    const ruleRent = Math.max(0, rentPaid - 0.1 * basicDa);
    const ruleCity = (metro ? 0.5 : 0.4) * basicDa;

    const exemptMonthly = Math.min(ruleActual, ruleRent, ruleCity);
    const taxableMonthly = Math.max(0, hraReceived - exemptMonthly);

    return {
      basicDa,
      hraReceived,
      rentPaid,
      ruleActual,
      ruleRent,
      ruleCity,
      exemptMonthly,
      taxableMonthly,
      exemptAnnual: exemptMonthly * 12,
      taxableAnnual: taxableMonthly * 12,
      annualRent: rentPaid * 12,
      exemptShare: hraReceived > 0 ? (exemptMonthly / hraReceived) * 100 : 0,
    };
  }, [basic, hra, metro, rent]);

  const slabRate = Number(slab) || 0;
  const taxSaved = result.exemptAnnual * (slabRate / 100);

  const rules = useMemo(
    () => [
      {
        id: "actual",
        title: "Rule 1 · Actual HRA received",
        value: result.ruleActual,
        hint: "The HRA component in your salary",
      },
      {
        id: "rent",
        title: "Rule 2 · Rent paid − 10% of basic + DA",
        value: result.ruleRent,
        hint: `${formatINR(result.rentPaid)} − ${formatINR(0.1 * result.basicDa)}`,
      },
      {
        id: "city",
        title: metro ? "Rule 3 · 50% of basic + DA (metro)" : "Rule 3 · 40% of basic + DA (non-metro)",
        value: result.ruleCity,
        hint: metro ? "Delhi, Mumbai, Kolkata, Chennai" : "All cities other than the four metros",
      },
    ],
    [metro, result]
  );

  const summary = useMemo(
    () =>
      [
        "HRA Exemption Summary (Section 10(13A), old regime)",
        `Basic + DA: ${formatINR(result.basicDa)}/mo | HRA received: ${formatINR(result.hraReceived)}/mo | Rent paid: ${formatINR(result.rentPaid)}/mo | City: ${metro ? "Metro" : "Non-metro"}`,
        `Rule 1 — Actual HRA received: ${formatINR(result.ruleActual)}/mo`,
        `Rule 2 — Rent − 10% of basic + DA: ${formatINR(result.ruleRent)}/mo`,
        `Rule 3 — ${metro ? "50%" : "40%"} of basic + DA: ${formatINR(result.ruleCity)}/mo`,
        `Exempt HRA (minimum of the three): ${formatINR(result.exemptMonthly)}/mo · ${formatINR(result.exemptAnnual)}/yr`,
        `Taxable HRA: ${formatINR(result.taxableMonthly)}/mo · ${formatINR(result.taxableAnnual)}/yr`,
        `Estimated tax saved at ${slabRate}% slab: ${formatINR(taxSaved)}/yr`,
        "Note: HRA exemption is available only under the old tax regime.",
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [metro, result, slabRate, taxSaved]
  );

  const applyPreset = (preset) => {
    setBasic(preset.basic);
    setHra(preset.hra);
    setRent(preset.rent);
    setMetro(preset.metro);
  };

  const resetAll = () => {
    setBasic(50000);
    setHra(20000);
    setRent(18000);
    setMetro(true);
    setSlab(20);
  };

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <House className="h-4 w-4" />
            Income tax · Section 10(13A)
          </div>
          <h1 className="text-4xl font-semibold leading-tight">HRA Exemption Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Check exactly how much of your house rent allowance is tax-free using the three-rule method, and how much tax
            that saves you at your slab.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Monthly basic salary + DA (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={basic}
                  onChange={(event) => setBasic(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Monthly HRA received (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={hra}
                  onChange={(event) => setHra(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Monthly rent paid (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={rent}
                  onChange={(event) => setRent(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">City type</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetro(true)}
                  aria-pressed={metro}
                  className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                    metro
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Metro (50%)
                </button>
                <button
                  type="button"
                  onClick={() => setMetro(false)}
                  aria-pressed={!metro}
                  className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                    !metro
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Non-metro (40%)
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Only Delhi, Mumbai, Kolkata and Chennai count as metro for HRA.
              </p>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Exempt HRA = minimum of the three rules
                </p>
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {rules.map((rule) => {
                  const isMin = rule.value === result.exemptMonthly;
                  return (
                    <div
                      key={rule.id}
                      className={`rounded-md border p-4 ${
                        isMin ? "border-[var(--primary)]" : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                      style={isMin ? { background: "var(--anslation-ds-primary-soft)" } : undefined}
                    >
                      <p className="text-xs font-semibold text-[var(--muted-foreground)]">{rule.title}</p>
                      <p className={`mt-2 text-xl font-semibold ${isMin ? "text-[var(--primary)]" : ""}`}>
                        {formatINR(rule.value)}
                        <span className="text-xs font-normal text-[var(--muted-foreground)]"> /mo</span>
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{rule.hint}</p>
                      {isMin && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--card)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                          <CircleCheck className="h-3.5 w-3.5" />
                          Your exemption
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div aria-live="polite" className="mt-5 flex flex-wrap items-end gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Exempt HRA</p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{formatINR(result.exemptMonthly)}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">per month · {formatINR(result.exemptAnnual)} per year</p>
                </div>
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Taxable HRA</p>
                  <p className="mt-1 text-2xl font-semibold">{formatINR(result.taxableMonthly)}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">per month · {formatINR(result.taxableAnnual)} per year</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: Exempt HRA = min(actual HRA received, rent paid − 10% of basic + DA, {metro ? "50%" : "40%"} of
                basic + DA). The rest of your HRA is added to taxable salary.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Tax saved by the exemption</p>
                  <p aria-live="polite" className="mt-2 text-3xl font-semibold text-[var(--anslation-ds-success)]">
                    {formatINR(taxSaved)}
                    <span className="text-sm font-normal text-[var(--muted-foreground)]"> per year</span>
                  </p>
                </div>
                <label className="block">
                  <span className="text-sm font-semibold">Your income tax slab</span>
                  <select
                    value={slab}
                    onChange={(event) => setSlab(Number(event.target.value))}
                    className="mt-2 h-12 w-40 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {slabOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}%
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Estimate = annual exempt HRA × slab rate. Add 4% cess for the exact figure; savings apply only if you file
                under the old regime.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <ListChecks className="h-4 w-4 text-[var(--primary)]" />
                Before you claim
              </p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>• Keep rent receipts (and ideally the rent agreement) as proof for your employer or ITR.</li>
                <li>
                  • Landlord PAN is mandatory when annual rent exceeds ₹1,00,000 — your rent is currently{" "}
                  {formatINR(result.annualRent)}/yr.
                </li>
                <li>• HRA exemption is available only under the old tax regime; the new regime taxes full HRA.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
