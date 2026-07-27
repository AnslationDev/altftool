"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Power, RotateCcw, Trash2 } from "lucide-react";

import {
  CONTINUOUS_LOAD_FRACTION,
  DEVICE_CATALOGUE,
  MAINS_PRESETS,
  STRIP_RATINGS_A,
  catalogueEntry,
  computeStripLoad,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const DASH = "—";

const watts = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} W` : DASH);
const amps = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} A` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM0.format(v)}%` : DASH);

const DEFAULT_PRESET = "uk";
const DEFAULT_STRIP_A = "10";

const startingRows = () => [
  { id: 1, key: "laptop", label: "Laptop charger (USB-C)", watts: "65", qty: "2", heating: false },
  { id: 2, key: "phone", label: "Phone fast charger", watts: "25", qty: "2", heating: false },
  { id: 3, key: "camera", label: "Camera battery charger", watts: "20", qty: "1", heating: false },
  { id: 4, key: "kettle", label: "Travel kettle", watts: "1000", qty: "1", heating: true },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const presetByCode = (code) => MAINS_PRESETS.find((preset) => preset.code === code) ?? MAINS_PRESETS[0];

export default function ToolHome() {
  const [presetCode, setPresetCode] = useState(DEFAULT_PRESET);
  const [voltage, setVoltage] = useState(String(presetByCode(DEFAULT_PRESET).voltageV));
  const [socketA, setSocketA] = useState(String(presetByCode(DEFAULT_PRESET).socketRatingA));
  const [stripA, setStripA] = useState(DEFAULT_STRIP_A);
  const [rows, setRows] = useState(startingRows);
  const [addKey, setAddKey] = useState(DEVICE_CATALOGUE[0].key);
  const [copied, setCopied] = useState(false);

  const applyPreset = (code) => {
    const preset = presetByCode(code);
    setPresetCode(code);
    setVoltage(String(preset.voltageV));
    setSocketA(String(preset.socketRatingA));
    setCopied(false);
  };

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
    setCopied(false);
  };

  const addRow = () => {
    const entry = catalogueEntry(addKey);
    if (!entry) return;
    setRows((prev) => {
      const nextId = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          key: entry.key,
          label: entry.label,
          watts: String(entry.watts),
          qty: "1",
          heating: entry.heating,
        },
      ];
    });
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeStripLoad({
        devices: rows.map((row) => ({
          key: String(row.id),
          label: row.label,
          watts: toNum(row.watts),
          qty: toNum(row.qty),
          heating: row.heating,
        })),
        mainsVoltageV: toNum(voltage),
        stripRatingA: toNum(stripA),
        socketRatingA: toNum(socketA),
      }),
    [rows, voltage, stripA, socketA],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Travel Power Strip Load Calculator",
      `Supply: ${voltage} V · socket ${socketA} A · strip ${stripA} A`,
      ...result.activeRows.map(
        (row) => `${row.label} x${row.qty}: ${NUM0.format(row.totalWatts)} W (${NUM2.format(row.totalAmps)} A)`,
      ),
      `Total: ${NUM0.format(result.totalWatts)} W, ${NUM2.format(result.totalAmps)} A`,
      `Binding limit: ${result.bindingRatingA} A (${result.bindingPart})`,
      `Continuous-load ceiling: ${NUM0.format(result.maxWattsContinuous)} W`,
      `Hard ceiling: ${NUM0.format(result.maxWattsPeak)} W`,
      `Verdict: ${result.verdict}`,
    ].join("\n");
  }, [ok, result, voltage, socketA, stripA]);

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
    setPresetCode(DEFAULT_PRESET);
    setVoltage(String(presetByCode(DEFAULT_PRESET).voltageV));
    setSocketA(String(presetByCode(DEFAULT_PRESET).socketRatingA));
    setStripA(DEFAULT_STRIP_A);
    setRows(startingRows());
    setAddKey(DEVICE_CATALOGUE[0].key);
    setCopied(false);
  };

  const detailRows = [
    [`Current at ${ok ? voltage : "?"} V`, ok ? amps(result.totalAmps) : DASH],
    [
      "Binding limit",
      ok ? `${result.bindingRatingA} A — the ${result.bindingPart}` : DASH,
    ],
    ["Share of that limit used", ok ? pct(result.utilisationPct) : DASH],
    [
      `Ceiling for loads running over 3 hours (${NUM0.format(CONTINUOUS_LOAD_FRACTION * 100)}%)`,
      ok ? watts(result.maxWattsContinuous) : DASH,
    ],
    ["Hard ceiling at the full rating", ok ? watts(result.maxWattsPeak) : DASH],
    [
      "Spare capacity before the 80% margin",
      ok ? watts(result.spareWattsToContinuous) : DASH,
    ],
    ["Spare capacity before the hard limit", ok ? watts(result.spareWattsToPeak) : DASH],
    ["Of which heating appliances", ok ? watts(result.heatingWatts) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Power className="h-4 w-4" aria-hidden="true" />
          One socket, one cord, one limit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Travel Power Strip Load Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Everything on a power strip shares one wall socket and one flexible cord, so the real limit is current, not
          the number of holes. Add what you are plugging in to see the total watts, the amps they draw at your
          destination voltage, and how much headroom is left.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="strip-preset">
              Destination
            </label>
            <select
              id="strip-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetCode}
              onChange={(e) => applyPreset(e.target.value)}
            >
              {MAINS_PRESETS.map((preset) => (
                <option key={preset.code} value={preset.code}>
                  {preset.label} · typical {preset.socketRatingA} A socket
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="strip-voltage">
              Supply voltage (V)
            </label>
            <input
              id="strip-voltage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="300"
              step="1"
              value={voltage}
              onChange={(e) => {
                setVoltage(e.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="strip-socket">
              Wall socket rating (A)
            </label>
            <input
              id="strip-socket"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="40"
              step="1"
              value={socketA}
              onChange={(e) => {
                setSocketA(e.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="strip-rating">
              Power strip rating (A)
            </label>
            <select
              id="strip-rating"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stripA}
              onChange={(e) => {
                setStripA(e.target.value);
                setCopied(false);
              }}
            >
              {STRIP_RATINGS_A.map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating} A
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="strip-add">
              Add a device
            </label>
            <div className="mt-2 flex gap-2">
              <select
                id="strip-add"
                className={INPUT_CLASS}
                value={addKey}
                onChange={(e) => setAddKey(e.target.value)}
              >
                {DEVICE_CATALOGUE.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label} · {item.watts} W
                  </option>
                ))}
              </select>
              <button type="button" onClick={addRow} className={PRIMARY_BTN} aria-label="Add this device to the list">
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            On the strip — edit any wattage to match your own label
          </p>
          {rows.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Nothing on the strip yet. Add a device above.
            </p>
          )}
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-md border border-[var(--border)] p-3 sm:flex sm:items-end sm:gap-3"
            >
              <p className="text-sm font-semibold sm:flex-1">{row.label}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-0 sm:w-56">
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)]" htmlFor={`strip-w-${row.id}`}>
                    Watts
                  </label>
                  <input
                    id={`strip-w-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="5"
                    value={row.watts}
                    onChange={(e) => updateRow(row.id, "watts", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)]" htmlFor={`strip-q-${row.id}`}>
                    Quantity
                  </label>
                  <input
                    id={`strip-q-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="20"
                    step="1"
                    value={row.qty}
                    onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label={`Remove ${row.label} from the list`}
                className={`mt-3 w-full sm:mt-0 sm:w-auto ${GHOST_BTN}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {!ok && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total load on the strip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? watts(result.totalWatts) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${amps(result.totalAmps)} at ${voltage} V · ${result.verdict}`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the power strip load breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {detailRows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2 leading-5">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Line by line</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Device
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Qty
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Watts
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Amps
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.activeRows : []).map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{row.qty}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{watts(row.totalWatts)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{amps(row.totalAmps)}</td>
                </tr>
              ))}
              {(!ok || result.activeRows.length === 0) && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Current is watts divided by volts at unity power factor; motors and old transformers draw more than their
        wattage suggests, and a heating element draws a brief surge as it warms. Catalogue wattages are typical
        starting points — the figure on your own label wins. One more thing no calculator can see: a cable reel left
        wound on its drum is de-rated to a small fraction of its unwound rating, so unwind it fully before loading it.
        This is general travel guidance, not an electrical inspection.
      </p>
    </main>
  );
}
