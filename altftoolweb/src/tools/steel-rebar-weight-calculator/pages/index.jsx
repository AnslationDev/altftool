"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Ruler, Trash2 } from "lucide-react";

import {
  ASTM_BAR_SIZES,
  D2_DIVISOR,
  IS_BAR_SIZES,
  STEEL_DENSITY_KG_M3,
  computeRebar,
  unitWeightTable,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : "—");

const DEFAULT_ROWS = [
  { id: 1, diameterMm: "12", lengthM: "6", count: "40" },
  { id: 2, diameterMm: "8", lengthM: "1.8", count: "120" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(3);
  const [lapWastagePct, setLapWastagePct] = useState("3");
  const [ratePerKg, setRatePerKg] = useState("62");
  const [stockLengthM, setStockLengthM] = useState("12");
  const [copied, setCopied] = useState(false);

  const updateRow = (id, key, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, diameterMm: "16", lengthM: "6", count: "20" }]);
    setNextId((prev) => prev + 1);
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const result = useMemo(
    () =>
      computeRebar({
        rows: rows.map((row) => ({
          diameterMm: Number(row.diameterMm),
          lengthM: Number(row.lengthM),
          count: Number(row.count),
        })),
        lapWastagePct,
        ratePerKg,
        stockLengthM,
      }),
    [rows, lapWastagePct, ratePerKg, stockLengthM],
  );

  const ok = !result.error;
  const table = useMemo(() => unitWeightTable(), []);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Steel Rebar Weight Calculator",
      ...result.detail.map(
        (row) =>
          `${row.count} bars of ${n0(row.diameterMm)} mm x ${n2(row.lengthM)} m = ${n2(row.cutWeight)} kg (${n3(row.weightPerMetre)} kg/m)`,
      ),
      `Cut length: ${n2(result.cutLength)} m`,
      `With ${n0(result.lapWastagePct)}% lap and wastage: ${n2(result.orderLength)} m`,
      `Total weight: ${n2(result.orderWeight)} kg (${n3(result.tonnes)} t)`,
      `Stock bars of ${n0(result.stockLengthM)} m: ${n0(result.stockBars)}`,
    ];
    if (result.cost > 0) lines.push(`Cost at ${n2(result.ratePerKg)} per kg: ${INR.format(result.cost)}`);
    return lines.join("\n");
  }, [ok, result]);

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
    setRows(DEFAULT_ROWS);
    setNextId(3);
    setLapWastagePct("3");
    setRatePerKg("62");
    setStockLengthM("12");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Construction materials
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Steel Rebar Weight Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a bar bending schedule into kilograms. Each bar size uses the standard unit weight
          d²/{n2(D2_DIVISOR)} kg per metre — the same figure as the IS 1786 table — so 12 mm comes out
          at 0.888 kg/m and 16 mm at 1.578 kg/m.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Bar schedule</h2>
        <div className="mt-4 grid gap-4">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Row {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label={`Remove bar row ${index + 1}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rb-dia-${row.id}`}>
                    Diameter (mm)
                  </label>
                  <input
                    id={`rb-dia-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    list="rb-sizes"
                    value={row.diameterMm}
                    onChange={(event) => updateRow(row.id, "diameterMm", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rb-len-${row.id}`}>
                    Length per bar (m)
                  </label>
                  <input
                    id={`rb-len-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={row.lengthM}
                    onChange={(event) => updateRow(row.id, "lengthM", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rb-cnt-${row.id}`}>
                    Number of bars
                  </label>
                  <input
                    id={`rb-cnt-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={row.count}
                    onChange={(event) => updateRow(row.id, "count", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <datalist id="rb-sizes">
          {IS_BAR_SIZES.map((mm) => (
            <option key={mm} value={mm} />
          ))}
        </datalist>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add bar row
        </button>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-lap">
              Lap, bend and wastage allowance (%)
            </label>
            <input
              id="rb-lap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={lapWastagePct}
              onChange={(event) => setLapWastagePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-stock">
              Stock bar length (m)
            </label>
            <input
              id="rb-stock"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="30"
              step="0.5"
              value={stockLengthM}
              onChange={(event) => setStockLengthM(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rb-rate">
              Steel rate (INR per kg, optional)
            </label>
            <input
              id="rb-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={ratePerKg}
              onChange={(event) => setRatePerKg(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total steel weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n2(result.orderWeight)} kg` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n3(result.tonnes)} tonnes · ${n0(result.stockBars)} bars of ${n0(result.stockLengthM)} m`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy rebar weight result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the bar schedule" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cut length before allowance", ok ? `${n2(result.cutLength)} m` : "—"],
            ["Length to order", ok ? `${n2(result.orderLength)} m` : "—"],
            ["Weight of the cut bars", ok ? `${n2(result.cutWeight)} kg` : "—"],
            [`Weight with ${ok ? n0(result.lapWastagePct) : "—"}% allowance`, ok ? `${n2(result.orderWeight)} kg` : "—"],
            ["In tonnes", ok ? `${n3(result.tonnes)} t` : "—"],
            ["Full-length bars to buy", ok ? n0(result.stockBars) : "—"],
            ["Cost", ok && result.cost > 0 ? INR.format(result.cost) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <caption className="sr-only">Weight of each bar row</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Bar</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kg/m</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Length</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                  <th scope="col" className="py-2 text-right font-semibold">Stock bars</th>
                </tr>
              </thead>
              <tbody>
                {result.detail.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {n0(row.diameterMm)} mm × {n0(row.count)}
                    </td>
                    <td className="py-2 pr-3 text-right">{n3(row.weightPerMetre)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n2(row.cutLength)} m</td>
                    <td className="py-2 pr-3 text-right">{n2(row.orderWeight)} kg</td>
                    <td className="py-2 text-right">{n0(row.stockBars)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Unit weight of IS 1786 bars</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Diameter</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Area</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">kg per m</th>
                <th scope="col" className="py-2 text-right font-semibold">kg per 12 m bar</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.diameterMm} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.diameterMm} mm</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n0(row.areaMm2)} mm²</td>
                  <td className="py-2 pr-3 text-right">{n3(row.weightPerMetre)}</td>
                  <td className="py-2 text-right">{n2(row.weightPer12m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Using a steel density of {n0(STEEL_DENSITY_KG_M3)} kg/m³. For ASTM A615 bars use the nominal
          diameter: {ASTM_BAR_SIZES.slice(0, 6).map((size) => `${size.label} = ${size.mm} mm`).join(", ")}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for ordering and costing. Mills supply against a rolling-margin tolerance, so a
        weighbridge figure will differ slightly from the nominal calculation, and lap lengths should
        come from the structural drawing rather than a flat percentage.
      </p>
    </main>
  );
}
