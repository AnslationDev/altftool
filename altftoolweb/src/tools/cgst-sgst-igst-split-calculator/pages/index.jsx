"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Split } from "lucide-react";

import { STATE_CODES, computeGstSplit, getState, stateCodeFromGstin } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  supplier: "27",
  destination: "29",
  value: "100000",
  rate: "18",
  cess: "0",
  sez: false,
  exportSupply: false,
  underLut: false,
};

export default function ToolHome() {
  const [supplier, setSupplier] = useState(DEFAULTS.supplier);
  const [destination, setDestination] = useState(DEFAULTS.destination);
  const [value, setValue] = useState(DEFAULTS.value);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [cess, setCess] = useState(DEFAULTS.cess);
  const [sez, setSez] = useState(DEFAULTS.sez);
  const [exportSupply, setExportSupply] = useState(DEFAULTS.exportSupply);
  const [underLut, setUnderLut] = useState(DEFAULTS.underLut);
  const [gstin, setGstin] = useState("");
  const [gstinTarget, setGstinTarget] = useState("supplier");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeGstSplit({
        supplierStateCode: supplier,
        placeOfSupplyStateCode: destination,
        taxableValue: value.trim() === "" ? Number.NaN : Number(value),
        gstRate: rate.trim() === "" ? Number.NaN : Number(rate),
        cessRate: cess.trim() === "" ? 0 : Number(cess),
        sezInvolved: sez,
        exportSupply,
        underLut,
      }),
    [supplier, destination, value, rate, cess, sez, exportSupply, underLut],
  );

  const hasError = Boolean(result.error);

  const gstinState = useMemo(() => {
    const code = stateCodeFromGstin(gstin);
    if (!code) return null;
    const state = getState(code);
    return state ? { code, name: state.name } : { code, name: null };
  }, [gstin]);

  const applyGstin = () => {
    if (!gstinState || !gstinState.name) return;
    if (gstinTarget === "supplier") setSupplier(gstinState.code);
    else setDestination(gstinState.code);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST split",
      `Supplier: ${result.supplier} (${result.supplierCode})`,
      `Place of supply: ${result.destination}${result.destinationCode ? ` (${result.destinationCode})` : ""}`,
      `Supply type: ${result.supplyType}`,
      `Tax head: ${result.taxHead}`,
      `Taxable value: ${money(result.taxableValue)}`,
      result.supplyType === "intra"
        ? `CGST @ ${NUM.format(result.halfRate)}%: ${money(result.cgst)} | ${result.sgstLabel} @ ${NUM.format(result.halfRate)}%: ${money(result.sgst)}`
        : `IGST @ ${NUM.format(result.gstRate)}%: ${money(result.igst)}`,
      ...(result.cessRate > 0 ? [`Compensation cess: ${money(result.cessAmount)}`] : []),
      `Invoice total: ${money(result.invoiceTotal)}`,
      result.reason,
    ].join("\n");
  }, [hasError, result]);

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
    setSupplier(DEFAULTS.supplier);
    setDestination(DEFAULTS.destination);
    setValue(DEFAULTS.value);
    setRate(DEFAULTS.rate);
    setCess(DEFAULTS.cess);
    setSez(DEFAULTS.sez);
    setExportSupply(DEFAULTS.exportSupply);
    setUnderLut(DEFAULTS.underLut);
    setGstin("");
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Taxable value", DASH],
        ["CGST", DASH],
        ["SGST / UTGST", DASH],
        ["IGST", DASH],
        ["Invoice total", DASH],
      ]
    : [
        ["Taxable value", money(result.taxableValue)],
        [`CGST @ ${NUM.format(result.supplyType === "intra" ? result.halfRate : 0)}%`, money(result.cgst)],
        [
          `${result.sgstLabel} @ ${NUM.format(result.supplyType === "intra" ? result.halfRate : 0)}%`,
          money(result.sgst),
        ],
        [
          `IGST @ ${NUM.format(result.supplyType === "intra" ? 0 : result.gstRate)}%`,
          money(result.igst),
        ],
        ...(result.cessRate > 0
          ? [[`Compensation cess @ ${NUM.format(result.cessRate)}%`, money(result.cessAmount)]]
          : []),
        ["Total tax", money(result.totalTax)],
        ["Invoice total", money(result.invoiceTotal)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Split className="h-4 w-4" aria-hidden="true" />
          IGST Act sections 7 and 8
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          CGST SGST IGST Split Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Same state code on both sides means CGST plus SGST; different codes mean IGST. SEZ and
          export supplies are inter-state whatever the codes say. Pick the two states and the
          calculator does the rest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-supplier">
              Supplier state (location of supplier)
            </label>
            <select
              id="sp-supplier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
            >
              {STATE_CODES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code} — {state.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-destination">
              Place of supply state
            </label>
            <select
              id="sp-destination"
              className={`mt-2 ${INPUT_CLASS}`}
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              disabled={exportSupply}
            >
              {STATE_CODES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code} — {state.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-value">
              Taxable value (INR)
            </label>
            <input
              id="sp-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-rate">
              GST rate (%)
            </label>
            <input
              id="sp-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.25"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sp-cess">
              Compensation cess (%), if any
            </label>
            <input
              id="sp-cess"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={cess}
              onChange={(event) => setCess(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-1">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="sp-sez"
          >
            <input
              id="sp-sez"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={sez}
              onChange={(event) => setSez(event.target.checked)}
            />
            Supply to or by an SEZ developer or unit
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="sp-export"
          >
            <input
              id="sp-export"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={exportSupply}
              onChange={(event) => setExportSupply(event.target.checked)}
            />
            Export out of India
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="sp-lut"
          >
            <input
              id="sp-lut"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={underLut}
              onChange={(event) => setUnderLut(event.target.checked)}
            />
            Zero-rated supply made under a letter of undertaking (no tax charged)
          </label>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <label className={LABEL_CLASS} htmlFor="sp-gstin">
            Read the state code from a GSTIN
          </label>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              id="sp-gstin"
              className={INPUT_CLASS}
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="27AAPFU0939F1ZV"
              value={gstin}
              onChange={(event) => setGstin(event.target.value)}
            />
            <select
              className={INPUT_CLASS}
              value={gstinTarget}
              onChange={(event) => setGstinTarget(event.target.value)}
              aria-label="Apply the GSTIN state code to"
            >
              <option value="supplier">as supplier</option>
              <option value="destination">as place of supply</option>
            </select>
            <button
              type="button"
              onClick={applyGstin}
              disabled={!gstinState || !gstinState.name}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              Apply
            </button>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {gstin.trim() === ""
              ? "The first two digits of a GSTIN are the state code."
              : gstinState && gstinState.name
                ? `Code ${gstinState.code} is ${gstinState.name}.`
                : "That does not start with a recognised two-digit state code."}
          </p>
        </div>
      </section>

      {hasError ? (
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
              Total tax on the invoice
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalTax)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the GST split result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.zeroRated ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
            Zero-rated supply under section 16 of the IGST Act.{" "}
            {result.underLut
              ? "Made under a letter of undertaking, so no tax is charged and unutilised input tax credit can be refunded."
              : "Charged with IGST here, which you can claim back as a refund of tax paid on a zero-rated supply."}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, cellValue]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{cellValue}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">GST state codes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Code
                </th>
                <th scope="col" className="py-2 font-semibold">
                  State or union territory
                </th>
              </tr>
            </thead>
            <tbody>
              {STATE_CODES.map((state) => (
                <tr key={state.code} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{state.code}</td>
                  <td className="py-2">{state.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Code 25 (Daman and Diu) merged into code 26 when the union territories were combined, and
          code 28 belonged to undivided Andhra Pradesh — new registrations there use code 37.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The place of supply itself is decided by sections 10 to
        13 of the IGST Act and is not always the buyer&apos;s address — for immovable property,
        events, transport and online services special rules apply. Confirm with your GST
        practitioner before issuing the invoice.
      </p>
    </main>
  );
}
