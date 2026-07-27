"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, Info, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DEFAULT_LAP_METRES,
  STANDARDS,
  buildPhysicalTestKit,
  checkPhysicalStandards,
  computeGroundReadiness,
  computeRunPlan,
  formatMargin,
  formatPace,
  fromSeconds,
  toSeconds,
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
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]";

const FLAG_OPTIONS = [
  { key: "exServiceman", label: "Ex-serviceman relaxation claimed" },
  { key: "sportsQuota", label: "Sports quota certificates apply" },
];

const DEFAULT_STANDARD = "sscgd-male-general";

function defaultsFor(standardId) {
  const standard = STANDARDS.find((entry) => entry.id === standardId) || STANDARDS[0];
  const limit = fromSeconds(standard.limitSeconds);
  return {
    distance: String(standard.distanceMetres),
    limitMinutes: String(limit.minutes),
    limitSeconds: String(limit.seconds),
    height: standard.heightCm === null ? "" : String(standard.heightCm),
    chest: standard.chestMinCm === null ? "" : String(standard.chestMinCm),
    chestExpanded: standard.chestExpandedCm === null ? "" : String(standard.chestExpandedCm),
  };
}

export default function ToolHome() {
  const initial = defaultsFor(DEFAULT_STANDARD);

  const [standardId, setStandardId] = useState(DEFAULT_STANDARD);
  const [distance, setDistance] = useState(initial.distance);
  const [limitMinutes, setLimitMinutes] = useState(initial.limitMinutes);
  const [limitSeconds, setLimitSeconds] = useState(initial.limitSeconds);
  const [bestMinutes, setBestMinutes] = useState("25");
  const [bestSeconds, setBestSeconds] = useState("30");
  const [heightCm, setHeightCm] = useState("172");
  const [chestCm, setChestCm] = useState("81");
  const [chestExpandedCm, setChestExpandedCm] = useState("86");
  const [flags, setFlags] = useState({ exServiceman: false, sportsQuota: false });
  const [packedIds, setPackedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const standard = STANDARDS.find((entry) => entry.id === standardId) || STANDARDS[0];
  const isCustom = standard.id === "custom";

  const chooseStandard = (nextId) => {
    setStandardId(nextId);
    const next = defaultsFor(nextId);
    setDistance(next.distance);
    setLimitMinutes(next.limitMinutes);
    setLimitSeconds(next.limitSeconds);
  };

  const run = useMemo(
    () =>
      computeRunPlan({
        distanceMetres: distance === "" ? 0 : Number(distance),
        limitSeconds: toSeconds(limitMinutes, limitSeconds),
        lapMetres: DEFAULT_LAP_METRES,
        currentBestSeconds: toSeconds(bestMinutes, bestSeconds),
      }),
    [distance, limitMinutes, limitSeconds, bestMinutes, bestSeconds],
  );

  const pst = useMemo(
    () =>
      checkPhysicalStandards({
        requiredHeightCm: standard.heightCm,
        requiredChestCm: standard.chestMinCm,
        requiredExpandedCm: standard.chestExpandedCm,
        heightCm: heightCm === "" ? 0 : Number(heightCm),
        chestUnexpandedCm: chestCm === "" ? 0 : Number(chestCm),
        chestExpandedCm: chestExpandedCm === "" ? 0 : Number(chestExpandedCm),
      }),
    [standard, heightCm, chestCm, chestExpandedCm],
  );

  const bundle = useMemo(() => buildPhysicalTestKit(flags), [flags]);
  const readiness = useMemo(() => computeGroundReadiness(bundle, packedIds), [bundle, packedIds]);

  const runError = Boolean(run.error);
  const pstError = Boolean(pst.error);
  const hasStandards = standard.heightCm !== null || standard.chestMinCm !== null;

  const toggleFlag = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const togglePacked = (id) =>
    setPackedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const summary = useMemo(() => {
    if (runError) return "";
    const lines = [
      "Physical Test Day Checklist",
      `Standard: ${standard.label} (${standard.force})`,
      `Run: ${run.distanceMetres} m in ${formatPace(run.limitSeconds)}`,
      `Pace: ${formatPace(run.secondsPerKm)} per km, ${formatPace(run.secondsPerLap)} per ${DEFAULT_LAP_METRES} m lap, ${run.speedKmph} km/h`,
      "",
      "Splits:",
      ...run.splits.map((split) => `${split.metres} m — ${split.cumulativeLabel}`),
    ];
    if (hasStandards && !pstError) {
      lines.push("", "Measurements:");
      pst.checks.forEach((check) => {
        lines.push(`${check.label}: needs ${check.required}, measured ${check.measured}`);
      });
    }
    lines.push("", "To carry:");
    [...bundle.documents, ...bundle.kit].forEach((item) => {
      lines.push(`[${packedIds.includes(item.id) ? "x" : " "}] ${item.label}`);
    });
    return lines.join("\n");
  }, [runError, standard, run, hasStandards, pstError, pst, bundle, packedIds]);

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
    chooseStandard(DEFAULT_STANDARD);
    setBestMinutes("25");
    setBestSeconds("30");
    setHeightCm("172");
    setChestCm("81");
    setChestExpandedCm("86");
    setFlags({ exServiceman: false, sportsQuota: false });
    setPackedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          PET &amp; PST day
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Physical Test Day Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A qualifying time is a pace, not a number. Pick your standard and this gives the split for
          every lap, checks your height and chest against the category figure, and lists what to take
          to a ground that runs from dawn to afternoon.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="ptd-standard">
            Standard you are being tested against
          </label>
          <select
            id="ptd-standard"
            className={`mt-2 ${INPUT_CLASS}`}
            value={standardId}
            onChange={(event) => chooseStandard(event.target.value)}
          >
            {STANDARDS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{standard.force}</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ptd-distance">
              Run distance (metres)
            </label>
            <input
              id="ptd-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="42195"
              step="100"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              readOnly={!isCustom}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>Qualifying time</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="sr-only" htmlFor="ptd-limit-min">
                  Qualifying minutes
                </label>
                <input
                  id="ptd-limit-min"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="240"
                  step="1"
                  value={limitMinutes}
                  onChange={(event) => setLimitMinutes(event.target.value)}
                  readOnly={!isCustom}
                  aria-label="Qualifying time, minutes"
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">minutes</p>
              </div>
              <div>
                <label className="sr-only" htmlFor="ptd-limit-sec">
                  Qualifying seconds
                </label>
                <input
                  id="ptd-limit-sec"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  step="1"
                  value={limitSeconds}
                  onChange={(event) => setLimitSeconds(event.target.value)}
                  readOnly={!isCustom}
                  aria-label="Qualifying time, seconds"
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">seconds</p>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className={LABEL_CLASS}>Your best timed trial so far</span>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:max-w-xs">
              <div>
                <input
                  id="ptd-best-min"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="240"
                  step="1"
                  value={bestMinutes}
                  onChange={(event) => setBestMinutes(event.target.value)}
                  aria-label="Trial time, minutes"
                />
                <label className="mt-1 block text-xs text-[var(--muted-foreground)]" htmlFor="ptd-best-min">
                  minutes
                </label>
              </div>
              <div>
                <input
                  id="ptd-best-sec"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  step="1"
                  value={bestSeconds}
                  onChange={(event) => setBestSeconds(event.target.value)}
                  aria-label="Trial time, seconds"
                />
                <label className="mt-1 block text-xs text-[var(--muted-foreground)]" htmlFor="ptd-best-sec">
                  seconds
                </label>
              </div>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave both at zero if you have not run the distance against a clock yet.
            </p>
          </div>
        </div>
      </section>

      {runError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {run.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pace to hold, per {DEFAULT_LAP_METRES} m lap
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {runError ? DASH : formatPace(run.secondsPerLap)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                runError || !run.tested
                  ? "text-[var(--muted-foreground)]"
                  : run.qualifies
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {runError
                ? "Fix the input above to see the pace."
                : !run.tested
                  ? "Time yourself over the full distance to see how far off you are."
                  : run.qualifies
                    ? `Your trial clears the cut-off by ${formatMargin(run.marginSeconds)}.`
                    : `Your trial is ${run.improvementNeeded} s over the cut-off — ${run.improvementPercent}% to find.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the physical test plan and checklist"
              className={GHOST_BTN}
              disabled={runError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Qualifying time", runError ? DASH : formatPace(run.limitSeconds)],
            ["Per kilometre", runError ? DASH : formatPace(run.secondsPerKm)],
            ["Average speed", runError ? DASH : `${run.speedKmph} km/h`],
            ["Metres per minute", runError ? DASH : String(run.metresPerMinute)],
            ["Laps of 400 m", runError ? DASH : String(run.lapCount)],
            ["Margin on your trial", runError || !run.tested ? DASH : formatMargin(run.marginSeconds)],
            ["Ground bag packed", `${readiness.packed} of ${readiness.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${readiness.percent} percent of the ground bag is packed`}
          >
            <span
              className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
              style={{ width: `${readiness.percent}%` }}
            />
          </div>
        </div>
      </section>

      {!runError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Split table — where you should be, and when</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Lap</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Distance</th>
                  <th scope="col" className="py-2 font-semibold">Clock at that point</th>
                </tr>
              </thead>
              <tbody>
                {run.splits.map((split) => (
                  <tr key={split.lap} className="border-b border-[var(--border)]">
                    <th scope="row" className="py-2.5 pr-3 text-left font-semibold">
                      {split.lap}
                      {split.partial ? " (part)" : ""}
                    </th>
                    <td className="py-2.5 pr-3">{split.metres} m</td>
                    <td className="py-2.5 font-semibold text-[var(--primary)]">{split.cumulativeLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Aim two or three seconds under each split rather than banking a big lead in the first lap.
            Going out fast is the commonest reason a candidate who can hold the pace still misses the
            cut-off.
          </p>
        </section>
      )}

      {hasStandards && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Physical Standard Test</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="ptd-height">
                Your height (cm)
              </label>
              <input
                id="ptd-height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="260"
                step="0.5"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
            {standard.chestMinCm !== null && (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor="ptd-chest">
                    Chest relaxed (cm)
                  </label>
                  <input
                    id="ptd-chest"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="200"
                    step="0.5"
                    value={chestCm}
                    onChange={(event) => setChestCm(event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="ptd-chest-exp">
                    Chest expanded (cm)
                  </label>
                  <input
                    id="ptd-chest-exp"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="200"
                    step="0.5"
                    value={chestExpandedCm}
                    onChange={(event) => setChestExpandedCm(event.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {pstError ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {pst.error}
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {pst.checks.map((check) => (
                <li
                  key={check.id}
                  className={`rounded-lg p-3 ${
                    check.pending
                      ? "border border-[var(--border)] bg-[var(--background)]"
                      : check.pass
                        ? "bg-[var(--success-soft)]"
                        : "bg-[var(--danger-soft)]"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        check.pending
                          ? "text-[var(--foreground)]"
                          : check.pass
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]"
                      }`}
                    >
                      {check.label}
                    </p>
                    <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                      needs {check.required} · measured {check.measured}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      check.pending
                        ? "text-[var(--muted-foreground)]"
                        : check.pass
                          ? "text-[var(--success)]"
                          : "text-[var(--danger)]"
                    }`}
                  >
                    {check.note}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {standard.chestMinCm === null && (
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              No chest measurement is taken for this standard. Weight has to be proportionate to
              height and age under the medical standards for the post.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Anything special?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FLAG_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`ptd-f-${option.key}`}>
                <input
                  id={`ptd-f-${option.key}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={flags[option.key]}
                  onChange={() => toggleFlag(option.key)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <h2 className="mt-6 text-base font-semibold">Documents for the ground</h2>
        <ul className="mt-3 grid gap-3">
          {bundle.documents.map((item) => (
            <li key={item.id}>
              <label className={CHECK_ROW} htmlFor={`ptd-i-${item.id}`}>
                <input
                  id={`ptd-i-${item.id}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={packedIds.includes(item.id)}
                  onChange={() => togglePacked(item.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.detail}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-base font-semibold">Kit</h2>
        <ul className="mt-3 grid gap-3">
          {bundle.kit.map((item) => (
            <li key={item.id}>
              <label className={CHECK_ROW} htmlFor={`ptd-i-${item.id}`}>
                <input
                  id={`ptd-i-${item.id}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={packedIds.includes(item.id)}
                  onChange={() => togglePacked(item.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.detail}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-base font-semibold">Warm-up, finishing 20 minutes before your turn</h2>
        <ul className="mt-3 grid gap-3">
          {bundle.warmUp.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-base font-semibold">What ends attempts</h2>
        <ul className="mt-3 grid gap-3">
          {bundle.avoid.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-lg bg-[var(--danger-soft)] p-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--danger)]">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--danger)]">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not medical advice. Qualifying times, height and chest standards and
        the relaxations attached to them are republished with every notification and differ between
        forces — read the notice for the post you applied to. See a doctor before training hard for a
        timed run, particularly if you have any cardiac, respiratory or joint history.
      </p>
    </main>
  );
}
