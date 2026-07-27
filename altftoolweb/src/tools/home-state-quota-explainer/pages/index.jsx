"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, RotateCcw } from "lucide-react";

import { SYSTEMS, explainQuota } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATES = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const DEFAULTS = {
  systemId: "josaa-nit",
  candidateState: "Bihar",
  instituteState: "Karnataka",
};

const DASH = "—";

export default function ToolHome() {
  const [systemId, setSystemId] = useState(DEFAULTS.systemId);
  const [candidateState, setCandidateState] = useState(DEFAULTS.candidateState);
  const [instituteState, setInstituteState] = useState(DEFAULTS.instituteState);
  const [copied, setCopied] = useState(false);

  const system = SYSTEMS.find((s) => s.id === systemId) ?? SYSTEMS[0];
  const needsCandidateState = system.basis !== "none";

  const result = useMemo(
    () => explainQuota({ systemId, candidateState, instituteState }),
    [systemId, candidateState, instituteState],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Quota check — ${result.systemLabel}`,
      needsCandidateState ? `Your state (${result.basisLabel}): ${candidateState}` : null,
      `Institute state: ${instituteState}`,
      `You compete under: ${result.quota}`,
      result.detail,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, candidateState, instituteState, needsCandidateState]);

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
    setSystemId(DEFAULTS.systemId);
    setCandidateState(DEFAULTS.candidateState);
    setInstituteState(DEFAULTS.instituteState);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Quota you compete under", DASH],
        ["Home pool share", DASH],
        ["Open/other pool share", DASH],
      ]
    : [
        ["Quota you compete under", result.quota],
        [
          "Home pool share",
          result.homeShare > 0 ? `${result.homeShare}% of seats` : "No home quota",
        ],
        ["Open/other pool share", `${result.otherShare}% of seats`],
        [
          "Home-state status",
          system.basis === "none" ? "Not applicable" : result.isHomeState ? "Yes" : "No",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Counselling quotas
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Home State Quota Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          NITs split seats 50:50 Home State vs Other State on your Class 12 state; IITs have no
          state quota; NEET UG splits 15% All India vs 85% State Quota on domicile. Pick your case
          below.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hsq-system">
              Counselling system
            </label>
            <select
              id="hsq-system"
              className={`mt-2 ${INPUT_CLASS}`}
              value={systemId}
              onChange={(event) => setSystemId(event.target.value)}
            >
              {SYSTEMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {needsCandidateState ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="hsq-candidate">
                Your state ({system.basisLabel})
              </label>
              <select
                id="hsq-candidate"
                className={`mt-2 ${INPUT_CLASS}`}
                value={candidateState}
                onChange={(event) => setCandidateState(event.target.value)}
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="hsq-institute">
              Institute&apos;s state
            </label>
            <select
              id="hsq-institute"
              className={`mt-2 ${INPUT_CLASS}`}
              value={instituteState}
              onChange={(event) => setInstituteState(event.target.value)}
            >
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
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
              You compete under
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.quota}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.detail}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the quota explanation"
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

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.note}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the big systems compare</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  System
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Home pool
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Open/other pool
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Decided by
                </th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{s.label}</td>
                  <td className="py-2 pr-3 font-semibold">
                    {s.homeShare > 0 ? `${s.homeShare}%` : "None"}
                  </td>
                  <td className="py-2 pr-3">{`${s.otherShare}% — ${s.otherLabel}`}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{s.basisLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Informational summary of published counselling rules. State CET shares vary by state and
          year, and deemed/private universities follow their own policies — always verify in the
          current information brochure of your counselling authority.
        </p>
      </section>
    </main>
  );
}
