"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mountain, RotateCcw, TriangleAlert } from "lucide-react";

import {
  PASSPORT_VALIDITY_MONTHS,
  ROUTES,
  SDF_INTERNATIONAL_USD_PER_NIGHT,
  buildBhutanChecklist,
  computeReadiness,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const DEFAULTS = {
  routeId: "international",
  entryDate: "2026-10-15",
  passportExpiry: "2029-01-01",
  nights: "5",
  adults: "2",
  children6to11: "0",
  childrenUnder6: "0",
  waivedNights: "0",
  travellingOutsideThimphuParo: true,
  trekking: false,
};

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const inrFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (currency, value) =>
  currency === "INR" ? inrFormat.format(value) : usdFormat.format(value);

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [haveIds, setHaveIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const changeRoute = (routeId) => {
    setForm((current) => ({ ...current, routeId }));
    setHaveIds([]);
  };

  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildBhutanChecklist({
        routeId: form.routeId,
        entryDate: form.entryDate,
        passportExpiry: form.passportExpiry,
        nights: form.nights === "" ? Number.NaN : Number(form.nights),
        adults: form.adults === "" ? 0 : Number(form.adults),
        children6to11: form.children6to11 === "" ? 0 : Number(form.children6to11),
        childrenUnder6: form.childrenUnder6 === "" ? 0 : Number(form.childrenUnder6),
        waivedNights: form.waivedNights === "" ? 0 : Number(form.waivedNights),
        travellingOutsideThimphuParo: form.travellingOutsideThimphuParo,
        trekking: form.trekking,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const readiness = useMemo(
    () => computeReadiness(hasError ? [] : result.documents, haveIds),
    [hasError, result, haveIds],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const cur = result.currency;
    return [
      "Bhutan Entry Requirement Checklist",
      `Route: ${result.route.label}`,
      `Entry: ${result.entryDate}  |  Nights: ${result.nights} (chargeable ${result.chargeableNights})`,
      `Party: ${result.adults} aged 12+, ${result.children6to11} aged 6-11, ${result.childrenUnder6} under 6`,
      `SDF at ${money(cur, result.sdfRatePerNight)} per person per night: ${money(cur, result.sdfTotal)}`,
      `Visa application fee: ${money(cur, result.visaFeeTotal)}`,
      `Government charges total: ${money(cur, result.grandTotal)}`,
      `Travel document must stay valid to ${result.passportMustBeValidUntil} (yours: ${result.passportExpiry})`,
      `Readiness: ${readiness.have} of ${readiness.total} required items (${readiness.percent}%)`,
      "",
      ...result.warnings.map((warning) => `! ${warning}`),
      result.warnings.length ? "" : null,
      "Required:",
      ...result.requiredDocuments.map(
        (doc) => `[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`,
      ),
      "",
      "Worth carrying:",
      ...result.optionalDocuments.map((doc) => `[ ] ${doc.label}`),
    ]
      .filter((line) => line !== null)
      .join("\n");
  }, [hasError, result, readiness, haveIds]);

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
    setForm(DEFAULTS);
    setHaveIds([]);
    setCopied(false);
  };

  const chosenRoute = ROUTES.find((entry) => entry.id === form.routeId);
  const currency = hasError ? (chosenRoute ? chosenRoute.currency : "USD") : result.currency;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Mountain className="h-4 w-4" aria-hidden="true" />
          Entry rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Bhutan Entry Requirement Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The cost of a Bhutan trip is set in law, not by a tour price list: the Sustainable
          Development Fee is charged on every night you halt in the country, currently USD{" "}
          {SDF_INTERNATIONAL_USD_PER_NIGHT} per person per night for international visitors and Nu.
          1,200 for Indian nationals. Price your party, test the passport rule and build the file.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bt-route">
              Which route applies to you
            </label>
            <select
              id="bt-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.routeId}
              onChange={(event) => changeRoute(event.target.value)}
            >
              {ROUTES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {chosenRoute ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{chosenRoute.note}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bt-entry">
              Date of entry
            </label>
            <input
              id="bt-entry"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.entryDate}
              onChange={(event) => setField("entryDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-passport">
              Travel document expiry
            </label>
            <input
              id="bt-passport"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.passportExpiry}
              onChange={(event) => setField("passportExpiry", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-nights">
              Nights in Bhutan
            </label>
            <input
              id="bt-nights"
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.nights}
              onChange={(event) => setField("nights", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-waived">
              Nights waived by a current incentive (0 if none)
            </label>
            <input
              id="bt-waived"
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.waivedNights}
              onChange={(event) => setField("waivedNights", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-adults">
              Travellers aged 12 and over
            </label>
            <input
              id="bt-adults"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.adults}
              onChange={(event) => setField("adults", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-mid">
              Children aged 6 to 11 (half SDF)
            </label>
            <input
              id="bt-mid"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.children6to11}
              onChange={(event) => setField("children6to11", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bt-infant">
              Children under 6 (no SDF)
            </label>
            <input
              id="bt-infant"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.childrenUnder6}
              onChange={(event) => setField("childrenUnder6", event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Your itinerary</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="bt-outside">
              <input
                id="bt-outside"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.travellingOutsideThimphuParo}
                onChange={() =>
                  setField("travellingOutsideThimphuParo", !form.travellingOutsideThimphuParo)
                }
              />
              <span>Travelling beyond Thimphu and Paro</span>
            </label>
            <label className={CHECK_ROW} htmlFor="bt-trek">
              <input
                id="bt-trek"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.trekking}
                onChange={() => setField("trekking", !form.trekking)}
              />
              <span>Trekking or visiting a restricted area</span>
            </label>
          </div>
        </fieldset>
      </section>

      {hasError ? (
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
              Government charges for the party
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(currency, result.grandTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the cost and the checklist."
                : `SDF plus visa fee, before flights and hotels — ${readiness.have} of ${readiness.total} documents ready`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Bhutan entry checklist and cost"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${readiness.percent} percent of the required items are ready`}
            >
              <span
                className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${readiness.percent}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "SDF rate per person per night",
              hasError ? DASH : money(currency, result.sdfRatePerNight),
            ],
            [
              "Chargeable nights",
              hasError ? DASH : `${result.chargeableNights} of ${result.nights}`,
            ],
            ["SDF for travellers aged 12+", hasError ? DASH : money(currency, result.sdfAdults)],
            ["SDF for children 6 to 11", hasError ? DASH : money(currency, result.sdfChildren)],
            ["SDF total", hasError ? DASH : money(currency, result.sdfTotal)],
            ["Visa application fee", hasError ? DASH : money(currency, result.visaFeeTotal)],
            [
              `Document valid to (${PASSPORT_VALIDITY_MONTHS}-month rule)`,
              hasError ? DASH : result.passportMustBeValidUntil,
            ],
            [
              "Document check",
              hasError
                ? DASH
                : result.passportOk
                  ? "Passes"
                  : `Short by ${result.passportShortfallDays} day(s)`,
            ],
            ["Licensed guide needed", hasError ? DASH : result.needsGuide ? "Yes" : "Not required"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.verdict}
          </p>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Worth knowing before you pay</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--muted-foreground)]">{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Required</h2>
          <ul className="mt-3 grid gap-3">
            {result.requiredDocuments.map((doc) => (
              <li key={doc.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  htmlFor={`bt-d-${doc.id}`}
                >
                  <input
                    id={`bt-d-${doc.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={haveIds.includes(doc.id)}
                    onChange={() => toggleHave(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{doc.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {result.optionalDocuments.length > 0 && (
            <>
              <h2 className="mt-6 text-base font-semibold">Worth carrying</h2>
              <ul className="mt-3 grid gap-3">
                {result.optionalDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-sm font-semibold">{doc.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not immigration advice. The Sustainable Development Fee is levied under
        the Tourism Levy Act of Bhutan, 2022; the reduced rate in force since September 2023 and any
        incentive waivers are set by government notification and can change. Confirm the current
        rate, the visa fee and the guide rules with Bhutan&apos;s Department of Tourism and
        Department of Immigration before booking.
      </p>
    </main>
  );
}
