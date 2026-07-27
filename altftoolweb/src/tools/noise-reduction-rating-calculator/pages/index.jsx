"use client";

import { useMemo, useState } from "react";
import { Check, Copy, EarOff, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DEVICE_TYPES,
  METHODS,
  NIOSH_REL_DBA,
  OSHA_ACTION_LEVEL_DBA,
  OSHA_PEL_DBA,
  RATING_TYPES,
  WEIGHTINGS,
  calculateProtectedLevel,
  compareMethods,
  formatHours,
} from "../lib";

const DEC1 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  measuredLevel: "100",
  weighting: "A",
  rating: "33",
  ratingType: "nrr",
  deviceTypeId: "foam-plug",
  methodId: "osha50",
  dualProtection: false,
  secondRating: "25",
  secondDeviceTypeId: "earmuff",
  exposureHours: "8",
};

export default function ToolHome() {
  const [measuredLevel, setMeasuredLevel] = useState(DEFAULTS.measuredLevel);
  const [weighting, setWeighting] = useState(DEFAULTS.weighting);
  const [rating, setRating] = useState(DEFAULTS.rating);
  const [ratingType, setRatingType] = useState(DEFAULTS.ratingType);
  const [deviceTypeId, setDeviceTypeId] = useState(DEFAULTS.deviceTypeId);
  const [methodId, setMethodId] = useState(DEFAULTS.methodId);
  const [dualProtection, setDualProtection] = useState(DEFAULTS.dualProtection);
  const [secondRating, setSecondRating] = useState(DEFAULTS.secondRating);
  const [secondDeviceTypeId, setSecondDeviceTypeId] = useState(DEFAULTS.secondDeviceTypeId);
  const [exposureHours, setExposureHours] = useState(DEFAULTS.exposureHours);
  const [copied, setCopied] = useState(false);

  const input = useMemo(
    () => ({
      measuredLevel: Number(measuredLevel),
      weighting,
      rating: Number(rating),
      ratingType,
      deviceTypeId,
      dualProtection,
      secondRating: Number(secondRating),
      secondDeviceTypeId,
      exposureHours: Number(exposureHours),
    }),
    [
      measuredLevel,
      weighting,
      rating,
      ratingType,
      deviceTypeId,
      dualProtection,
      secondRating,
      secondDeviceTypeId,
      exposureHours,
    ],
  );

  const result = useMemo(
    () => calculateProtectedLevel({ ...input, methodId }),
    [input, methodId],
  );
  const comparison = useMemo(() => compareMethods(input), [input]);

  const hasError = Boolean(result.error);
  const ratingWord = ratingType === "snr" ? "SNR" : "NRR";

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      `Estimated level at the ear: ${DEC1.format(result.protectedLevel)} dBA`,
      `Measured: ${DEC1.format(result.measuredLevel)} dB${result.weighting}`,
      `Protector: ${result.device.label}, labelled ${result.ratingLabel} ${result.labelledRating} dB${result.dualProtection ? ` + ${result.secondDevice.label}` : ""}`,
      `Method: ${result.method.label}`,
      `Effective attenuation: ${DEC1.format(result.attenuation)} dB`,
      `OSHA permissible time at that level: ${formatHours(result.oshaAllowedHours)} (dose ${result.oshaDosePercent}% for ${result.exposureHours} h)`,
      `NIOSH permissible time at that level: ${formatHours(result.nioshAllowedHours)} (dose ${result.nioshDosePercent}%)`,
      ...result.warnings.map((warning) => `! ${warning}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMeasuredLevel(DEFAULTS.measuredLevel);
    setWeighting(DEFAULTS.weighting);
    setRating(DEFAULTS.rating);
    setRatingType(DEFAULTS.ratingType);
    setDeviceTypeId(DEFAULTS.deviceTypeId);
    setMethodId(DEFAULTS.methodId);
    setDualProtection(DEFAULTS.dualProtection);
    setSecondRating(DEFAULTS.secondRating);
    setSecondDeviceTypeId(DEFAULTS.secondDeviceTypeId);
    setExposureHours(DEFAULTS.exposureHours);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Effective attenuation", DASH],
        [`Rating used after adjustment`, DASH],
        [`OSHA PEL (${OSHA_PEL_DBA} dBA)`, DASH],
        [`OSHA action level (${OSHA_ACTION_LEVEL_DBA} dBA)`, DASH],
        [`NIOSH REL (${NIOSH_REL_DBA} dBA)`, DASH],
        ["OSHA permissible time at that level", DASH],
        ["NIOSH permissible time at that level", DASH],
        ["Estimated daily dose (OSHA / NIOSH)", DASH],
      ]
    : [
        ["Effective attenuation", `${DEC1.format(result.attenuation)} dB`],
        [
          "Rating fed into the formula",
          `${DEC1.format(result.workingNrr)} dB NRR-equivalent`,
        ],
        [`OSHA PEL (${OSHA_PEL_DBA} dBA)`, result.meetsOshaPel ? "Met" : "Not met"],
        [
          `OSHA action level (${OSHA_ACTION_LEVEL_DBA} dBA)`,
          result.meetsOshaActionLevel ? "Met" : "Not met",
        ],
        [`NIOSH REL (${NIOSH_REL_DBA} dBA)`, result.meetsNioshRel ? "Met" : "Not met"],
        ["OSHA permissible time at that level", formatHours(result.oshaAllowedHours)],
        ["NIOSH permissible time at that level", formatHours(result.nioshAllowedHours)],
        [
          "Estimated daily dose (OSHA / NIOSH)",
          `${result.oshaDosePercent}% / ${result.nioshDosePercent}%`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <EarOff className="h-4 w-4" aria-hidden="true" />
          Hearing conservation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Noise Reduction Rating Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn the NRR or SNR on a hearing protector label into a realistic level at the ear.
          Compare the plain OSHA formula, OSHA&apos;s 50% safety factor and the NIOSH device
          derating side by side, including plugs and muffs worn together.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nrr-level">
              Measured noise level (dB)
            </label>
            <input
              id="nrr-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="40"
              max="140"
              step="0.1"
              inputMode="decimal"
              value={measuredLevel}
              onChange={(event) => setMeasuredLevel(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nrr-weighting">
              Meter weighting used
            </label>
            <select
              id="nrr-weighting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weighting}
              onChange={(event) => setWeighting(event.target.value)}
            >
              {WEIGHTINGS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nrr-rating-type">
              Label system
            </label>
            <select
              id="nrr-rating-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratingType}
              onChange={(event) => setRatingType(event.target.value)}
            >
              {RATING_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nrr-rating">
              Labelled {ratingWord} (dB)
            </label>
            <input
              id="nrr-rating"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max={ratingType === "snr" ? 45 : 40}
              step="1"
              inputMode="numeric"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nrr-device">
              Protector type
            </label>
            <select
              id="nrr-device"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deviceTypeId}
              onChange={(event) => setDeviceTypeId(event.target.value)}
            >
              {DEVICE_TYPES.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="nrr-hours">
              Hours in the noise per shift
            </label>
            <input
              id="nrr-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0.1"
              max="24"
              step="0.5"
              inputMode="decimal"
              value={exposureHours}
              onChange={(event) => setExposureHours(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nrr-method">
              Field-adjustment method
            </label>
            <select
              id="nrr-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={methodId}
              onChange={(event) => setMethodId(event.target.value)}
            >
              {METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {(METHODS.find((method) => method.id === methodId) || METHODS[0]).description}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="nrr-dual"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="nrr-dual"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={dualProtection}
                onChange={(event) => setDualProtection(event.target.checked)}
              />
              <span>Dual protection — plugs and muffs worn together</span>
            </label>
          </div>

          {dualProtection ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="nrr-rating-2">
                  Second device {ratingWord} (dB)
                </label>
                <input
                  id="nrr-rating-2"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  max={ratingType === "snr" ? 45 : 40}
                  step="1"
                  inputMode="numeric"
                  value={secondRating}
                  onChange={(event) => setSecondRating(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="nrr-device-2">
                  Second device type
                </label>
                <select
                  id="nrr-device-2"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={secondDeviceTypeId}
                  onChange={(event) => setSecondDeviceTypeId(event.target.value)}
                >
                  {DEVICE_TYPES.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated level at the ear
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${DEC1.format(result.protectedLevel)} dBA`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${DEC1.format(result.measuredLevel)} dB${result.weighting} less ${DEC1.format(result.attenuation)} dB of estimated field attenuation.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the protected level result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && !comparison.error ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <caption className="pb-2 text-left text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Same protector, all three methods
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Method
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Attenuation
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    At the ear
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    OSHA PEL
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2 pr-3 font-medium">
                      {row.label}
                    </th>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {DEC1.format(row.attenuation)} dB
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold">
                      {DEC1.format(row.protectedLevel)} dBA
                    </td>
                    <td
                      className={`py-2 whitespace-nowrap font-semibold ${
                        row.meetsOshaPel ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.meetsOshaPel ? "Met" : "Not met"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Formulas: OSHA Technical Manual III:5 and directive CPL 02-02-035 for the 7 dB
        A-weighting correction and the 50% safety factor; NIOSH Publication 98-126 for the
        25% / 50% / 70% device deratings and the 5 dB dual-protection allowance; 29 CFR
        1910.95 Appendix A (5 dB exchange rate) and NIOSH 98-126 (3 dB exchange rate) for
        permissible durations. These are estimates from label data — they do not replace a
        fit test or a measured personal dosimetry survey.
      </p>
    </main>
  );
}
