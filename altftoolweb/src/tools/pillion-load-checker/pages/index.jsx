"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";
import {
  DEFAULT_FRONT_KERB_SHARE,
  LOAD_INDEX_KG,
  MAX_PILLION_COUNT,
  MAX_REAR_CONTAINER_KG,
  MIN_FRONT_SHARE,
  checkPillionLoad,
} from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const kg = (value) => (Number.isFinite(value) ? `${N1.format(value)} kg` : "—");
const pct = (value) => (Number.isFinite(value) ? `${N0.format(value)}%` : "—");

const DEFAULTS = {
  kerbWeightKg: "195",
  grossVehicleWeightKg: "340",
  riderKg: "75",
  pillionKg: "65",
  luggageKg: "8",
  topBoxKg: "5",
  rearTyreLoadIndex: "55",
  frontKerbSharePct: String(Math.round(DEFAULT_FRONT_KERB_SHARE * 100)),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LOAD_INDEX_OPTIONS = Object.keys(LOAD_INDEX_KG)
  .map(Number)
  .sort((a, b) => a - b);

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const STATUS_STYLE = {
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

const STATUS_TEXT = {
  ok: "Within limits",
  warning: "Close to the limit",
  danger: "Over a limit",
};

export default function ToolHome() {
  const [kerb, setKerb] = useState(DEFAULTS.kerbWeightKg);
  const [gvw, setGvw] = useState(DEFAULTS.grossVehicleWeightKg);
  const [rider, setRider] = useState(DEFAULTS.riderKg);
  const [pillion, setPillion] = useState(DEFAULTS.pillionKg);
  const [luggage, setLuggage] = useState(DEFAULTS.luggageKg);
  const [topBox, setTopBox] = useState(DEFAULTS.topBoxKg);
  const [loadIndex, setLoadIndex] = useState(DEFAULTS.rearTyreLoadIndex);
  const [frontSharePct, setFrontSharePct] = useState(DEFAULTS.frontKerbSharePct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkPillionLoad({
        kerbWeightKg: toNumber(kerb),
        grossVehicleWeightKg: toNumber(gvw),
        riderKg: toNumber(rider),
        pillionKg: pillion.trim() === "" ? 0 : toNumber(pillion),
        luggageKg: luggage.trim() === "" ? 0 : toNumber(luggage),
        topBoxKg: topBox.trim() === "" ? 0 : toNumber(topBox),
        rearTyreLoadIndex: loadIndex === "" ? undefined : toNumber(loadIndex),
        frontKerbShare: toNumber(frontSharePct) / 100,
      }),
    [kerb, gvw, rider, pillion, luggage, topBox, loadIndex, frontSharePct],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Pillion Load Check",
      `Payload capacity: ${kg(result.payloadCapacity)} (GVW ${kg(result.grossVehicleWeightKg)})`,
      `Load carried: ${kg(result.payloadUsed)} — ${pct(result.payloadUtil)} of capacity`,
      `Headroom left: ${kg(result.payloadRemaining)}`,
      `Total laden weight: ${kg(result.totalLaden)}`,
      `Front axle: ${kg(result.frontAxle)} (${pct(result.frontShare * 100)})`,
      `Rear axle: ${kg(result.rearAxle)}`,
      result.rearTyreCapacityKg
        ? `Rear tyre rated ${result.rearTyreCapacityKg} kg — ${pct(result.rearTyreUtil)} used`
        : "Rear tyre load index not supplied",
      `Verdict: ${STATUS_TEXT[result.status]}`,
      ...result.warnings.map((warning) => `- ${warning.text}`),
    ].join("\n");
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
    setKerb(DEFAULTS.kerbWeightKg);
    setGvw(DEFAULTS.grossVehicleWeightKg);
    setRider(DEFAULTS.riderKg);
    setPillion(DEFAULTS.pillionKg);
    setLuggage(DEFAULTS.luggageKg);
    setTopBox(DEFAULTS.topBoxKg);
    setLoadIndex(DEFAULTS.rearTyreLoadIndex);
    setFrontSharePct(DEFAULTS.frontKerbSharePct);
    setCopied(false);
  };

  const barWidth = ok ? Math.max(0, Math.min(100, result.payloadUtil)) : 0;
  const barColour =
    result.status === "danger"
      ? "bg-[var(--danger)]"
      : result.status === "warning"
        ? "bg-[var(--warning)]"
        : "bg-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Two-up riding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pillion Load Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up rider, pillion and luggage and check the total against two separate limits: the
          payload your bike is registered for, and what the rear tyre's load index will actually
          carry.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-kerb">
              Kerb / unladen weight (kg)
            </label>
            <input
              id="pl-kerb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={kerb}
              onChange={(event) => setKerb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-gvw">
              Gross vehicle weight from RC (kg)
            </label>
            <input
              id="pl-gvw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={gvw}
              onChange={(event) => setGvw(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-rider">
              Rider weight (kg)
            </label>
            <input
              id="pl-rider"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={rider}
              onChange={(event) => setRider(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-pillion">
              Pillion weight (kg)
            </label>
            <input
              id="pl-pillion"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={pillion}
              onChange={(event) => setPillion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-luggage">
              Soft luggage / saddlebags (kg)
            </label>
            <input
              id="pl-luggage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={luggage}
              onChange={(event) => setLuggage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-topbox">
              Rear container / top box contents (kg)
            </label>
            <input
              id="pl-topbox"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={topBox}
              onChange={(event) => setTopBox(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-li">
              Rear tyre load index
            </label>
            <select
              id="pl-li"
              className={`mt-2 ${INPUT_CLASS}`}
              value={loadIndex}
              onChange={(event) => setLoadIndex(event.target.value)}
            >
              <option value="">Not sure / skip</option>
              {LOAD_INDEX_OPTIONS.map((index) => (
                <option key={index} value={index}>
                  {index} — {LOAD_INDEX_KG[index]} kg
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-front">
              Front share of kerb weight (%)
            </label>
            <input
              id="pl-front"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="80"
              step="1"
              value={frontSharePct}
              onChange={(event) => setFrontSharePct(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The load index is the two-digit number after the tyre size, e.g. 100/90-17 <strong>55</strong>P.
          Gross vehicle weight is printed on your registration certificate.
        </p>
      </section>

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
              Payload used
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.payloadUtil) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${kg(result.payloadUsed)} of ${kg(result.payloadCapacity)} allowed`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy pillion load check result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span className={`block h-full rounded-full ${barColour}`} style={{ width: `${barWidth}%` }} />
            </div>
            <p
              className={`mt-3 inline-flex rounded-md px-3 py-2 text-sm font-semibold ${STATUS_STYLE[result.status]}`}
            >
              {STATUS_TEXT[result.status]}
            </p>
          </>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Payload capacity (GVW - kerb)", ok ? kg(result.payloadCapacity) : "—"],
            ["Weight you are carrying", ok ? kg(result.payloadUsed) : "—"],
            ["Headroom left", ok ? kg(result.payloadRemaining) : "—"],
            ["Total laden weight", ok ? kg(result.totalLaden) : "—"],
            [
              "Front axle load",
              ok ? `${kg(result.frontAxle)} (${pct(result.frontShare * 100)})` : "—",
            ],
            ["Rear axle load", ok ? kg(result.rearAxle) : "—"],
            [
              "Rear tyre rated load",
              ok && result.rearTyreCapacityKg ? `${result.rearTyreCapacityKg} kg` : "—",
            ],
            [
              "Rear tyre capacity used",
              ok && Number.isFinite(result.rearTyreUtil) ? pct(result.rearTyreUtil) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to fix</h2>
          <ul className="mt-3 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning.text}
                role={warning.level === "danger" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${STATUS_STYLE[warning.level]}`}
              >
                {warning.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The rules this uses</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Motor Vehicles Act 1988 section 128 and CMVR rule 123 allow a maximum of{" "}
            {MAX_PILLION_COUNT} pillion in addition to the rider on a two-wheeler.
          </li>
          <li>
            MoRTH notification GSR 175(E) caps a fitted rear container at {MAX_REAR_CONTAINER_KG} kg
            and treats a two-wheeler with a container behind the driver's seat as a one-seater.
          </li>
          <li>
            Tyre load index values come from the ISO/ETRTO table — index 41 is 145 kg, index 55 is
            218 kg, index 65 is 290 kg.
          </li>
          <li>
            The front-wheel warning trips below {Math.round(MIN_FRONT_SHARE * 100)}% of total weight
            on the front, where steering feel and front grip fall away.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Axle split is an approximation based on where each mass sits along the wheelbase; your bike's
        actual distribution depends on its geometry and riding position. This is informational — the
        figures on your registration certificate, tyre sidewall and owner's manual take precedence.
      </p>
    </main>
  );
}
