"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import { PRESETS, TRACTABILITY_WEIGHTS, TUNE_BANDS, compareEngines } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const fmt = (value, decimals) => {
  if (!Number.isFinite(value)) return "—";
  return (decimals === 0 ? NUM0 : NUM).format(
    decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals)),
  );
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FIELDS = [
  { key: "displacementCc", label: "Displacement (cc)", step: "0.1" },
  { key: "powerPs", label: "Peak power (PS)", step: "0.1" },
  { key: "powerRpm", label: "Peak power rpm", step: "50" },
  { key: "torqueNm", label: "Peak torque (Nm)", step: "0.1" },
  { key: "torqueRpm", label: "Peak torque rpm", step: "50" },
  { key: "kerbWeightKg", label: "Kerb weight (kg)", step: "0.5" },
  { key: "strokeMm", label: "Stroke (mm, optional)", step: "0.1" },
  { key: "cylinders", label: "Cylinders", step: "1" },
];

const specToForm = (preset) => {
  const form = {};
  for (const field of FIELDS) form[field.key] = String(preset[field.key] ?? "");
  return form;
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const formToSpec = (name, form, strokeCycle) => {
  const spec = { name, strokeCycle };
  for (const field of FIELDS) spec[field.key] = toNumber(form[field.key]);
  return spec;
};

const DEFAULT_A = PRESETS.find((preset) => preset.id === "shine");
const DEFAULT_B = PRESETS.find((preset) => preset.id === "classic350");

function EngineCard({ side, presetId, onPreset, name, onName, form, onField, cycle, onCycle }) {
  return (
    <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="text-base font-semibold">Engine {side}</h2>
      <div className="mt-3 grid gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor={`ed-preset-${side}`}>
            Start from a published spec
          </label>
          <select
            id={`ed-preset-${side}`}
            className={`mt-1.5 ${INPUT_CLASS}`}
            value={presetId}
            onChange={(event) => onPreset(event.target.value)}
          >
            <option value="custom">Custom / edited</option>
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`ed-name-${side}`}>
            Label
          </label>
          <input
            id={`ed-name-${side}`}
            className={`mt-1.5 ${INPUT_CLASS}`}
            type="text"
            value={name}
            onChange={(event) => onName(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`ed-${side}-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`ed-${side}-${field.key}`}
                className={`mt-1.5 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={form[field.key]}
                onChange={(event) => onField(field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`ed-cycle-${side}`}>
            Engine cycle
          </label>
          <select
            id={`ed-cycle-${side}`}
            className={`mt-1.5 ${INPUT_CLASS}`}
            value={cycle}
            onChange={(event) => onCycle(event.target.value)}
          >
            <option value="four">Four-stroke</option>
            <option value="two">Two-stroke</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [presetA, setPresetA] = useState(DEFAULT_A.id);
  const [presetB, setPresetB] = useState(DEFAULT_B.id);
  const [nameA, setNameA] = useState(DEFAULT_A.name);
  const [nameB, setNameB] = useState(DEFAULT_B.name);
  const [formA, setFormA] = useState(() => specToForm(DEFAULT_A));
  const [formB, setFormB] = useState(() => specToForm(DEFAULT_B));
  const [cycleA, setCycleA] = useState("four");
  const [cycleB, setCycleB] = useState("four");
  const [copied, setCopied] = useState(false);

  const applyPreset = (id, setPreset, setName, setForm) => {
    setPreset(id);
    const preset = PRESETS.find((entry) => entry.id === id);
    if (!preset) return;
    setName(preset.name);
    setForm(specToForm(preset));
  };

  const result = useMemo(
    () =>
      compareEngines(
        formToSpec(nameA || "Engine A", formA, cycleA),
        formToSpec(nameB || "Engine B", formB, cycleB),
      ),
    [nameA, nameB, formA, formB, cycleA, cycleB],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      `Engine comparison: ${result.a.name} vs ${result.b.name}`,
      `${result.a.name}: ${fmt(result.a.displacementCc, 1)} cc · ${result.a.tune.label}`,
      `${result.b.name}: ${fmt(result.b.displacementCc, 1)} cc · ${result.b.tune.label}`,
      "",
      ...result.rows.map(
        (row) => `${row.label}: ${fmt(row.a, row.decimals)} vs ${fmt(row.b, row.decimals)}`,
      ),
    ];
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
    setPresetA(DEFAULT_A.id);
    setPresetB(DEFAULT_B.id);
    setNameA(DEFAULT_A.name);
    setNameB(DEFAULT_B.name);
    setFormA(specToForm(DEFAULT_A));
    setFormB(specToForm(DEFAULT_B));
    setCycleA("four");
    setCycleB("four");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Engines
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Engine Displacement Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Displacement alone says very little. Put two engines side by side on specific output, brake
          mean effective pressure, power-to-weight, mean piston speed and how early peak torque
          arrives — the figures that actually decide how a bike feels.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <EngineCard
          side="A"
          presetId={presetA}
          onPreset={(id) => applyPreset(id, setPresetA, setNameA, setFormA)}
          name={nameA}
          onName={setNameA}
          form={formA}
          onField={(key, value) => {
            setPresetA("custom");
            setFormA((prev) => ({ ...prev, [key]: value }));
          }}
          cycle={cycleA}
          onCycle={setCycleA}
        />
        <EngineCard
          side="B"
          presetId={presetB}
          onPreset={(id) => applyPreset(id, setPresetB, setNameB, setFormB)}
          name={nameB}
          onName={setNameB}
          form={formB}
          onField={(key, value) => {
            setPresetB("custom");
            setFormB((prev) => ({ ...prev, [key]: value }));
          }}
          cycle={cycleB}
          onCycle={setCycleB}
        />
      </div>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Specific power
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${fmt(result.a.specificPower, 1)} vs ${fmt(result.b.specificPower, 1)}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              PS per litre —{" "}
              {ok
                ? `${result.a.name}: ${result.a.tune.label} · ${result.b.name}: ${result.b.tune.label}`
                : "fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy engine comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset both engines" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Metric</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {ok ? result.a.name : "A"}
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {ok ? result.b.name : "B"}
                </th>
                <th scope="col" className="py-2 text-right font-semibold">B vs A</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${row.winner === "a" ? "text-[var(--success)]" : ""}`}
                    >
                      {fmt(row.a, row.decimals)}
                    </td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${row.winner === "b" ? "text-[var(--success)]" : ""}`}
                    >
                      {fmt(row.b, row.decimals)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {Number.isFinite(row.deltaPct)
                        ? `${row.deltaPct > 0 ? "+" : ""}${fmt(row.deltaPct, 1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Power in kW / bhp",
              ok
                ? `${fmt(result.a.powerKw, 2)} kW (${fmt(result.a.powerBhp, 1)} bhp) vs ${fmt(result.b.powerKw, 2)} kW (${fmt(result.b.powerBhp, 1)} bhp)`
                : "—",
            ],
            [
              "Displacement per cylinder",
              ok
                ? `${fmt(result.a.perCylinderCc, 1)} cc x ${result.a.cylinders} vs ${fmt(result.b.perCylinderCc, 1)} cc x ${result.b.cylinders}`
                : "—",
            ],
            [
              "Tuning band",
              ok ? `${result.a.tune.note} vs ${result.b.tune.note}` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the numbers are derived</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            <strong className="text-[var(--foreground)]">BMEP</strong> = 2&pi; x n<sub>r</sub> x torque
            &divide; swept volume, with n<sub>r</sub> = 2 for a four-stroke. It is the average cylinder
            pressure the engine develops and is the cleanest way to compare tune across sizes.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Mean piston speed</strong> = 2 x stroke x rpm
            &divide; 60. Road engines sit near 12-22 m/s at peak power; higher means more stress.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">City tractability</strong> is a heuristic, not
            physics: {Math.round(TRACTABILITY_WEIGHTS.torqueDensity * 100)}% torque density,{" "}
            {Math.round(TRACTABILITY_WEIGHTS.torqueRpm * 100)}% how early peak torque arrives and{" "}
            {Math.round(TRACTABILITY_WEIGHTS.weight * 100)}% kerb weight.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Tuning bands</strong> (PS per litre):{" "}
            {TUNE_BANDS.map((band) =>
              band.max === Infinity ? `above 160 ${band.label}` : `under ${band.max} ${band.label}`,
            ).join("; ")}
            .
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Preset specifications are manufacturer-published figures and vary by model year and market.
        Edit any field to match the exact variant you are looking at.
      </p>
    </main>
  );
}
