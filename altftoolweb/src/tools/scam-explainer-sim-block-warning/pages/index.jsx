"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert, Smartphone } from "lucide-react";

import {
  ANATOMY,
  NEVER_HAPPENS,
  OFFICIAL_FACILITIES,
  RED_FLAGS,
  REMOTE_CAPABILITIES,
  SERVICE_AREAS,
  assessCall,
  checkConnectionCount,
  rateRemoteExposure,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35";

const BAND_TEXT = {
  "almost-certain": "text-[var(--danger)]",
  suspicious: "text-[var(--warning)]",
  watch: "text-[var(--warning)]",
  none: "text-[var(--muted-foreground)]",
};
const BAND_LABEL = {
  "almost-certain": "This is the fraud",
  suspicious: "Highly suspicious",
  watch: "Worth ending the call",
  none: "Nothing selected",
};
const LEVEL_LABEL = {
  total: "Total device control",
  high: "High exposure",
  moderate: "Moderate exposure",
  none: "Nothing granted",
};
const LEVEL_TEXT = {
  total: "text-[var(--danger)]",
  high: "text-[var(--danger)]",
  moderate: "text-[var(--warning)]",
  none: "text-[var(--success)]",
};

const DEFAULT_FLAGS = ["press-key", "trai-caller", "two-hours", "aadhaar-claim"];
const DEFAULTS = { connections: "4", unrecognised: "1", area: "general" };

export default function ToolHome() {
  const [flags, setFlags] = useState(() => new Set(DEFAULT_FLAGS));
  const [caps, setCaps] = useState(() => new Set(["view", "control"]));
  const [connections, setConnections] = useState(DEFAULTS.connections);
  const [unrecognised, setUnrecognised] = useState(DEFAULTS.unrecognised);
  const [area, setArea] = useState(DEFAULTS.area);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(() => assessCall({ flagIds: Array.from(flags) }), [flags]);
  const exposure = useMemo(() => rateRemoteExposure({ capabilityIds: Array.from(caps) }), [caps]);
  const simCheck = useMemo(
    () =>
      checkConnectionCount({
        connections: connections.trim() === "" ? NaN : Number(connections),
        unrecognised: unrecognised.trim() === "" ? NaN : Number(unrecognised),
        serviceAreaId: area,
      }),
    [connections, unrecognised, area],
  );

  const toggle = (setter) => (id) =>
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleFlag = toggle(setFlags);
  const toggleCap = toggle(setCaps);

  const summary = useMemo(() => {
    const lines = [
      "SIM Block Warning Call — assessment",
      `Red-flag score: ${assessment.score} of ${assessment.maxScore} (${NUM.format(assessment.percent)}%)`,
      `Verdict: ${BAND_LABEL[assessment.band]} — ${assessment.verdict}`,
    ];
    if (!simCheck.error) {
      lines.push(
        "",
        `Connections held: ${simCheck.connections} of a permitted ${simCheck.limit} in ${simCheck.serviceArea}.`,
        simCheck.action,
      );
    }
    if (!exposure.error && exposure.score > 0) {
      lines.push("", `Remote-access exposure: ${LEVEL_LABEL[exposure.level]} — ${exposure.summary}`);
    }
    lines.push("", "Check your own connections on sancharsaathi.gov.in. Report fraud on 1930.");
    return lines.join("\n");
  }, [assessment, simCheck, exposure]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFlags(new Set(DEFAULT_FLAGS));
    setCaps(new Set(["view", "control"]));
    setConnections(DEFAULTS.connections);
    setUnrecognised(DEFAULTS.unrecognised);
    setArea(DEFAULTS.area);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SIM Block Warning Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          &quot;Your number will be disconnected in two hours — press 9.&quot; Score the call you
          received, see what a remote-access app would hand over, and check your real SIM count
          against the limit the Department of Telecommunications actually sets.
        </p>
      </header>

      <section className={CARD} aria-labelledby="flags-heading">
        <h2 id="flags-heading" className="text-base font-semibold">
          What happened on the call?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weights run from 2 to 4. Four items have no lawful counterpart at all.
        </p>
        <ul className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => {
            const id = `sim-flag-${flag.id}`;
            return (
              <li key={flag.id}>
                <label htmlFor={id} className={CHECK_ROW}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={flags.has(flag.id)}
                    onChange={() => toggleFlag(flag.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="flex-1 leading-6">
                    {flag.label}
                    {flag.decisive ? (
                      <span className="ml-2 rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        decisive
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="verdict-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="verdict-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Red-flag score
            </h2>
            <p className={`mt-1 text-4xl font-semibold ${BAND_TEXT[assessment.band]}`}>
              {assessment.score}
              <span className="text-xl text-[var(--muted-foreground)]"> / {assessment.maxScore}</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${BAND_TEXT[assessment.band]}`}>
              {BAND_LABEL[assessment.band]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the call assessment" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Score is ${NUM.format(assessment.percent)} percent of the maximum`}
        >
          <span
            className={`block h-full ${assessment.band === "almost-certain" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, assessment.percent))}%` }}
          />
        </div>

        <p className="mt-4 text-sm leading-6">{assessment.verdict}</p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Signals matched", `${assessment.matchedCount} of ${assessment.totalFlags}`],
            ["Share of maximum", `${NUM.format(assessment.percent)}%`],
            ["Decisive signals present", String(assessment.decisiveCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="sim-heading">
        <h2 id="sim-heading" className="text-base font-semibold">
          How many SIMs are you actually allowed?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The real ceiling is nine connections per person, and six in the Jammu &amp; Kashmir, Assam
          and North East service areas. The TAFCOP page on Sanchar Saathi lists yours for free.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sim-count">
              Connections listed against your ID
            </label>
            <input
              id="sim-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={connections}
              onChange={(event) => setConnections(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sim-unknown">
              Of those, ones you do not recognise
            </label>
            <input
              id="sim-unknown"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={unrecognised}
              onChange={(event) => setUnrecognised(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sim-area">
              Licensed service area
            </label>
            <select
              id="sim-area"
              className={`mt-2 ${INPUT_CLASS}`}
              value={area}
              onChange={(event) => setArea(event.target.value)}
            >
              {SERVICE_AREAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — limit {item.limit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {simCheck.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {simCheck.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Connections held against the ceiling
          </p>
        )}

        <p
          className={`mt-1 text-3xl font-semibold ${
            simCheck.error
              ? "text-[var(--muted-foreground)]"
              : simCheck.withinLimit
                ? "text-[var(--success)]"
                : "text-[var(--danger)]"
          }`}
        >
          {simCheck.error ? DASH : `${simCheck.connections} / ${simCheck.limit}`}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Service area", simCheck.error ? DASH : simCheck.serviceArea],
            ["Headroom left", simCheck.error ? DASH : String(simCheck.headroom)],
            ["Over the ceiling by", simCheck.error ? DASH : String(simCheck.excess)],
            ["Unrecognised connections", simCheck.error ? DASH : String(simCheck.unrecognised)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!simCheck.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{simCheck.action}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="remote-heading">
        <h2 id="remote-heading" className="text-base font-semibold">
          What the &quot;verification app&quot; actually gets
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick what the app asked for. These tools are legitimate in the right hands — the problem is
          who is on the other end.
        </p>
        <ul className="mt-4 space-y-2">
          {REMOTE_CAPABILITIES.map((item) => {
            const id = `cap-${item.id}`;
            return (
              <li key={item.id}>
                <label htmlFor={id} className={CHECK_ROW}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={caps.has(item.id)}
                    onChange={() => toggleCap(item.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="flex-1 leading-6">{item.label}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Exposure if the session went ahead
        </p>
        <p className={`mt-1 text-3xl font-semibold ${LEVEL_TEXT[exposure.level]}`}>
          {LEVEL_LABEL[exposure.level]}
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Capability score", `${exposure.score} / ${exposure.maxScore}`],
            ["Share of maximum", `${NUM.format(exposure.percent)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{exposure.summary}</p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="anatomy-heading">
        <h2 id="anatomy-heading" className="text-base font-semibold">
          The script, step by step
        </h2>
        <ol className="mt-4 space-y-4">
          {ANATOMY.map((stage) => (
            <li key={stage.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                {stage.step}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{stage.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{stage.detail}</p>
                <p className="mt-1.5 flex gap-2 text-sm leading-6">
                  <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                  <span>{stage.tell}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="never-heading">
        <h2 id="never-heading" className="text-base font-semibold">
          Things that never happen
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {NEVER_HAPPENS.map((line) => (
            <li key={line} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="text-[var(--danger)]">
                &bull;
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="official-heading">
        <h2 id="official-heading" className="text-base font-semibold">
          Where to actually go
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {OFFICIAL_FACILITIES.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{item.name}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Connection ceilings and reporting facilities are set by
        the Department of Telecommunications and can change — confirm current rules on
        sancharsaathi.gov.in. If you have already transferred money or shared an OTP, contact your
        bank and call 1930 straight away.
      </p>
    </main>
  );
}
