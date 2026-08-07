"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  Copy,
  FileDown,
  Info,
  PiggyBank,
  Plus,
  Printer,
  RotateCcw,
  Scale,
  Trash2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:society-maintenance-splitter:v1";

const BASES = [
  { id: "equal", short: "Equal", label: "Equal per flat", hint: "Same rupee amount for every flat" },
  { id: "sqft", short: "Per sq ft", label: "Per sq ft (carpet area)", hint: "Bigger flats pay proportionally more" },
  { id: "parking", short: "Per slot", label: "Per parking slot", hint: "Only flats holding slots pay" },
  { id: "custom", short: "Custom %", label: "Custom % per flat", hint: "Hand-set each flat's share" },
];

const defaultFlats = () => [
  { id: "f1", name: "A-101", area: 620, parking: 1, occupied: true },
  { id: "f2", name: "A-102", area: 950, parking: 1, occupied: true },
  { id: "f3", name: "A-201", area: 620, parking: 0, occupied: false },
  { id: "f4", name: "A-202", area: 950, parking: 2, occupied: true },
  { id: "f5", name: "B-101", area: 1250, parking: 2, occupied: true },
  { id: "f6", name: "B-102", area: 1450, parking: 2, occupied: true },
];

const defaultHeads = () => [
  { id: "h1", name: "Security guards", amount: 42000, basis: "equal", chargeVacant: true, custom: {} },
  { id: "h2", name: "Housekeeping", amount: 18000, basis: "equal", chargeVacant: true, custom: {} },
  { id: "h3", name: "Lift AMC", amount: 6500, basis: "equal", chargeVacant: true, custom: {} },
  { id: "h4", name: "Common electricity", amount: 12000, basis: "sqft", chargeVacant: true, custom: {} },
  { id: "h5", name: "Water tanker", amount: 9000, basis: "sqft", chargeVacant: false, custom: {} },
  { id: "h6", name: "Garden & landscaping", amount: 4500, basis: "sqft", chargeVacant: true, custom: {} },
  { id: "h7", name: "Repairs & maintenance", amount: 8000, basis: "sqft", chargeVacant: true, custom: {} },
  { id: "h8", name: "Sinking fund", amount: 7000, basis: "sqft", chargeVacant: true, custom: {} },
  { id: "h9", name: "Parking area upkeep", amount: 3000, basis: "parking", chargeVacant: true, custom: {} },
];

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function allocateRupees(amount, weights) {
  const target = Math.max(0, Math.round(toNumber(amount)));
  const clean = weights.map((weight) => Math.max(0, toNumber(weight)));
  const totalWeight = clean.reduce((sum, weight) => sum + weight, 0);
  if (target === 0 || totalWeight <= 0) return clean.map(() => 0);

  const exact = clean.map((weight) => (target * weight) / totalWeight);
  const shares = exact.map((value) => Math.floor(value));
  let remainder = target - shares.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    shares[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }
  return shares;
}

function weightsForHead(head, flats) {
  const gateRaw = flats.map((flat) => (head.chargeVacant || flat.occupied ? 1 : 0));
  const gate = gateRaw.some(Boolean) ? gateRaw : flats.map(() => 1);
  const skippedVacant = gateRaw.some(Boolean) && gateRaw.some((value) => value === 0);

  let weights;
  if (head.basis === "sqft") {
    weights = flats.map((flat, index) => gate[index] * Math.max(0, toNumber(flat.area)));
  } else if (head.basis === "parking") {
    weights = flats.map((flat, index) => gate[index] * Math.max(0, toNumber(flat.parking)));
  } else if (head.basis === "custom") {
    weights = flats.map((flat, index) => gate[index] * Math.max(0, toNumber(head.custom?.[flat.id])));
  } else {
    weights = gate.slice();
  }

  const sum = weights.reduce((total, weight) => total + weight, 0);
  if (sum > 0) return { weights, fallback: false, skippedVacant };
  return { weights: gate.slice(), fallback: head.basis !== "equal", skippedVacant };
}

const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function downloadTextFile(filename, content, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const inputClass =
  "h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";
const smallInputClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";
const cardClass =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]";

const printCss = `
@media print {
  body * { visibility: hidden !important; }
  #sms-print-bill, #sms-print-bill * { visibility: visible !important; }
  #sms-print-bill {
    position: absolute !important;
    inset: 0 auto auto 0;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  #sms-print-bill * {
    color: #000 !important;
    background: transparent !important;
    border-color: #94a3b8 !important;
    box-shadow: none !important;
  }
  .sms-no-print { display: none !important; }
  @page { margin: 14mm; }
}
`;

export default function ToolHome() {
  const [flats, setFlats] = useState(defaultFlats);
  const [heads, setHeads] = useState(defaultHeads);
  const [month, setMonth] = useState("");
  const [societyName, setSocietyName] = useState("Green Meadows CHS Ltd.");
  const [billFlatId, setBillFlatId] = useState("f1");
  const [customOpen, setCustomOpen] = useState("");
  const [costPerSqft, setCostPerSqft] = useState(2200);
  const [copied, setCopied] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      /* ignore unreadable storage */
    }
    if (saved) {
      if (Array.isArray(saved.flats) && saved.flats.length > 0) setFlats(saved.flats);
      if (Array.isArray(saved.heads) && saved.heads.length > 0) setHeads(saved.heads);
      if (typeof saved.societyName === "string") setSocietyName(saved.societyName);
      if (typeof saved.costPerSqft === "number") setCostPerSqft(saved.costPerSqft);
    }
    setMonth(
      typeof saved?.month === "string" && saved.month
        ? saved.month
        : new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ flats, heads, societyName, month, costPerSqft })
      );
    } catch {
      /* storage full or blocked */
    }
  }, [flats, heads, societyName, month, costPerSqft, hydrated]);

  const totals = useMemo(() => {
    const area = flats.reduce((sum, flat) => sum + Math.max(0, toNumber(flat.area)), 0);
    const parking = flats.reduce((sum, flat) => sum + Math.max(0, toNumber(flat.parking)), 0);
    const occupied = flats.filter((flat) => flat.occupied).length;
    const expense = heads.reduce((sum, head) => sum + Math.max(0, Math.round(toNumber(head.amount))), 0);
    return { area, parking, occupied, expense };
  }, [flats, heads]);

  const split = useMemo(() => {
    const rows = heads.map((head) => {
      const { weights, fallback, skippedVacant } = weightsForHead(head, flats);
      const shares = allocateRupees(head.amount, weights);
      return { head, shares, fallback, skippedVacant };
    });

    const flatTotals = flats.map((_, index) =>
      rows.reduce((sum, row) => sum + (row.shares[index] || 0), 0)
    );

    return { rows, flatTotals, billed: flatTotals.reduce((sum, value) => sum + value, 0) };
  }, [flats, heads]);

  const comparison = useMemo(() => {
    const equal = allocateRupees(totals.expense, flats.map(() => 1));
    const area = allocateRupees(
      totals.expense,
      flats.map((flat) => Math.max(0, toNumber(flat.area)))
    );
    const rows = flats.map((flat, index) => ({
      flat,
      equal: equal[index] || 0,
      area: area[index] || 0,
      diff: (area[index] || 0) - (equal[index] || 0),
    }));
    const sorted = [...rows].sort((a, b) => b.diff - a.diff);
    return { rows, biggest: sorted[0], smallest: sorted[sorted.length - 1] };
  }, [flats, totals.expense]);

  const sinkingSuggestion = useMemo(() => {
    const yearly = totals.area * Math.max(0, toNumber(costPerSqft)) * 0.0025;
    return { yearly, monthly: yearly / 12 };
  }, [totals.area, costPerSqft]);

  const perSqftRate = totals.area > 0 ? totals.expense / totals.area : 0;

  const selectedIndex = flats.findIndex((flat) => flat.id === billFlatId);
  const billFlatIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const billFlat = flats[billFlatIndex] || null;

  const updateFlat = useCallback((id, patch) => {
    setFlats((current) => current.map((flat) => (flat.id === id ? { ...flat, ...patch } : flat)));
  }, []);

  const updateHead = useCallback((id, patch) => {
    setHeads((current) => current.map((head) => (head.id === id ? { ...head, ...patch } : head)));
  }, []);

  const addFlat = () => {
    const id = uid("f");
    setFlats((current) => [
      ...current,
      { id, name: `Flat ${current.length + 1}`, area: 800, parking: 1, occupied: true },
    ]);
  };

  const addHead = () => {
    const id = uid("h");
    setHeads((current) => [
      ...current,
      { id, name: "New expense head", amount: 5000, basis: "equal", chargeVacant: true, custom: {} },
    ]);
  };

  const setCustomShare = (headId, flatId, value) => {
    setHeads((current) =>
      current.map((head) =>
        head.id === headId ? { ...head, custom: { ...head.custom, [flatId]: value } } : head
      )
    );
  };

  const seedCustom = (headId, mode) => {
    setHeads((current) =>
      current.map((head) => {
        if (head.id !== headId) return head;
        const custom = {};
        if (mode === "equal") {
          const share = flats.length > 0 ? 100 / flats.length : 0;
          flats.forEach((flat) => {
            custom[flat.id] = Number(share.toFixed(2));
          });
        } else {
          flats.forEach((flat) => {
            const share = totals.area > 0 ? (toNumber(flat.area) / totals.area) * 100 : 0;
            custom[flat.id] = Number(share.toFixed(2));
          });
        }
        return { ...head, custom };
      })
    );
  };

  const resetAll = () => {
    if (
      !window.confirm(
        "Reset all flats and expense heads back to the sample data? This clears everything you've entered."
      )
    ) {
      return;
    }
    setFlats(defaultFlats());
    setHeads(defaultHeads());
    setSocietyName("Green Meadows CHS Ltd.");
    setCostPerSqft(2200);
  };

  const applySinkingFund = () => {
    const amount = Math.round(sinkingSuggestion.monthly);
    const existing = heads.find((head) => head.name.toLowerCase().includes("sinking"));
    if (existing) {
      updateHead(existing.id, { amount, basis: "sqft" });
    } else {
      setHeads((current) => [
        ...current,
        { id: uid("h"), name: "Sinking fund", amount, basis: "sqft", chargeVacant: true, custom: {} },
      ]);
    }
  };

  const tableText = useMemo(() => {
    const header = ["Flat", "Carpet sq ft", "Parking", "Status", ...heads.map((head) => head.name), "Total"];
    const body = flats.map((flat, index) => [
      flat.name,
      num(toNumber(flat.area)),
      num(toNumber(flat.parking)),
      flat.occupied ? "Occupied" : "Vacant",
      ...split.rows.map((row) => row.shares[index] || 0),
      split.flatTotals[index] || 0,
    ]);
    const footer = [
      "TOTAL",
      num(totals.area),
      num(totals.parking),
      `${totals.occupied}/${flats.length} occupied`,
      ...split.rows.map((row) => row.shares.reduce((sum, value) => sum + value, 0)),
      split.billed,
    ];
    const basisRow = [
      "Allocation basis",
      "",
      "",
      "",
      ...heads.map((head) => BASES.find((base) => base.id === head.basis)?.label || head.basis),
      "",
    ];
    return [
      `${societyName} — maintenance split for ${month}`,
      "",
      [header, basisRow, ...body, footer]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
        .join("\n"),
      "",
      `Total expenses,${totals.expense}`,
      `Sum of flat bills,${split.billed}`,
      `Difference,${totals.expense - split.billed}`,
    ].join("\n");
  }, [flats, heads, split, totals, societyName, month]);

  const copyTable = async () => {
    const ok = await safeCopyText(tableText);
    if (!ok) return;
    setCopied("table");
    setTimeout(() => setCopied(""), 1400);
  };

  const balanced = totals.expense === split.billed;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{printCss}</style>
      <div className="mx-auto max-w-6xl">
        <section className={`${cardClass} sms-no-print 2xl:p-8`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Building2 className="h-4 w-4" />
            Housing society / RWA
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Society Maintenance Charge Splitter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Add your flats and monthly expense heads, pick an allocation basis for each head, and get a
            reconciled bill for every flat — plus the equal-split vs area-based comparison that every AGM
            argues about.
          </p>
          <div className="tool-compact-grid mt-6">
            {[
              ["Flats", `${flats.length} (${totals.occupied} occupied)`],
              ["Total carpet area", `${num(totals.area)} sq ft`],
              ["Monthly expenses", inr(totals.expense)],
              ["Blended rate", `${inr(perSqftRate)}/sq ft`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="sms-no-print mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Society details</h2>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm font-semibold">Society name</span>
                  <input
                    type="text"
                    value={societyName}
                    onChange={(event) => setSocietyName(event.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Billing month</span>
                  <input
                    type="text"
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-1 flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Sinking fund check</h2>
              </div>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Model bye-law 13(c) sets the sinking fund at a minimum of <strong>0.25% per year</strong> of
                the construction cost of each flat (land cost excluded), as decided by the general body.
              </p>
              <label className="mt-4 block">
                <span className="text-sm font-semibold">Construction cost (₹ per sq ft)</span>
                <input
                  type="number"
                  min="0"
                  value={costPerSqft}
                  onChange={(event) => setCostPerSqft(Number(event.target.value))}
                  className={`mt-2 ${inputClass}`}
                />
              </label>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Society sinking fund / year</p>
                  <p className="mt-1 font-semibold">{inr(sinkingSuggestion.yearly)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Per month</p>
                  <p className="mt-1 font-semibold text-[var(--primary)]">{inr(sinkingSuggestion.monthly)}</p>
                </div>
              </div>
              <button type="button" onClick={applySinkingFund} className="btn-secondary mt-3 w-full text-sm">
                <Check className="h-4 w-4" />
                Use as sinking fund head
              </button>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Repairs &amp; maintenance fund is separately pegged at a minimum of 0.75% per year of
                construction cost under the same model bye-laws.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className={cardClass}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Flats</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Carpet area drives every per-sq-ft head. Vacant flats can be excluded head by head.
                  </p>
                </div>
                <button type="button" onClick={addFlat} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Plus className="h-4 w-4" />
                  Add flat
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="pb-2 pr-3 font-semibold">Flat no.</th>
                      <th className="pb-2 pr-3 font-semibold">Carpet area (sq ft)</th>
                      <th className="pb-2 pr-3 font-semibold">Parking slots</th>
                      <th className="pb-2 pr-3 font-semibold">Status</th>
                      <th className="pb-2 pr-3 font-semibold">Monthly bill</th>
                      <th className="pb-2 font-semibold sr-only">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flats.map((flat, index) => (
                      <tr key={flat.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3">
                          <label className="block">
                            <span className="sr-only">Flat number</span>
                            <input
                              type="text"
                              value={flat.name}
                              onChange={(event) => updateFlat(flat.id, { name: event.target.value })}
                              className={smallInputClass}
                            />
                          </label>
                        </td>
                        <td className="py-2 pr-3">
                          <label className="block">
                            <span className="sr-only">Carpet area of {flat.name}</span>
                            <input
                              type="number"
                              min="0"
                              value={flat.area}
                              onChange={(event) => updateFlat(flat.id, { area: Number(event.target.value) })}
                              className={smallInputClass}
                            />
                          </label>
                        </td>
                        <td className="py-2 pr-3">
                          <label className="block">
                            <span className="sr-only">Parking slots of {flat.name}</span>
                            <input
                              type="number"
                              min="0"
                              value={flat.parking}
                              onChange={(event) => updateFlat(flat.id, { parking: Number(event.target.value) })}
                              className={smallInputClass}
                            />
                          </label>
                        </td>
                        <td className="py-2 pr-3">
                          <button
                            type="button"
                            onClick={() => updateFlat(flat.id, { occupied: !flat.occupied })}
                            aria-pressed={flat.occupied}
                            className={`h-10 w-full rounded-md border px-2 text-xs font-semibold transition ${
                              flat.occupied
                                ? "border-[var(--primary)] text-[var(--primary)]"
                                : "border-[var(--border)] text-[var(--muted-foreground)]"
                            }`}
                          >
                            {flat.occupied ? "Occupied" : "Vacant"}
                          </button>
                        </td>
                        <td className="py-2 pr-3 font-semibold">{inr(split.flatTotals[index] || 0)}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => setFlats((current) => current.filter((item) => item.id !== flat.id))}
                            disabled={flats.length <= 1}
                            aria-label={`Remove ${flat.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="text-sm font-semibold">
                      <td className="pt-3 pr-3">Total</td>
                      <td className="pt-3 pr-3">{num(totals.area)}</td>
                      <td className="pt-3 pr-3">{num(totals.parking)}</td>
                      <td className="pt-3 pr-3 text-[var(--muted-foreground)]">
                        {totals.occupied}/{flats.length}
                      </td>
                      <td className="pt-3 pr-3 text-[var(--primary)]">{inr(split.billed)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Expense heads</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Each head is allocated on its own basis — that is how real society bills are built.
                  </p>
                </div>
                <button type="button" onClick={addHead} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Plus className="h-4 w-4" />
                  Add head
                </button>
              </div>

              <div className="grid gap-3">
                {heads.map((head) => {
                  const row = split.rows.find((item) => item.head.id === head.id);
                  const customSum = flats.reduce(
                    (sum, flat) => sum + Math.max(0, toNumber(head.custom?.[flat.id])),
                    0
                  );
                  const isOpen = customOpen === head.id;
                  return (
                    <div
                      key={head.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                        <label className="block">
                          <span className="sr-only">Expense head name</span>
                          <input
                            type="text"
                            value={head.name}
                            onChange={(event) => updateHead(head.id, { name: event.target.value })}
                            className={smallInputClass}
                          />
                        </label>
                        <label className="block">
                          <span className="sr-only">Monthly amount for {head.name}</span>
                          <input
                            type="number"
                            min="0"
                            value={head.amount}
                            onChange={(event) => updateHead(head.id, { amount: Number(event.target.value) })}
                            className={smallInputClass}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setHeads((current) => current.filter((item) => item.id !== head.id))}
                          aria-label={`Remove ${head.name}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {BASES.map((base) => (
                          <button
                            key={base.id}
                            type="button"
                            title={base.hint}
                            onClick={() => {
                              updateHead(head.id, { basis: base.id });
                              if (base.id === "custom") {
                                setCustomOpen(head.id);
                                if (!head.custom || Object.keys(head.custom).length === 0) {
                                  seedCustom(head.id, "equal");
                                }
                              }
                            }}
                            aria-pressed={head.basis === base.id}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                              head.basis === base.id
                                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                            }`}
                          >
                            {base.short}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateHead(head.id, { chargeVacant: !head.chargeVacant })}
                          aria-pressed={!head.chargeVacant}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            head.chargeVacant
                              ? "border-[var(--border)] text-[var(--muted-foreground)]"
                              : "border-[var(--primary)] text-[var(--primary)]"
                          }`}
                        >
                          {head.chargeVacant ? "Vacant flats charged" : "Vacant flats skipped"}
                        </button>
                        {head.basis === "custom" && (
                          <button
                            type="button"
                            onClick={() => setCustomOpen(isOpen ? "" : head.id)}
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--primary)]"
                          >
                            {isOpen ? "Hide shares" : "Edit shares"}
                          </button>
                        )}
                        <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                          {inr(Math.round(toNumber(head.amount)))}
                        </span>
                      </div>

                      {head.basis === "custom" && isOpen && (
                        <div className="mt-3 rounded-md bg-[var(--muted)] p-3">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold">Share of {head.name} (%)</span>
                            <button
                              type="button"
                              onClick={() => seedCustom(head.id, "equal")}
                              className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]"
                            >
                              Seed equal
                            </button>
                            <button
                              type="button"
                              onClick={() => seedCustom(head.id, "area")}
                              className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]"
                            >
                              Seed by area
                            </button>
                            <span
                              className="ml-auto text-xs font-semibold"
                              style={{
                                color:
                                  Math.abs(customSum - 100) < 0.51
                                    ? "var(--anslation-ds-success)"
                                    : "var(--anslation-ds-danger)",
                              }}
                            >
                              Sum {num(customSum, 2)}%
                            </span>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                            {flats.map((flat) => (
                              <label key={flat.id} className="block">
                                <span className="text-xs text-[var(--muted-foreground)]">{flat.name}</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={head.custom?.[flat.id] ?? 0}
                                  onChange={(event) =>
                                    setCustomShare(head.id, flat.id, Number(event.target.value))
                                  }
                                  className={`mt-1 ${smallInputClass}`}
                                />
                              </label>
                            ))}
                          </div>
                          {Math.abs(customSum - 100) >= 0.51 && customSum > 0 && (
                            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                              Shares add up to {num(customSum, 2)}% — they are normalised to 100% so the head
                              still reconciles exactly.
                            </p>
                          )}
                        </div>
                      )}

                      {row?.fallback && (
                        <p className="mt-2 inline-flex items-start gap-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                          <AlertTriangle
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            style={{ color: "var(--anslation-ds-danger)" }}
                          />
                          No usable weights for this basis (all zero) — falling back to an equal split so the
                          money is still allocated.
                        </p>
                      )}
                      {row?.skippedVacant && !head.chargeVacant && (
                        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                          Vacant flats excluded — this head is redistributed across the {totals.occupied}{" "}
                          occupied flats.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className={`${cardClass} sms-no-print mt-6`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Full split table</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Every head against every flat. Amounts are whole rupees allocated by the largest-remainder
                method, so nothing leaks in rounding.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyTable} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied === "table" ? "Copied" : "Copy table"}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    `society-maintenance-${month.replace(/\s+/g, "-").toLowerCase()}.csv`,
                    tableText
                  )
                }
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
              >
                <FileDown className="h-4 w-4" />
                Download CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="p-2 font-semibold">Flat</th>
                  {heads.map((head) => (
                    <th key={head.id} className="p-2 text-right font-semibold">
                      {head.name}
                      <span className="block text-[10px] font-medium normal-case text-[var(--primary)]">
                        {BASES.find((base) => base.id === head.basis)?.short}
                      </span>
                    </th>
                  ))}
                  <th className="p-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {flats.map((flat, index) => (
                  <tr key={flat.id} className="border-b border-[var(--border)]">
                    <td className="p-2 font-semibold">
                      {flat.name}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {num(toNumber(flat.area))} sq ft{flat.occupied ? "" : " · vacant"}
                      </span>
                    </td>
                    {split.rows.map((row) => (
                      <td key={row.head.id} className="p-2 text-right tabular-nums">
                        {num(row.shares[index] || 0)}
                      </td>
                    ))}
                    <td className="p-2 text-right font-semibold tabular-nums text-[var(--primary)]">
                      {num(split.flatTotals[index] || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-sm font-semibold">
                  <td className="p-2">Total</td>
                  {split.rows.map((row) => (
                    <td key={row.head.id} className="p-2 text-right tabular-nums">
                      {num(row.shares.reduce((sum, value) => sum + value, 0))}
                    </td>
                  ))}
                  <td className="p-2 text-right tabular-nums text-[var(--primary)]">{num(split.billed)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div
            className="mt-5 rounded-md border p-4"
            style={{
              borderColor: balanced ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
            }}
            aria-live="polite"
          >
            <p className="text-sm font-semibold">Reconciliation</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Total expenses booked</p>
                <p className="font-semibold">{inr(totals.expense)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Sum of all flat bills</p>
                <p className="font-semibold">{inr(split.billed)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Difference</p>
                <p
                  className="font-semibold"
                  style={{
                    color: balanced ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                  }}
                >
                  {inr(totals.expense - split.billed)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {balanced
                ? "Balanced — every rupee of expense is recovered across the flats, with no rounding surplus or shortfall."
                : "Out of balance — check for a head with a negative amount."}
            </p>
          </div>
        </section>

        <section className={`${cardClass} sms-no-print mt-6`}>
          <div className="mb-1 flex items-center gap-2">
            <Scale className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Equal split vs area-based — the AGM argument</h2>
          </div>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Both columns recover the same {inr(totals.expense)}. Only the sharing changes: equal split charges
            every flat {inr(flats.length > 0 ? totals.expense / flats.length : 0)}, while area-based charges{" "}
            {inr(perSqftRate)} per sq ft of carpet area.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="p-2 font-semibold">Flat</th>
                  <th className="p-2 text-right font-semibold">Carpet area</th>
                  <th className="p-2 text-right font-semibold">Equal split</th>
                  <th className="p-2 text-right font-semibold">Area based</th>
                  <th className="p-2 text-right font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.flat.id} className="border-b border-[var(--border)]">
                    <td className="p-2 font-semibold">{row.flat.name}</td>
                    <td className="p-2 text-right tabular-nums">{num(toNumber(row.flat.area))} sq ft</td>
                    <td className="p-2 text-right tabular-nums">{num(row.equal)}</td>
                    <td className="p-2 text-right tabular-nums">{num(row.area)}</td>
                    <td
                      className="p-2 text-right font-semibold tabular-nums"
                      style={{
                        color:
                          row.diff > 0
                            ? "var(--anslation-ds-danger)"
                            : row.diff < 0
                              ? "var(--anslation-ds-success)"
                              : "var(--muted-foreground)",
                      }}
                    >
                      {row.diff > 0 ? "+" : ""}
                      {num(row.diff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {comparison.biggest && comparison.smallest && comparison.biggest.diff > 0 && (
            <div className="mt-4 rounded-md bg-[var(--muted)] p-4 text-sm leading-6">
              Switching from an equal split to a per-sq-ft split moves{" "}
              <strong>{inr(comparison.biggest.diff)}</strong> a month onto{" "}
              <strong>{comparison.biggest.flat.name}</strong> ({num(toNumber(comparison.biggest.flat.area))} sq
              ft) — that is <strong>{inr(comparison.biggest.diff * 12)}</strong> a year — while{" "}
              <strong>{comparison.smallest.flat.name}</strong> (
              {num(toNumber(comparison.smallest.flat.area))} sq ft) saves{" "}
              <strong>{inr(Math.abs(comparison.smallest.diff))}</strong> a month.
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_390px]">
          <div className={cardClass} id="sms-print-bill">
            <div className="sms-no-print mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Per-flat bill</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Head-wise breakdown, ready to print.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="block">
                  <span className="sr-only">Choose flat for bill</span>
                  <select
                    value={billFlat?.id || ""}
                    onChange={(event) => setBillFlatId(event.target.value)}
                    className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print bill
                </button>
              </div>
            </div>

            {billFlat && (
              <div className="rounded-md border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
                  <div>
                    <p className="text-lg font-semibold">{societyName}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Maintenance bill · {month}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{billFlat.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {num(toNumber(billFlat.area))} sq ft · {num(toNumber(billFlat.parking))} parking ·{" "}
                      {billFlat.occupied ? "Occupied" : "Vacant"}
                    </p>
                  </div>
                </div>

                <table className="mt-3 w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 font-semibold">Head</th>
                      <th className="py-2 font-semibold">Basis</th>
                      <th className="py-2 text-right font-semibold">Head total</th>
                      <th className="py-2 text-right font-semibold">Your share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {split.rows.map((row) => (
                      <tr key={row.head.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-2">{row.head.name}</td>
                        <td className="py-2 pr-2 text-xs text-[var(--muted-foreground)]">
                          {BASES.find((base) => base.id === row.head.basis)?.label}
                          {row.fallback ? " (fallback: equal)" : ""}
                        </td>
                        <td className="py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                          {num(Math.round(toNumber(row.head.amount)))}
                        </td>
                        <td className="py-2 text-right font-semibold tabular-nums">
                          {num(row.shares[billFlatIndex] || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-3 font-semibold" colSpan={3}>
                        Total payable for {month}
                      </td>
                      <td className="pt-3 text-right text-lg font-semibold tabular-nums text-[var(--primary)]">
                        {inr(split.flatTotals[billFlatIndex] || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  Computed on {new Date().toLocaleDateString("en-IN")} · Effective rate{" "}
                  {inr(
                    toNumber(billFlat.area) > 0
                      ? (split.flatTotals[billFlatIndex] || 0) / toNumber(billFlat.area)
                      : 0
                  )}
                  /sq ft · This is a working sheet, not a receipt. Cheque/UPI details and the society seal go on
                  the official bill.
                </p>
              </div>
            )}
          </div>

          <div className={`${cardClass} sms-no-print`}>
            <div className="mb-1 flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">What the bye-laws actually say</h2>
            </div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Builders and most societies bill maintenance <strong>per sq ft</strong>, but the model co-operative
              bye-laws (bye-law 68) allocate several heads <strong>equally</strong>. That mismatch is what large
              flats and small flats fight about. The usual settlement: keep service charges equal, keep
              area-linked funds per sq ft.
            </p>
            <ul className="mt-4 grid gap-2 text-sm leading-6">
              {[
                ["Service charges — security, housekeeping, lift, common electricity", "Equally per flat"],
                ["Sinking fund & repairs fund", "Per sq ft (of construction cost)"],
                ["Property tax", "As levied on each flat"],
                ["Water charges", "By number of taps / inlets in each flat"],
                ["Parking charges", "Per slot, as fixed by the general body"],
                ["Insurance & lease rent", "By built-up area"],
                ["Non-occupancy charges", "Max 10% of service charges (vacant / rented flats)"],
              ].map(([head, basis]) => (
                <li
                  key={head}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-2"
                >
                  <span>{head}</span>
                  <span className="text-xs font-semibold text-[var(--primary)]">{basis}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Bye-laws vary by state and by what your general body has resolved. Treat this as a planning sheet
              and confirm the basis in your society&apos;s registered bye-laws before issuing bills.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
