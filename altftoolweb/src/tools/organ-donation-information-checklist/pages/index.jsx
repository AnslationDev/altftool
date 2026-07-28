"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw } from "lucide-react";

import {
  DONATABLE_ORGANS,
  DONATABLE_TISSUES,
  REGIONS,
  summariseChecklist,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_REGION = "in";
const DEFAULT_CHECKED = ["understand-organs", "understand-system"];

export default function ToolHome() {
  const [regionKey, setRegionKey] = useState(DEFAULT_REGION);
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => summariseChecklist(checked, regionKey), [checked, regionKey]);
  const failed = Boolean(summary.error);

  const toggle = (id) => {
    setChecked((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    setCopied(false);
  };

  const reset = () => {
    setRegionKey(DEFAULT_REGION);
    setChecked(DEFAULT_CHECKED);
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Organ Donation Information Checklist",
      `Region: ${summary.region.label} (${summary.region.system} consent)`,
      `Registry: ${summary.region.registry}`,
      `Progress: ${summary.done} of ${summary.total} steps (${summary.percent}%)`,
      `Status: ${summary.readiness.title} — ${summary.readiness.detail}`,
      "",
    ];
    for (const stage of summary.byStage) {
      lines.push(`${stage.label} (${stage.done}/${stage.total})`);
      for (const item of stage.items) lines.push(`  [${item.checked ? "x" : " "}] ${item.label}`);
      lines.push("");
    }
    if (summary.nextSteps.length > 0) {
      lines.push("Next steps:", ...summary.nextSteps.map((s) => `- ${s}`));
    }
    return lines.join("\n");
  }, [failed, summary]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Health awareness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Organ Donation Information Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two things decide whether a donation wish is followed: an official record and a family who
          knows about it. Pick where you live to see whether consent is opt-in or opt-out there, then
          work through the registration steps and the conversation checklist.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="od-region">
              Where do you live?
            </label>
            <select
              id="od-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regionKey}
              onChange={(event) => {
                setRegionKey(event.target.value);
                setCopied(false);
              }}
            >
              {REGIONS.map((region) => (
                <option key={region.key} value={region.key}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          {!failed && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
              <p className="font-semibold">
                {summary.region.system === "opt-out"
                  ? "Opt-out (deemed consent)"
                  : summary.region.system === "opt-in"
                    ? "Opt-in — you must register"
                    : "Consent rules vary"}
              </p>
              <p className="mt-1 text-[var(--muted-foreground)]">{summary.region.registry}</p>
            </div>
          )}
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {summary.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Checklist complete
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${summary.percent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Choose a region to build the checklist." : `${summary.done} of ${summary.total} steps ticked — ${summary.readiness.title}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the organ donation checklist" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <>
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${summary.percent} percent of the checklist complete`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${summary.percent}%` }} />
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Consent system", summary.region.system === "varies" ? "Varies by country" : summary.region.system],
                ["Official registry", summary.region.registry],
                ["Legal framework", summary.region.law],
                ["Registered with a registry", summary.registered ? "Yes" : "Not yet"],
                ["Next of kin told", summary.familyTold ? "Yes" : "Not yet"],
                ["Steps remaining", String(summary.remaining)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
              <span className="font-semibold">What your family will be asked: </span>
              {summary.region.familyRole}
            </p>
          </>
        )}
      </section>

      {!failed &&
        summary.byStage.map((stage) => (
          <section key={stage.key} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{stage.label}</h2>
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {stage.done}/{stage.total} done
              </span>
            </div>
            <ul className="mt-3 grid gap-2">
              {stage.items.map((item) => (
                <li key={item.id}>
                  <label
                    htmlFor={`od-${item.id}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                  >
                    <input
                      id={`od-${item.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={item.checked}
                      onChange={() => toggle(item.id)}
                    />
                    <span>
                      <span className="font-semibold">
                        {item.label}
                        {item.critical && (
                          <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary-foreground)]">
                            key step
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-[var(--muted-foreground)]">{item.help}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {!failed && summary.nextSteps.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Do these next</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{summary.readiness.detail}</p>
          <ol className="mt-3 grid gap-2 text-sm leading-6">
            {summary.nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What can be donated</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Organs</h3>
            <ul className="mt-2 grid gap-1 text-sm">
              {DONATABLE_ORGANS.map((organ) => (
                <li key={organ} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>{organ}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Tissue</h3>
            <ul className="mt-2 grid gap-1 text-sm">
              {DONATABLE_TISSUES.map((tissue) => (
                <li key={tissue} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />
                  <span>{tissue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is not legal or medical advice, and consent law changes. Nothing is
        submitted anywhere from this page; register through your own national or state transplant
        authority, and speak to a clinician or your registry for anything specific to your situation.
      </p>
    </main>
  );
}
