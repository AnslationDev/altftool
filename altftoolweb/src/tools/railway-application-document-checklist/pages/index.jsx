"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Info, RotateCcw, TrainFront } from "lucide-react";

import {
  CATEGORIES,
  MINORITY_COMMUNITIES,
  RRB_EXAMS,
  buildRrbChecklist,
  computeChecklistProgress,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const FLAG_OPTIONS = [
  { key: "female", label: "Woman candidate" },
  { key: "transgender", label: "Transgender candidate" },
  { key: "pwbd", label: "Person with benchmark disability" },
  { key: "needsScribe", label: "A scribe will be requested" },
  { key: "exServiceman", label: "Ex-serviceman" },
  { key: "minority", label: "Notified minority community" },
  { key: "ebc", label: "Economically Backward Class" },
  { key: "appearsInCbt1", label: "I will actually appear in CBT-1" },
];

const DEFAULT_FLAGS = {
  female: false,
  transgender: false,
  pwbd: false,
  needsScribe: false,
  exServiceman: false,
  minority: false,
  ebc: false,
  appearsInCbt1: true,
};

const DEFAULTS = { examId: "group-d", categoryId: "ur", applications: "1" };

export default function ToolHome() {
  const [examId, setExamId] = useState(DEFAULTS.examId);
  const [categoryId, setCategoryId] = useState(DEFAULTS.categoryId);
  const [applications, setApplications] = useState(DEFAULTS.applications);
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [doneIds, setDoneIds] = useState([]);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  const toggleFlag = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const toggleDone = (id) =>
    setDoneIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildRrbChecklist({
        examId,
        categoryId,
        applications: applications === "" ? 0 : Number(applications),
        ...flags,
      }),
    [examId, categoryId, applications, flags],
  );

  const hasError = Boolean(result.error);

  const progress = useMemo(
    () => computeChecklistProgress(hasError ? [] : result.checklist, doneIds),
    [hasError, result, doneIds],
  );

  const groups = useMemo(() => {
    if (hasError) return [];
    const map = new Map();
    result.checklist.forEach((item) => {
      const key = item.group || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map, ([name, items]) => ({ name, items }));
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Railway Application Checklist — ${result.exam.label}`,
      `Community: ${result.category.label}`,
      `Applications: ${result.fee.applications}`,
      `Fee paid: ${result.fee.feeTotal} | Refund on CBT-1: ${result.fee.refundTotal} | Net: ${result.fee.netTotal}`,
      result.fee.concession
        ? `Concession claimed on: ${result.fee.reasons.join(", ")}`
        : "Standard fee bracket — no concession ground ticked.",
      "",
      "Checklist:",
    ];
    groups.forEach((group) => {
      lines.push(`-- ${group.name} --`);
      group.items.forEach((item) =>
        lines.push(`[${doneIds.includes(item.id) ? "x" : " "}] ${item.label}`),
      );
    });
    return lines.join("\n");
  }, [hasError, result, groups, doneIds]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setExamId(DEFAULTS.examId);
    setCategoryId(DEFAULTS.categoryId);
    setApplications(DEFAULTS.applications);
    setFlags(DEFAULT_FLAGS);
    setDoneIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrainFront className="h-4 w-4" aria-hidden="true" />
          RRB CEN
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Railway Application Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every field the RRB form asks for, the upload limits on the photograph and signature, the
          certificates your post group needs — and what the fee costs once the CBT-1 refund is taken
          into account.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-exam">
              Post group
            </label>
            <select
              id="rrb-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examId}
              onChange={(event) => setExamId(event.target.value)}
            >
              {RRB_EXAMS.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.label}
                </option>
              ))}
            </select>
            {!hasError && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {result.exam.qualification}
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-category">
              Community claimed
            </label>
            <select
              id="rrb-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-apps">
              Number of CENs you are applying to
            </label>
            <input
              id="rrb-apps"
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={applications}
              onChange={(event) => setApplications(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              One application per CEN only — this counts separate notifications, not separate RRBs.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these apply?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FLAG_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`rrb-f-${option.key}`}>
                <input
                  id={`rrb-f-${option.key}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={flags[option.key]}
                  onChange={() => toggleFlag(option.key)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Notified minority communities: {MINORITY_COMMUNITIES.join(", ")}.
          </p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              What the fee really costs you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.fee.netTotal)}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the figures."
                : result.fee.concession
                  ? `Concession bracket — ${result.fee.reasons.join(", ")}`
                  : "Standard bracket — no concession ground applies"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the railway application checklist"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            ["Fee per application", hasError ? DASH : money(result.fee.feeEach)],
            ["Refund per application on appearing", hasError ? DASH : money(result.fee.refundEach)],
            ["Applications", hasError ? DASH : String(result.fee.applications)],
            ["Total paid at submission", hasError ? DASH : money(result.fee.feeTotal)],
            ["Total refunded after CBT-1", hasError ? DASH : money(result.fee.refundTotal)],
            ["Checklist items done", hasError ? DASH : `${progress.done} of ${progress.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4" aria-live="polite" aria-atomic="true">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${progress.percent} percent of the checklist is done`}
            >
              <span
                className={`block h-full ${progress.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {progress.percent}% of the file is ready. Refunds are paid net of bank charges, to the
              account entered on the form.
            </p>
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Uploads you need</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-semibold">Upload</th>
                  <th className="py-2 pr-3 font-semibold">Spec</th>
                  <th className="py-2 font-semibold">File</th>
                </tr>
              </thead>
              <tbody>
                {result.uploads.map((spec) => (
                  <tr key={spec.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{spec.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {spec.detail}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{spec.size}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      {spec.format}, {spec.fileSize}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Read before you submit</h2>
          <ul className="mt-3 grid gap-3">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <p className="min-w-0 text-sm leading-6">{warning}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError &&
        groups.map((group) => (
          <section
            key={group.name}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.name}</h2>
            <ul className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <label className={CHECK_ROW} htmlFor={`rrb-i-${item.id}`}>
                    <input
                      id={`rrb-i-${item.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={doneIds.includes(item.id)}
                      onChange={() => toggleDone(item.id)}
                    />
                    <span className="min-w-0">
                      {item.label}
                      {item.required === false && (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                          note, not a document
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Fees, refund rules, upload dimensions, age bands and qualifications are
        restated in every Centralised Employment Notice and do change between cycles — read the CEN
        you are applying under and follow its wording.
      </p>
    </main>
  );
}
