"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutTemplate, RotateCcw } from "lucide-react";

import {
  CRITERIA,
  FRAMEWORK_CHOICES,
  GENERATORS,
  PRESETS,
  RATING_LABELS,
  compareGenerators,
  generatorById,
  presetById,
  projectBuildTime,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULT_PRESET = "docs";
const DEFAULT_PROJECTION = {
  generator: "astro",
  pages: "2000",
  msPerPage: String(generatorById("astro").indicativeMsPerPage),
  buildsPerDay: "4",
  fixedSeconds: "45",
};

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weights, setWeights] = useState(() => ({ ...presetById(DEFAULT_PRESET).weights }));
  const [requireDynamic, setRequireDynamic] = useState(false);
  const [framework, setFramework] = useState("any");
  const [projectionGenerator, setProjectionGenerator] = useState(DEFAULT_PROJECTION.generator);
  const [pages, setPages] = useState(DEFAULT_PROJECTION.pages);
  const [msPerPage, setMsPerPage] = useState(DEFAULT_PROJECTION.msPerPage);
  const [buildsPerDay, setBuildsPerDay] = useState(DEFAULT_PROJECTION.buildsPerDay);
  const [fixedSeconds, setFixedSeconds] = useState(DEFAULT_PROJECTION.fixedSeconds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => compareGenerators({ weights, requireDynamic, framework }),
    [weights, requireDynamic, framework],
  );

  const build = useMemo(
    () =>
      projectBuildTime({
        pages: Number(pages),
        msPerPage: Number(msPerPage),
        buildsPerDay: Number(buildsPerDay),
        fixedSeconds: Number(fixedSeconds),
      }),
    [pages, msPerPage, buildsPerDay, fixedSeconds],
  );

  const best = result.error ? null : result.best;

  const summary = useMemo(() => {
    if (!best) return "";
    const lines = [
      "Static site generator comparison",
      `Best fit: ${best.name} — ${NUM.format(best.score)} / 100`,
      `Language: ${best.language}`,
      `Rendering modes: ${best.renderModes.join(", ")}`,
      "",
      "Full ranking:",
      ...result.ranked.map((g, index) => `${index + 1}. ${g.name} — ${NUM.format(g.score)}`),
    ];
    if (!build.error) {
      lines.push(
        "",
        `Build projection: ${INT.format(Number(pages))} pages at ${NUM.format(Number(msPerPage))} ms/page`,
        `Wall clock: ${NUM.format(build.buildMinutes)} min per build`,
        `CI minutes: ${INT.format(build.monthlyMinutes)} per month`,
      );
    }
    return lines.join("\n");
  }, [best, result, build, pages, msPerPage]);

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

  const applyPreset = (id) => {
    const preset = presetById(id);
    if (preset) setWeights({ ...preset.weights });
  };

  const reset = () => {
    setWeights({ ...presetById(DEFAULT_PRESET).weights });
    setRequireDynamic(false);
    setFramework("any");
    setProjectionGenerator(DEFAULT_PROJECTION.generator);
    setPages(DEFAULT_PROJECTION.pages);
    setMsPerPage(DEFAULT_PROJECTION.msPerPage);
    setBuildsPerDay(DEFAULT_PROJECTION.buildsPerDay);
    setFixedSeconds(DEFAULT_PROJECTION.fixedSeconds);
    setCopied(false);
  };

  const onGeneratorChange = (id) => {
    setProjectionGenerator(id);
    const generator = generatorById(id);
    if (generator) setMsPerPage(String(generator.indicativeMsPerPage));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Build tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Static Site Generator Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight what your project actually needs and see how Next.js, Astro, Hugo, Eleventy,
          Gatsby, SvelteKit and Jekyll rank against it, then project build minutes from your own
          per-page measurement.
        </p>
      </header>

      <section className={CARD}>
        <p className={LABEL}>Start from a project type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          {CRITERIA.map((criterion) => (
            <div key={criterion.id}>
              <label className="flex items-center justify-between gap-3" htmlFor={`ssg-${criterion.id}`}>
                <span className="text-sm font-semibold">{criterion.label}</span>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {weights[criterion.id]}
                </span>
              </label>
              <input
                id={`ssg-${criterion.id}`}
                type="range"
                min="0"
                max="5"
                step="1"
                value={weights[criterion.id]}
                onChange={(event) =>
                  setWeights((current) => ({
                    ...current,
                    [criterion.id]: Number(event.target.value),
                  }))
                }
                className="mt-2 h-11 w-full accent-[var(--primary)]"
              />
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{criterion.help}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ssg-framework">
              Component framework you already use
            </label>
            <select
              id="ssg-framework"
              className={INPUT}
              value={framework}
              onChange={(event) => setFramework(event.target.value)}
            >
              {FRAMEWORK_CHOICES.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
              htmlFor="ssg-dynamic"
            >
              <input
                id="ssg-dynamic"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={requireDynamic}
                onChange={(event) => setRequireDynamic(event.target.checked)}
              />
              <span className="text-sm">
                <span className="font-semibold">I need server rendering</span>
                <span className="block text-[var(--muted-foreground)]">
                  SSR, incremental regeneration or server-side form handling.
                </span>
              </span>
            </label>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best fit for these weights
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {best ? best.name : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {best ? `${NUM.format(best.score)} / 100 · ${best.language}` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generator ranking"
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
            <button type="button" onClick={reset} aria-label="Reset all weights" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Runtime", best ? best.runtime : DASH],
            ["Templating", best ? best.templating : DASH],
            ["Rendering modes", best ? best.renderModes.join(", ") : DASH],
            [
              "Component frameworks",
              best ? best.frameworks.filter((f) => f !== "none").join(", ") || "Templates only" : DASH,
            ],
            [
              "Strongest match on",
              best ? best.topDrivers.map((d) => d.label).join(", ") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {best ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {best.note}
          </p>
        ) : null}
      </section>

      {!result.error ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Scores across all generators</h2>
          <ul className="mt-3 space-y-3">
            {result.ranked.map((generator) => (
              <li key={generator.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{generator.name}</span>
                  <span className="font-semibold text-[var(--primary)]">
                    {NUM.format(generator.score)}
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${Math.max(0, Math.min(100, generator.score))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          {result.excluded.length > 0 ? (
            <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
              {result.excluded.map((generator) => (
                <li key={generator.id}>
                  <span className="font-semibold text-[var(--foreground)]">{generator.name}</span>{" "}
                  ruled out — {generator.blocked}.
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Generator
                  </th>
                  {CRITERIA.map((criterion) => (
                    <th key={criterion.id} scope="col" className="py-2 pr-3 text-right font-semibold">
                      {criterion.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GENERATORS.map((generator) => (
                  <tr key={generator.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{generator.name}</td>
                    {CRITERIA.map((criterion) => (
                      <td
                        key={criterion.id}
                        className="py-2 pr-3 text-right text-[var(--muted-foreground)]"
                        title={RATING_LABELS[generator.ratings[criterion.id]]}
                      >
                        {generator.ratings[criterion.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Ratings run 1 (weak) to 5 (excellent) and describe documented capability, not benchmark
            timings.
          </p>
        </section>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Build time and CI minutes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Milliseconds per page is prefilled with an order-of-magnitude starting value. Time one
          real build of your own repository and replace it — images and data fetching usually
          dominate.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ssg-projgen">
              Generator
            </label>
            <select
              id="ssg-projgen"
              className={INPUT}
              value={projectionGenerator}
              onChange={(event) => onGeneratorChange(event.target.value)}
            >
              {GENERATORS.map((generator) => (
                <option key={generator.id} value={generator.id}>
                  {generator.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ssg-ms">
              Milliseconds per page
            </label>
            <input
              id="ssg-ms"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={msPerPage}
              onChange={(event) => setMsPerPage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ssg-pages">
              Pages generated
            </label>
            <input
              id="ssg-pages"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={pages}
              onChange={(event) => setPages(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ssg-builds">
              Builds per day
            </label>
            <input
              id="ssg-builds"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={buildsPerDay}
              onChange={(event) => setBuildsPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ssg-fixed">
              Fixed overhead per build (seconds) — install, cache, upload
            </label>
            <input
              id="ssg-fixed"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={fixedSeconds}
              onChange={(event) => setFixedSeconds(event.target.value)}
            />
          </div>
        </div>

        {build.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {build.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Page rendering time", build.error ? DASH : `${NUM.format(build.renderSeconds)} s`],
            ["Total build wall clock", build.error ? DASH : `${NUM.format(build.buildMinutes)} min`],
            [
              "Fixed overhead share",
              build.error ? DASH : `${NUM.format(build.fixedShare)}%`,
            ],
            [
              "CI minutes per month",
              build.error ? DASH : INT.format(build.monthlyMinutes),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Capabilities change with every major release. Check the current docs before committing a
        team to a generator, especially for projects that are no longer shipping frequent releases.
      </p>
    </main>
  );
}
