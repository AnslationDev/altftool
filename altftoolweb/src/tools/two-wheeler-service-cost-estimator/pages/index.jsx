"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";
import {
  CC_BANDS,
  GST_RATE,
  OIL_GRADE_LABELS,
  OIL_GRADE_PRICES,
  TYPICAL_FREE_SERVICES,
  WORKSHOP_LABELS,
  annualServiceCost,
  estimateServiceCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const km = (value) => (Number.isFinite(value) ? `${KM.format(value)} km` : "—");

const DEFAULTS = {
  engineCc: "150",
  odometerKm: "12000",
  serviceIntervalKm: "3000",
  oilGrade: "semi",
  oilPrice: "",
  workshop: "authorised",
  annualKm: "9000",
  freeService: false,
  liquidCooled: false,
  chainDrive: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [engineCc, setEngineCc] = useState(DEFAULTS.engineCc);
  const [odometerKm, setOdometerKm] = useState(DEFAULTS.odometerKm);
  const [serviceIntervalKm, setServiceIntervalKm] = useState(DEFAULTS.serviceIntervalKm);
  const [oilGrade, setOilGrade] = useState(DEFAULTS.oilGrade);
  const [oilPrice, setOilPrice] = useState(DEFAULTS.oilPrice);
  const [workshop, setWorkshop] = useState(DEFAULTS.workshop);
  const [annualKm, setAnnualKm] = useState(DEFAULTS.annualKm);
  const [freeService, setFreeService] = useState(DEFAULTS.freeService);
  const [liquidCooled, setLiquidCooled] = useState(DEFAULTS.liquidCooled);
  const [chainDrive, setChainDrive] = useState(DEFAULTS.chainDrive);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateServiceCost({
        engineCc: toNumber(engineCc),
        odometerKm: toNumber(odometerKm),
        serviceIntervalKm: toNumber(serviceIntervalKm),
        oilGrade,
        oilPricePerLitre: oilPrice.trim() === "" ? undefined : toNumber(oilPrice),
        workshop,
        freeService,
        liquidCooled,
        chainDrive,
      }),
    [engineCc, odometerKm, serviceIntervalKm, oilGrade, oilPrice, workshop, freeService, liquidCooled, chainDrive],
  );

  const yearly = useMemo(() => {
    if (result.error) return null;
    return annualServiceCost(result.total, toNumber(serviceIntervalKm), toNumber(annualKm));
  }, [result, serviceIntervalKm, annualKm]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Two Wheeler Service Cost Estimate",
      `Engine: ${engineCc} cc (${result.band})`,
      `Odometer: ${km(toNumber(odometerKm))} — service #${result.serviceNumber}`,
      `Workshop: ${WORKSHOP_LABELS[workshop]}${result.freeService ? " (free service, labour waived)" : ""}`,
      "",
      ...result.items.map((item) => `${item.label}: ${money2(item.cost)}`),
      `Consumables and chain lube: ${money2(result.consumables)}`,
      `Labour: ${money2(result.labour)}`,
      `GST @ ${Math.round(GST_RATE * 100)}%: ${money2(result.gst)}`,
      `Estimated bill: ${money(result.total)}`,
    ];
    if (Number.isFinite(yearly)) lines.push(`Approx. yearly servicing: ${money(yearly)}`);
    return lines.join("\n");
  }, [result, engineCc, odometerKm, workshop, yearly]);

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
    setEngineCc(DEFAULTS.engineCc);
    setOdometerKm(DEFAULTS.odometerKm);
    setServiceIntervalKm(DEFAULTS.serviceIntervalKm);
    setOilGrade(DEFAULTS.oilGrade);
    setOilPrice(DEFAULTS.oilPrice);
    setWorkshop(DEFAULTS.workshop);
    setAnnualKm(DEFAULTS.annualKm);
    setFreeService(DEFAULTS.freeService);
    setLiquidCooled(DEFAULTS.liquidCooled);
    setChainDrive(DEFAULTS.chainDrive);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Two wheelers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Two Wheeler Service Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your odometer reading and the estimator works out which wear parts fall due at this
          service, adds engine oil, consumables, labour and 18% GST, and gives you a bill to check
          the workshop estimate against.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-cc">
              Engine capacity (cc)
            </label>
            <input
              id="svc-cc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="50"
              step="1"
              value={engineCc}
              onChange={(event) => setEngineCc(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-odo">
              Odometer at this service (km)
            </label>
            <input
              id="svc-odo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={odometerKm}
              onChange={(event) => setOdometerKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-interval">
              Service interval (km)
            </label>
            <input
              id="svc-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1000"
              max="20000"
              step="500"
              value={serviceIntervalKm}
              onChange={(event) => setServiceIntervalKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-annual">
              Riding per year (km)
            </label>
            <input
              id="svc-annual"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={annualKm}
              onChange={(event) => setAnnualKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-grade">
              Engine oil grade
            </label>
            <select
              id="svc-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              value={oilGrade}
              onChange={(event) => setOilGrade(event.target.value)}
            >
              {Object.keys(OIL_GRADE_PRICES).map((key) => (
                <option key={key} value={key}>
                  {OIL_GRADE_LABELS[key]} (~{INR.format(OIL_GRADE_PRICES[key])}/L)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-oilprice">
              Oil price per litre (optional override)
            </label>
            <input
              id="svc-oilprice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              placeholder={String(OIL_GRADE_PRICES[oilGrade])}
              value={oilPrice}
              onChange={(event) => setOilPrice(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="svc-workshop">
              Workshop type
            </label>
            <select
              id="svc-workshop"
              className={`mt-2 ${INPUT_CLASS}`}
              value={workshop}
              onChange={(event) => setWorkshop(event.target.value)}
            >
              {Object.keys(WORKSHOP_LABELS).map((key) => (
                <option key={key} value={key}>
                  {WORKSHOP_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={CHECK_ROW} htmlFor="svc-free">
            <input
              id="svc-free"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={freeService}
              onChange={(event) => setFreeService(event.target.checked)}
            />
            Free service (labour waived)
          </label>
          <label className={CHECK_ROW} htmlFor="svc-cooled">
            <input
              id="svc-cooled"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={liquidCooled}
              onChange={(event) => setLiquidCooled(event.target.checked)}
            />
            Liquid-cooled engine
          </label>
          <label className={CHECK_ROW} htmlFor="svc-chain">
            <input
              id="svc-chain"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={chainDrive}
              onChange={(event) => setChainDrive(event.target.checked)}
            />
            Chain drive (not a scooter)
          </label>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Most Indian manufacturers include about {TYPICAL_FREE_SERVICES} free labour services with a
          new two-wheeler; spares and oil are still billed.
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
              Estimated service bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.total) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Service #${result.serviceNumber} · ${result.band} · ${WORKSHOP_LABELS[workshop]}`
                : "Fix the inputs above to see an estimate"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy service cost estimate"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Parts and oil", ok ? money2(result.partsSubtotal) : "—"],
            ["Consumables and chain lube", ok ? money2(result.consumables) : "—"],
            [
              "Labour",
              ok ? (result.freeService ? "Free (waived)" : money2(result.labour)) : "—",
            ],
            ["Sub-total before tax", ok ? money2(result.preTax) : "—"],
            [`GST @ ${Math.round(GST_RATE * 100)}%`, ok ? money2(result.gst) : "—"],
            ["Cost per km until next service", ok ? money2(result.perKm) : "—"],
            [
              "Approx. servicing per year",
              ok && Number.isFinite(yearly) ? money(yearly) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What falls due at this service</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Why</th>
                <th scope="col" className="py-2 text-right font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.items.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.reason}</td>
                    <td className="py-2 text-right">{money2(item.cost)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3 font-semibold">—</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">—</td>
                  <td className="py-2 text-right">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Displacement bands used: {CC_BANDS.map((band) => band.label).join(" · ")}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative only. Actual spare-part MRP, oil brand, shop rate and any accident or warranty
        work will change the final invoice — always ask for a written estimate before approving the
        job card.
      </p>
    </main>
  );
}
