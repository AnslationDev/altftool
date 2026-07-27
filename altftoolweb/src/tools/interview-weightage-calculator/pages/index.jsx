"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";
import { WEIGHTAGE_PRESETS, buildInterviewLadder, computeMerit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : "—");

const CUSTOM = "custom";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HELP_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const SEED = {
  "upsc-cse": { written: "850", interview: "180", rivalWritten: "880", rivalInterview: "160" },
  "ibps-po": { written: "150", interview: "70", rivalWritten: "160", rivalInterview: "62" },
  "sbi-po": { written: "160", interview: "32", rivalWritten: "170", rivalInterview: "28" },
};

export default function ToolHome() {
  const initial = WEIGHTAGE_PRESETS[0];
  const [presetKey, setPresetKey] = useState(initial.key);
  const [writtenMax, setWrittenMax] = useState(String(initial.writtenMax));
  const [writtenWeight, setWrittenWeight] = useState(String(initial.writtenWeight));
  const [interviewMax, setInterviewMax] = useState(String(initial.interviewMax));
  const [interviewWeight, setInterviewWeight] = useState(String(initial.interviewWeight));
  const [written, setWritten] = useState(SEED[initial.key].written);
  const [interview, setInterview] = useState(SEED[initial.key].interview);
  const [rivalWritten, setRivalWritten] = useState(SEED[initial.key].rivalWritten);
  const [rivalInterview, setRivalInterview] = useState(SEED[initial.key].rivalInterview);
  const [copied, setCopied] = useState(false);

  const applyPreset = (key) => {
    setPresetKey(key);
    const preset = WEIGHTAGE_PRESETS.find((item) => item.key === key);
    if (preset) {
      setWrittenMax(String(preset.writtenMax));
      setWrittenWeight(String(preset.writtenWeight));
      setInterviewMax(String(preset.interviewMax));
      setInterviewWeight(String(preset.interviewWeight));
      const seed = SEED[preset.key];
      if (seed) {
        setWritten(seed.written);
        setInterview(seed.interview);
        setRivalWritten(seed.rivalWritten);
        setRivalInterview(seed.rivalInterview);
      }
    }
    setCopied(false);
  };

  const editScheme = (setter) => (event) => {
    setPresetKey(CUSTOM);
    setter(event.target.value);
  };

  const input = useMemo(
    () => ({
      writtenScore: toNumber(written),
      writtenMax: toNumber(writtenMax),
      writtenWeight: toNumber(writtenWeight),
      interviewScore: toNumber(interview),
      interviewMax: toNumber(interviewMax),
      interviewWeight: toNumber(interviewWeight),
      rivalWrittenScore: toNumber(rivalWritten),
      rivalInterviewScore: toNumber(rivalInterview),
    }),
    [written, writtenMax, writtenWeight, interview, interviewMax, interviewWeight, rivalWritten, rivalInterview],
  );

  const result = useMemo(() => computeMerit(input), [input]);
  const ladder = useMemo(() => (result.error ? [] : buildInterviewLadder(input)), [input, result.error]);
  const ok = !result.error;
  const preset = presetKey === CUSTOM ? null : WEIGHTAGE_PRESETS.find((item) => item.key === presetKey);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Final merit: ${n(result.merit)} of ${n(result.totalWeight)} (${pct(result.meritPercent)})`,
      `Written ${n(result.writtenScore)}/${n(result.writtenMax)} → ${n(result.writtenPoints)} merit points`,
      `Interview ${n(result.interviewScore)}/${n(result.interviewMax)} → ${n(result.interviewPoints)} merit points`,
      `Interview weight in the scheme: ${pct(result.interviewShareOfMaxPercent)}`,
      `Interview share of your own merit: ${pct(result.interviewShareOfYourMeritPercent)}`,
      `Merit if the interview scored zero: ${n(result.meritIfInterviewZero)}`,
      `Merit with a full interview: ${n(result.meritIfInterviewFull)}`,
      `One interview mark = ${n(result.writtenMarksPerInterviewMark)} written marks`,
      `Whole interview = ${n(result.interviewSwingInWrittenMarks)} written marks`,
      `Comparison candidate merit: ${n(result.rivalMerit)} (${result.aheadOfRival ? "you are ahead" : result.levelWithRival ? "level" : `behind by ${n(result.gapToRival)}`})`,
      result.matchRivalReachable
        ? `Interview marks needed to match them: ${n(result.interviewNeededToMatchRival)} of ${n(result.interviewMax)}`
        : "Matching them is out of reach on the interview alone.",
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

  const reset = () => applyPreset(initial.key);

  const breakdown = [
    ["Written stage percentage", ok ? pct(result.writtenPercent) : "—"],
    ["Interview percentage", ok ? pct(result.interviewPercent) : "—"],
    ["Merit points from the written stage", ok ? n(result.writtenPoints) : "—"],
    ["Merit points from the interview", ok ? n(result.interviewPoints) : "—"],
    ["Interview weight in the scheme", ok ? pct(result.interviewShareOfMaxPercent) : "—"],
    ["Interview share of your own merit", ok ? pct(result.interviewShareOfYourMeritPercent) : "—"],
    ["Merit if the interview scored zero", ok ? n(result.meritIfInterviewZero) : "—"],
    ["Merit with a full interview", ok ? n(result.meritIfInterviewFull) : "—"],
    ["One interview mark, in written marks", ok ? n(result.writtenMarksPerInterviewMark) : "—"],
    ["Whole interview, in written marks", ok ? n(result.interviewSwingInWrittenMarks) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Final merit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Interview Weightage Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Selection exams combine a written stage with an interview at a fixed weightage — 1750 : 275
          at UPSC, 80 : 20 at IBPS PO, 75 : 25 at SBI PO. Enter both scores and see the merit that
          comes out, and how many written marks one interview mark is actually worth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="iw-preset">
          Selection scheme
        </label>
        <select
          id="iw-preset"
          className={`mt-2 ${INPUT_CLASS}`}
          value={presetKey}
          onChange={(event) => applyPreset(event.target.value)}
        >
          {WEIGHTAGE_PRESETS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
          <option value={CUSTOM}>Custom scheme</option>
        </select>
        <p className={HELP_CLASS}>{preset ? preset.note : "Editing a maximum or weight switches to a custom scheme."}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-written">
              {preset ? preset.writtenLabel : "Written score"}
            </label>
            <input
              id="iw-written"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={written}
              onChange={(event) => setWritten(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-interview">
              {preset ? preset.interviewLabel : "Interview score"}
            </label>
            <input
              id="iw-interview"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={interview}
              onChange={(event) => setInterview(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-written-max">
              Written maximum marks
            </label>
            <input
              id="iw-written-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={writtenMax}
              onChange={editScheme(setWrittenMax)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-interview-max">
              Interview maximum marks
            </label>
            <input
              id="iw-interview-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={interviewMax}
              onChange={editScheme(setInterviewMax)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-written-weight">
              Written weight in the final merit
            </label>
            <input
              id="iw-written-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={writtenWeight}
              onChange={editScheme(setWrittenWeight)}
            />
            <p className={HELP_CLASS}>Use 80 for a percentage scheme, or the raw maximum for an aggregate scheme.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-interview-weight">
              Interview weight in the final merit
            </label>
            <input
              id="iw-interview-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={interviewWeight}
              onChange={editScheme(setInterviewWeight)}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Compare against another candidate</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-rival-written">
              Their written score
            </label>
            <input
              id="iw-rival-written"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={rivalWritten}
              onChange={(event) => setRivalWritten(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iw-rival-interview">
              Their interview score
            </label>
            <input
              id="iw-rival-interview"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={rivalInterview}
              onChange={(event) => setRivalInterview(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Final merit score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n(result.merit)} / ${n(result.totalWeight)}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${pct(result.meritPercent)} — written contributes ${n(result.writtenPoints)}, interview ${n(result.interviewPoints)}`
                : "Fix the input above to see a merit score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy final merit calculation"
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

        {ok && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Written contributes ${pct(result.merit > 0 ? 100 - result.interviewShareOfYourMeritPercent : 0)} and the interview ${pct(result.interviewShareOfYourMeritPercent)} of your merit`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{
                  width: `${Math.max(0, Math.min(100, 100 - result.interviewShareOfYourMeritPercent))}%`,
                }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.interviewShareOfYourMeritPercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Written {pct(100 - result.interviewShareOfYourMeritPercent)} · Interview{" "}
              {pct(result.interviewShareOfYourMeritPercent)} of your merit score
            </p>
          </div>
        )}

        {ok && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
              result.aheadOfRival
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : result.levelWithRival
                  ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.aheadOfRival
              ? `Ahead of the comparison candidate (${n(result.rivalMerit)}) by ${n(-result.gapToRival)} merit points.`
              : result.levelWithRival
                ? `Level with the comparison candidate at ${n(result.rivalMerit)} merit points — a tie-breaker would decide.`
                : result.matchRivalReachable
                  ? `Behind by ${n(result.gapToRival)} points. You would need ${n(result.interviewNeededToMatchRival)} of ${n(result.interviewMax)} in the interview to draw level.`
                  : `Behind by ${n(result.gapToRival)} points, which a full interview cannot close.`}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Merit across the interview range</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <caption className="sr-only">Final merit at different interview scores</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Interview</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Merit</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Percent</th>
                <th scope="col" className="py-2 text-right font-semibold">vs now</th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((row) => (
                <tr key={row.fraction} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {n(row.interviewScore)} <span className="font-normal text-[var(--muted-foreground)]">({pct(row.fraction * 100)})</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold">{n(row.merit)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{pct(row.meritPercent)}</td>
                  <td
                    className={`py-2 text-right ${row.deltaFromCurrent >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                  >
                    {signed(row.deltaFromCurrent)}
                  </td>
                </tr>
              ))}
              {ladder.length === 0 && (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Minimum qualifying interview marks, category-wise cut-offs, service
        preference and tie-breaking are set separately by each recruiting body and are not modelled
        here. Confirm the weightage in the notification for your recruitment year.
      </p>
    </main>
  );
}
