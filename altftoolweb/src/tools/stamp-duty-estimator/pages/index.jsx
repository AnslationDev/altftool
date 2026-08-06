"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Copy,
  FileDown,
  FileSignature,
  Info,
  Landmark,
  Scale,
  TriangleAlert,
  Users,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { OWNERS, PROPERTY_TYPES, RATES_UPDATED, STATES } from "../data";

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const shortInr = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "₹0";
  if (value >= 10000000) return `₹${num(value / 10000000)} Cr`;
  if (value >= 100000) return `₹${num(value / 100000)} lakh`;
  return inr(value);
};

const VALUE_PRESETS = [2500000, 5000000, 7500000, 10000000, 15000000, 25000000];

function resolveRate(state, { value, owner, propertyType, urban }) {
  if (propertyType === "commercial" && state.commercialDuty) {
    return { rate: state.commercialDuty[owner], basis: "Commercial rate" };
  }
  if (propertyType === "commercial") {
    // This dataset does not carry a published commercial-specific rate for
    // every state. Gender concessions on stamp duty are a residential-only
    // rule in Indian states (see e.g. Maharashtra's own note), so rather than
    // silently reusing the residential gender-varying table for "commercial",
    // fall back to the state's own standard (male) rate for every buyer —
    // real published data, applied without an unverified concession.
    if (state.dutyMode === "slab") {
      const slab = state.slabs.find((item) => value <= item.upTo) || state.slabs[state.slabs.length - 1];
      return { rate: slab.rate, basis: `Slab: ${slab.label} — commercial, no gender concession` };
    }
    if (state.highValue && value > state.highValue.threshold) {
      const rate = urban ? state.highValue.urban : state.highValue.rural;
      return {
        rate,
        basis: `Above ${shortInr(state.highValue.threshold)} ${urban ? "urban" : "rural"} rate — commercial, no gender concession`,
      };
    }
    if (!urban && state.hasRural && state.ruralDuty) {
      return { rate: state.ruralDuty.male, basis: "Rural / gram panchayat rate — commercial, no gender concession" };
    }
    return {
      rate: state.duty.male,
      basis: `${state.hasRural ? "Urban / municipal" : "Standard"} rate — commercial, no gender concession`,
    };
  }
  if (state.dutyMode === "slab") {
    const slab = state.slabs.find((item) => value <= item.upTo) || state.slabs[state.slabs.length - 1];
    return { rate: slab.rate, basis: `Slab: ${slab.label}` };
  }
  if (state.highValue && value > state.highValue.threshold) {
    const rate = urban ? state.highValue.urban : state.highValue.rural;
    return { rate, basis: `Above ${shortInr(state.highValue.threshold)} ${urban ? "urban" : "rural"} rate` };
  }
  if (!urban && state.hasRural && state.ruralDuty) {
    return { rate: state.ruralDuty[owner], basis: "Rural / gram panchayat rate" };
  }
  return { rate: state.duty[owner], basis: state.hasRural ? "Urban / municipal rate" : "Standard rate" };
}

export function computeCost(state, opts) {
  const value = Math.max(0, opts.value || 0);
  const { owner, propertyType, urban } = opts;

  const resolved = resolveRate(state, { value, owner, propertyType, urban });
  let duty = (value * resolved.rate) / 100;
  let effectiveRate = resolved.rate;
  let concessionCapped = false;

  // The capped concession (e.g. UP, Uttarakhand) is specifically the sole
  // female buyer's rebate — joint ownership already has its own flat
  // `duty.joint` rate in the table above, so it must not share this cap
  // (sharing it collapsed joint and female duty to the same figure above the
  // cap threshold, and mislabelled the joint result as a "Women's rebate").
  if (owner === "female" && state.womenConcessionCap) {
    const maleResolved = resolveRate(state, { value, owner: "male", propertyType, urban });
    const maleDuty = (value * maleResolved.rate) / 100;
    const rawSaving = maleDuty - duty;
    if (rawSaving > state.womenConcessionCap) {
      duty = maleDuty - state.womenConcessionCap;
      effectiveRate = value > 0 ? (duty / value) * 100 : 0;
      concessionCapped = true;
    }
  }

  const extras = (state.extras || [])
    .filter((item) => {
      if (item.urbanOnly && !urban) return false;
      if (item.ruralOnly && urban) return false;
      return true;
    })
    .map((item) => ({
      label: item.label,
      isFlat: item.flat !== undefined,
      amount: item.ofDuty
        ? duty * item.ofDuty
        : item.flat !== undefined
          ? item.flat
          : value * item.ofValue,
    }));

  const extrasTotal = extras.reduce((sum, item) => sum + item.amount, 0);

  const regConfig = state.registration;
  const regRate =
    owner === "female" && regConfig.femaleRate !== undefined && regConfig.femaleRate !== null
      ? regConfig.femaleRate
      : regConfig.rate;
  const registrationRaw = (value * regRate) / 100;
  const regCapped = regConfig.cap !== null && regConfig.cap !== undefined && registrationRaw > regConfig.cap;
  const registration = regCapped ? regConfig.cap : registrationRaw;

  const total = duty + extrasTotal + registration;

  return {
    value,
    dutyRate: resolved.rate,
    dutyBasis: resolved.basis,
    duty,
    effectiveRate,
    concessionCapped,
    extras,
    extrasTotal,
    regRate,
    registrationRaw,
    registration,
    regCapped,
    regCap: regConfig.cap,
    total,
    percentOfValue: value > 0 ? (total / value) * 100 : 0,
  };
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div>
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={`h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition ${
              value === option.id
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MoneyField({ label, value, onChange, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--muted-foreground)]">
          ₹
        </span>
        <input
          type="number"
          value={value}
          min={0}
          step={100000}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-7 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
      </div>
      <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
        {shortInr(Number(value) || 0)}
        {hint ? ` · ${hint}` : ""}
      </span>
    </label>
  );
}

export default function ToolHome() {
  const [stateId, setStateId] = useState("maharashtra");
  const [owner, setOwner] = useState("male");
  const [propertyType, setPropertyType] = useState("residential");
  const [urban, setUrban] = useState(true);
  const [agreementValue, setAgreementValue] = useState(5000000);
  const [circleValue, setCircleValue] = useState(4500000);
  const [legalFees, setLegalFees] = useState(25000);
  const [brokeragePct, setBrokeragePct] = useState(1);
  const [copied, setCopied] = useState(false);

  const state = useMemo(() => STATES.find((item) => item.id === stateId) || STATES[0], [stateId]);

  const dutiable = useMemo(() => {
    const agreement = Math.max(0, Number(agreementValue) || 0);
    const circle = Math.max(0, Number(circleValue) || 0);
    const value = Math.max(agreement, circle);
    return {
      agreement,
      circle,
      value,
      usedCircle: circle > agreement,
      equal: circle === agreement,
      gap: Math.abs(circle - agreement),
    };
  }, [agreementValue, circleValue]);

  const opts = useMemo(
    () => ({ value: dutiable.value, owner, propertyType, urban }),
    [dutiable.value, owner, propertyType, urban]
  );

  const result = useMemo(() => computeCost(state, opts), [state, opts]);

  const maleResult = useMemo(() => computeCost(state, { ...opts, owner: "male" }), [state, opts]);
  const femaleResult = useMemo(() => computeCost(state, { ...opts, owner: "female" }), [state, opts]);
  const womenSaving = maleResult.total - femaleResult.total;

  const rollup = useMemo(() => {
    const brokerage = (dutiable.value * Math.max(0, Number(brokeragePct) || 0)) / 100;
    const legal = Math.max(0, Number(legalFees) || 0);
    const total = result.total + brokerage + legal;
    return {
      brokerage,
      legal,
      total,
      percentOfValue: dutiable.value > 0 ? (total / dutiable.value) * 100 : 0,
      grandTotal: dutiable.agreement + total,
    };
  }, [dutiable, result.total, brokeragePct, legalFees]);

  const comparison = useMemo(() => {
    const rows = STATES.map((item) => ({
      id: item.id,
      name: item.name,
      result: computeCost(item, { ...opts, urban: item.hasRural ? urban : true }),
    }));
    rows.sort((a, b) => a.result.total - b.result.total);
    return rows.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [opts, urban]);

  const selectedRank = comparison.find((row) => row.id === stateId)?.rank || 0;

  const report = useMemo(() => {
    const lines = [
      "Stamp Duty & Registration Estimate",
      "",
      `State / UT: ${state.name}`,
      `Buyer: ${OWNERS.find((item) => item.id === owner)?.label} · Property: ${
        PROPERTY_TYPES.find((item) => item.id === propertyType)?.label
      }${state.hasRural ? ` · ${urban ? "Urban / municipal" : "Rural / gram panchayat"}` : ""}`,
      "",
      "Valuation",
      `  Agreement value: ${inr(dutiable.agreement)}`,
      `  Circle / ready-reckoner value: ${inr(dutiable.circle)}`,
      `  Duty is charged on the HIGHER of the two: ${inr(dutiable.value)} (${
        dutiable.equal ? "both equal" : dutiable.usedCircle ? "circle rate" : "agreement value"
      })`,
      "",
      "One-time statutory cost",
      `  Stamp duty @ ${num(result.dutyRate)}% [${result.dutyBasis}]: ${inr(result.duty)}`,
      ...result.extras.map((item) => `  ${item.label}: ${inr(item.amount)}`),
      `  Registration @ ${num(result.regRate)}%${
        result.regCapped ? ` (capped at ${inr(result.regCap)}, uncapped would be ${inr(result.registrationRaw)})` : ""
      }: ${inr(result.registration)}`,
      `  Total statutory: ${inr(result.total)} (${num(result.percentOfValue)}% of property value)`,
      "",
      "Total cost of buying",
      `  Statutory charges: ${inr(result.total)}`,
      `  Legal / documentation: ${inr(rollup.legal)}`,
      `  Brokerage @ ${num(brokeragePct)}%: ${inr(rollup.brokerage)}`,
      `  Total add-on cost: ${inr(rollup.total)} (${num(rollup.percentOfValue)}% of property value)`,
      `  Property + all costs: ${inr(rollup.grandTotal)}`,
      "",
      womenSaving > 0
        ? `Women-buyer note: registering in a woman's name saves ${inr(womenSaving)} in ${state.name}.`
        : `Women-buyer note: ${state.name} offers no gender concession on this transaction.`,
      `Cost rank: ${state.name} is #${selectedRank} of ${comparison.length} (1 = cheapest) for this property.`,
      "",
      "Important: banks fund the property value only — stamp duty, registration, brokerage and legal fees",
      "must come from your own pocket, over and above the down payment.",
      "",
      `${RATES_UPDATED}. Stamp duty rates change with state budgets, local cesses and time-limited rebates.`,
      "Verify with your sub-registrar office before you transact. This is an estimate, not legal advice.",
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [
    state,
    owner,
    propertyType,
    urban,
    dutiable,
    result,
    rollup,
    brokeragePct,
    womenSaving,
    selectedRank,
    comparison.length,
  ]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stamp-duty-estimate-${state.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <FileSignature className="h-4 w-4" />
            Property purchase costs
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Property Stamp Duty &amp; Registration Estimator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            The cost nobody budgets for. Stamp duty and registration can add 5% to 11% on top of the sticker price
            depending on the state, your gender, and whether the circle rate beats your agreement value &mdash; and no
            bank will lend you a rupee of it.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">Where &amp; who</h2>
              <label className="block">
                <span className="text-sm font-semibold">State / UT</span>
                <select
                  value={stateId}
                  onChange={(event) => setStateId(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {[...STATES]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>

              <div className="mt-4">
                <Segmented label="Ownership / buyer" options={OWNERS} value={owner} onChange={setOwner} />
              </div>

              <div className="mt-4">
                <Segmented
                  label="Property type"
                  options={PROPERTY_TYPES}
                  value={propertyType}
                  onChange={setPropertyType}
                />
              </div>

              {state.hasRural && (
                <div className="mt-4">
                  <Segmented
                    label="Location"
                    options={[
                      { id: "urban", label: "Urban / municipal" },
                      { id: "rural", label: "Rural / panchayat" },
                    ]}
                    value={urban ? "urban" : "rural"}
                    onChange={(value) => setUrban(value === "urban")}
                  />
                  <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                    {state.name} charges different rates inside and outside municipal limits.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">Valuation</h2>
              <div className="grid gap-4">
                <MoneyField
                  label="Agreement value"
                  value={agreementValue}
                  onChange={setAgreementValue}
                  hint="what you are actually paying"
                />
                <MoneyField
                  label="Circle / ready-reckoner value"
                  value={circleValue}
                  onChange={setCircleValue}
                  hint="government minimum for this locality"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {VALUE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAgreementValue(preset);
                      setCircleValue(Math.round(preset * 0.9));
                    }}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {shortInr(preset)}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-[var(--primary)]" />
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Duty is charged on</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-[var(--primary)]" aria-live="polite">
                  {inr(dutiable.value)}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                  {dutiable.equal ? (
                    <>Both values match, so there is nothing to choose between them.</>
                  ) : dutiable.usedCircle ? (
                    <>
                      The <span className="font-semibold text-[var(--foreground)]">circle rate</span> is{" "}
                      {inr(dutiable.gap)} higher than your agreement value. The law charges duty on whichever is
                      greater, so you pay on the circle rate even though you are paying the seller less. Buying below
                      circle rate also triggers tax under Section 56(2)(x) &mdash; the gap can be taxed as income in
                      your hands.
                    </>
                  ) : (
                    <>
                      Your <span className="font-semibold text-[var(--foreground)]">agreement value</span> is{" "}
                      {inr(dutiable.gap)} above the circle rate, so duty is charged on what you actually pay. This is
                      the normal case in a healthy market.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-1 text-sm font-semibold">Other buying costs</h2>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">Optional &mdash; leave at zero to skip.</p>
              <div className="grid gap-4">
                <MoneyField label="Legal / documentation" value={legalFees} onChange={setLegalFees} />
                <label className="block">
                  <span className="text-sm font-semibold">Brokerage</span>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      value={brokeragePct}
                      min={0}
                      max={10}
                      step={0.25}
                      onChange={(event) => setBrokeragePct(Number(event.target.value))}
                      className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-10 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted-foreground)]">
                      %
                    </span>
                  </div>
                  <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
                    {inr(rollup.brokerage)} · 1-2% is the usual ask on a resale deal
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    One-time statutory cost in {state.name}
                  </p>
                  <p className="mt-2 text-5xl font-semibold text-[var(--primary)]" aria-live="polite">
                    {inr(result.total)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {num(result.percentOfValue)}% of {inr(dutiable.value)} · ranks #{selectedRank} of{" "}
                    {comparison.length} states by cost
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy estimate"}
                  </button>
                  <button type="button" onClick={downloadReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-2 py-2 font-semibold">Charge</th>
                      <th className="px-2 py-2 font-semibold">Basis</th>
                      <th className="px-2 py-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)] align-top">
                      <td className="px-2 py-3 font-semibold">Stamp duty</td>
                      <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">
                        {num(result.dutyRate)}% of {inr(dutiable.value)} · {result.dutyBasis}
                        {result.concessionCapped && (
                          <span className="mt-1 block font-semibold text-[var(--foreground)]">
                            Women&apos;s rebate capped &mdash; effective rate {num(result.effectiveRate)}%
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">{inr(result.duty)}</td>
                    </tr>
                    {result.extras.map((item) => (
                      <tr key={item.label} className="border-b border-[var(--border)] align-top">
                        <td className="px-2 py-3 font-semibold">{item.isFlat ? "Fixed fee" : "Cess / surcharge"}</td>
                        <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">{item.label}</td>
                        <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">{inr(item.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-[var(--border)] align-top">
                      <td className="px-2 py-3 font-semibold">Registration fee</td>
                      <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">
                        {num(result.regRate)}% of {inr(dutiable.value)}
                        {result.regCapped && (
                          <span className="mt-1 block font-semibold text-[var(--foreground)]">
                            Capped at {inr(result.regCap)} &mdash; uncapped it would be {inr(result.registrationRaw)},
                            so the cap saves you {inr(result.registrationRaw - result.registration)}
                          </span>
                        )}
                        {result.regRate === 0 && (
                          <span className="mt-1 block font-semibold text-[var(--foreground)]">
                            Waived for a sole female owner in {state.name}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">
                        {inr(result.registration)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-3 text-base font-semibold">Total one-time cost</td>
                      <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">
                        {num(result.percentOfValue)}% of the dutiable value
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right text-base font-semibold text-[var(--primary)]">
                        {inr(result.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">{state.name}:</span> {state.note}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Total cost of buying</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Property (agreement value)", dutiable.agreement, false],
                  ["Stamp duty + registration", result.total, true],
                  ["Legal / documentation", rollup.legal, true],
                  [`Brokerage @ ${num(brokeragePct)}%`, rollup.brokerage, true],
                ].map(([label, amount, isExtra]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  >
                    <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
                    <span className={`text-sm font-semibold ${isExtra ? "text-[var(--primary)]" : ""}`}>
                      {inr(amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Add-on cost over the sticker price</p>
                  <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{inr(rollup.total)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {num(rollup.percentOfValue)}% of the property value
                  </p>
                </div>
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">All-in outgo</p>
                  <p className="mt-1 text-3xl font-semibold">{inr(rollup.grandTotal)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">Property plus every cost above</p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md border p-4" style={{ borderColor: "var(--anslation-ds-danger)" }}>
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "var(--anslation-ds-danger)" }}
                />
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">
                    Your bank will not fund any of this.
                  </span>{" "}
                  Home loan eligibility is calculated on the property value alone &mdash; stamp duty, registration,
                  brokerage and legal fees are explicitly excluded from the loan amount, and they were removed from the
                  LTV calculation by the RBI. On this deal that is{" "}
                  <span className="font-semibold text-[var(--foreground)]">{inr(rollup.total)}</span> in cash you need
                  on the table, on top of your down payment. Budget it before you sign, not after.
                </p>
              </div>
            </div>

            {womenSaving > 0 && (
              <div className="rounded-lg border p-6" style={{ borderColor: "var(--anslation-ds-success)" }}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: "var(--anslation-ds-success)" }} />
                  <h2 className="text-sm font-semibold">Women-buyer concession in {state.name}</h2>
                </div>
                <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                  Save {inr(womenSaving)}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Registering this property in a woman&apos;s sole name costs {inr(femaleResult.total)} against{" "}
                  {inr(maleResult.total)} for a male buyer &mdash; a {num(womenSaving > 0 ? (womenSaving / maleResult.total) * 100 : 0)}%
                  cut in the statutory bill.{" "}
                  {owner === "female"
                    ? "You have this applied."
                    : owner === "joint"
                      ? "Joint male-female ownership usually gets a partial concession; sole female ownership gets the full one."
                      : "Switch the ownership toggle to compare."}{" "}
                  It is a real saving, but treat it as a tax question, not just a discount: the registered owner is the
                  legal owner, resale and succession follow that name, and a few states claw the rebate back if the
                  property is transferred to a male buyer within a lock-in period.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">The same property across India</h2>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {inr(dutiable.value)} · {OWNERS.find((item) => item.id === owner)?.label} buyer ·{" "}
                {PROPERTY_TYPES.find((item) => item.id === propertyType)?.label}. Cheapest first.
              </p>
              <div className="mt-4 max-h-[520px] overflow-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="sticky top-0 bg-[var(--card)]">
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-2 py-2 font-semibold">#</th>
                      <th className="px-2 py-2 font-semibold">State / UT</th>
                      <th className="px-2 py-2 text-right font-semibold">Stamp duty</th>
                      <th className="px-2 py-2 text-right font-semibold">Registration</th>
                      <th className="px-2 py-2 text-right font-semibold">Total</th>
                      <th className="px-2 py-2 text-right font-semibold">% of value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr
                        key={row.id}
                        className={`border-b border-[var(--border)] ${row.id === stateId ? "bg-[var(--muted)]" : ""}`}
                      >
                        <td className="px-2 py-2.5 text-xs text-[var(--muted-foreground)]">{row.rank}</td>
                        <td className="px-2 py-2.5 font-semibold">{row.name}</td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right text-[var(--muted-foreground)]">
                          {inr(row.result.duty + row.result.extrasTotal)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right text-[var(--muted-foreground)]">
                          {inr(row.result.registration)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-2 py-2.5 text-right font-semibold ${
                            row.id === stateId ? "text-[var(--primary)]" : ""
                          }`}
                        >
                          {inr(row.result.total)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right text-[var(--muted-foreground)]">
                          {num(row.result.percentOfValue)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                The spread between the cheapest and dearest state on this property is{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {inr(comparison[comparison.length - 1].result.total - comparison[0].result.total)}
                </span>{" "}
                &mdash; the same flat, the same price, different sub-registrar.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Rates change &mdash; verify with the
                  sub-registrar.</span>{" "}
                  {RATES_UPDATED}. Stamp duty is a state subject: rates move with every state budget, cities add local
                  cesses, and time-limited rebates appear and expire without much notice. Circle rates are revised
                  periodically and vary street by street, so check the exact ready-reckoner value for your survey
                  number. This estimate also excludes GST, which applies at 5% (1% for affordable housing) on
                  under-construction property but not on ready or resale homes. Treat this as a budgeting tool, not
                  legal or tax advice &mdash; confirm the final figure with your sub-registrar office or conveyancing
                  lawyer before you transact.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
