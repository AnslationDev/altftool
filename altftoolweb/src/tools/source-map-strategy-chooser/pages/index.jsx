"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Map, RotateCcw } from "lucide-react";

import {
  DEVTOOL_OPTIONS,
  ENVIRONMENTS,
  PRIORITIES,
  QUALITY_SCALE,
  SPEED_SCALE,
  chooseSourceMapStrategy,
  toBundlerConfig,
} from "../lib";

const DEFAULTS = {
  environment: "development",
  priority: "balanced",
  allowPublicSource: false,
  useErrorTracker: false,
  sizeSensitive: true,
};

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5";

const DASH = "—";

export default function ToolHome() {
  const [environment, setEnvironment] = useState(DEFAULTS.environment);
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [allowPublicSource, setAllowPublicSource] = useState(DEFAULTS.allowPublicSource);
  const [useErrorTracker, setUseErrorTracker] = useState(DEFAULTS.useErrorTracker);
  const [sizeSensitive, setSizeSensitive] = useState(DEFAULTS.sizeSensitive);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      chooseSourceMapStrategy({
        environment,
        priority,
        allowPublicSource,
        useErrorTracker,
        sizeSensitive,
      }),
    [environment, priority, allowPublicSource, useErrorTracker, sizeSensitive],
  );

  const isProd = environment === "production";
  const best = result.error ? null : result.recommended;
  const configs = useMemo(() => (best ? toBundlerConfig(best) : null), [best]);

  const summary = useMemo(() => {
    if (!best || !configs) return "";
    return [
      "Source map strategy",
      `Build: ${isProd ? "production" : "development"}`,
      `Priority: ${PRIORITIES.find((p) => p.id === priority)?.label ?? priority}`,
      `Recommended devtool: ${best.devtool}`,
      `Fit score: ${best.score} / 100`,
      `Mapping quality: ${QUALITY_SCALE[best.quality]}`,
      `Build speed: ${SPEED_SCALE[best.buildSpeed]} · Rebuild: ${SPEED_SCALE[best.rebuildSpeed]}`,
      "",
      configs.webpack,
      "",
      configs.vite,
    ].join("\n");
  }, [best, configs, isProd, priority]);

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
    setEnvironment(DEFAULTS.environment);
    setPriority(DEFAULTS.priority);
    setAllowPublicSource(DEFAULTS.allowPublicSource);
    setUseErrorTracker(DEFAULTS.useErrorTracker);
    setSizeSensitive(DEFAULTS.sizeSensitive);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Map className="h-4 w-4" aria-hidden="true" />
          Build tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Source Map Strategy Chooser
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every webpack <code className="font-mono">devtool</code> value trades build time against
          how far a stack trace can reach back into your source. Describe the build and get the
          value that fits, plus the equivalent Vite, esbuild and Next.js setting.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="smsc-env">
              Which build is this?
            </label>
            <select
              id="smsc-env"
              className={SELECT}
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
            >
              {ENVIRONMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="smsc-priority">
              What matters most?
            </label>
            <select
              id="smsc-priority"
              className={SELECT}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {PRIORITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="smsc-tracker">
            <input
              id="smsc-tracker"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
              checked={useErrorTracker}
              onChange={(event) => setUseErrorTracker(event.target.checked)}
            />
            <span className="text-sm">
              <span className="font-semibold">I upload maps to an error tracker</span>
              <span className="block text-[var(--muted-foreground)]">
                Sentry, Rollbar, Bugsnag or Datadog symbolicating production stack traces.
              </span>
            </span>
          </label>

          {isProd ? (
            <>
              <label className={CHECK_ROW} htmlFor="smsc-public">
                <input
                  id="smsc-public"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={allowPublicSource}
                  onChange={(event) => setAllowPublicSource(event.target.checked)}
                />
                <span className="text-sm">
                  <span className="font-semibold">My source can be public</span>
                  <span className="block text-[var(--muted-foreground)]">
                    Open source, or you accept that anyone can read the original files in devtools.
                  </span>
                </span>
              </label>
              <label className={CHECK_ROW} htmlFor="smsc-size">
                <input
                  id="smsc-size"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={sizeSensitive}
                  onChange={(event) => setSizeSensitive(event.target.checked)}
                />
                <span className="text-sm">
                  <span className="font-semibold">Shipped bundle size matters</span>
                  <span className="block text-[var(--muted-foreground)]">
                    Penalises inline maps, which base64-embed the whole map in the bundle.
                  </span>
                </span>
              </label>
            </>
          ) : (
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">
              Source exposure and bundle size only affect production builds, so those questions
              appear once you switch the build above.
            </p>
          )}
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended devtool
            </p>
            <p className="mt-1 break-words font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {best ? best.devtool : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {best ? `Fit score ${best.score} / 100` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommended source map configuration"
              className={GHOST_BTN}
              disabled={!best}
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
              aria-label="Reset all choices"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Mapping quality", best ? QUALITY_SCALE[best.quality] : DASH],
            ["First build speed", best ? SPEED_SCALE[best.buildSpeed] : DASH],
            ["Rebuild speed (watch mode)", best ? SPEED_SCALE[best.rebuildSpeed] : DASH],
            ["Separate .map file", best ? (best.emitsFile ? "Yes" : "No") : DASH],
            [
              "Referenced from the bundle",
              best ? (best.referenced ? "Yes, browsers fetch it" : "No") : DASH,
            ],
            [
              "Readable source for visitors",
              best ? (best.exposesSource ? "Yes" : "No") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {best ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {best.note}
          </p>
        ) : null}

        {best && best.reasons.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {best.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {configs ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Config for your bundler</h2>
          <div className="mt-3 grid gap-3">
            {[
              ["webpack.config.js", configs.webpack],
              ["vite.config.js", configs.vite],
              ["esbuild", configs.esbuild],
              ["next.config.js", configs.nextjs],
            ].map(([title, code]) => (
              <div key={title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {title}
                </p>
                <div className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <pre className="font-mono text-xs leading-5">{code}</pre>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Vite and Rollup expose fewer levels than webpack, so the nearest equivalent is shown.
            Next.js only toggles browser source maps on or off for production.
          </p>
        </section>
      ) : null}

      {!result.error ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Every candidate, ranked</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    devtool
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Score
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Build
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Rebuild
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Quality
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((option) => (
                  <tr key={option.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs">{option.devtool}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{option.score}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {SPEED_SCALE[option.buildSpeed]}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {SPEED_SCALE[option.rebuildSpeed]}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {QUALITY_SCALE[option.quality]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.excluded.length > 0 ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--primary)]">
                {result.excluded.length} of {DEVTOOL_OPTIONS.length} ruled out for this build
              </summary>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
                {result.excluded.map((option) => (
                  <li key={option.id}>
                    <span className="font-mono text-xs text-[var(--foreground)]">
                      {option.devtool}
                    </span>{" "}
                    {option.blocked}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Speed and quality ratings come from webpack&apos;s own devtool reference table. A hidden or
        nosources map still has to be kept out of your deploy artefact — generating it is only half
        the job.
      </p>
    </main>
  );
}
