"use client";

import { useMemo, useState } from "react";
import { Accessibility, Check, Copy, RotateCcw } from "lucide-react";

import {
  CONFORMANCE_LEVELS,
  CONTENT_TYPES,
  CONVENTIONAL_MAX_ALT_CHARS,
  REVIEW_CADENCES,
  SURFACES,
  buildAltTextPolicy,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium";

const DASH = "—";

const DEFAULT_TYPE_IDS = [
  "informative",
  "decorative",
  "functional",
  "chart",
  "textInImage",
  "logo",
];
const DEFAULT_SURFACE_IDS = ["web", "cms", "social"];

const toggle = (list, id) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

export default function ToolHome() {
  const [orgName, setOrgName] = useState("Northwind Foods");
  const [owner, setOwner] = useState("Head of Design");
  const [level, setLevel] = useState("aa");
  const [cadence, setCadence] = useState("quarterly");
  const [maxChars, setMaxChars] = useState(String(CONVENTIONAL_MAX_ALT_CHARS));
  const [typeIds, setTypeIds] = useState(DEFAULT_TYPE_IDS);
  const [surfaceIds, setSurfaceIds] = useState(DEFAULT_SURFACE_IDS);
  const [blockPublish, setBlockPublish] = useState(true);
  const [imagesPerMonth, setImagesPerMonth] = useState("400");
  const [secondsPerImage, setSecondsPerImage] = useState("90");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAltTextPolicy({
        orgName,
        owner,
        level,
        cadence,
        maxChars: Number(maxChars),
        contentTypeIds: typeIds,
        surfaceIds,
        blockPublish,
        imagesPerMonth: Number(imagesPerMonth),
        secondsPerImage: Number(secondsPerImage),
      }),
    [
      orgName,
      owner,
      level,
      cadence,
      maxChars,
      typeIds,
      surfaceIds,
      blockPublish,
      imagesPerMonth,
      secondsPerImage,
    ],
  );

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrgName("Northwind Foods");
    setOwner("Head of Design");
    setLevel("aa");
    setCadence("quarterly");
    setMaxChars(String(CONVENTIONAL_MAX_ALT_CHARS));
    setTypeIds(DEFAULT_TYPE_IDS);
    setSurfaceIds(DEFAULT_SURFACE_IDS);
    setBlockPublish(true);
    setImagesPerMonth("400");
    setSecondsPerImage("90");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Accessibility className="h-4 w-4" aria-hidden="true" />
          Accessibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Alt Text Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the kinds of image your team publishes and get a written policy: one rule each, the
          WCAG criterion behind it, a sentence pattern, a worked example and a pre-publish checklist.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-org">
              Organisation or team
            </label>
            <input
              id="alt-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-owner">
              Who owns the policy
            </label>
            <input
              id="alt-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-level">
              Conformance target
            </label>
            <select
              id="alt-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              {CONFORMANCE_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-cadence">
              Review cadence
            </label>
            <select
              id="alt-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
            >
              {REVIEW_CADENCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-max">
              House character limit
            </label>
            <input
              id="alt-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="40"
              max="300"
              step="5"
              value={maxChars}
              onChange={(event) => setMaxChars(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-images">
              Images published a month
            </label>
            <input
              id="alt-images"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={imagesPerMonth}
              onChange={(event) => setImagesPerMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-seconds">
              Seconds it takes you to write one
            </label>
            <input
              id="alt-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="3600"
              step="5"
              value={secondsPerImage}
              onChange={(event) => setSecondsPerImage(event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="alt-block">
          <input
            id="alt-block"
            type="checkbox"
            checked={blockPublish}
            onChange={(event) => setBlockPublish(event.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
          />
          <span>Our CMS blocks publishing when a non-decorative image has no alternative</span>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Kinds of image to cover
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CONTENT_TYPES.map((type) => (
              <label key={type.id} className={CHECK_ROW} htmlFor={`type-${type.id}`}>
                <input
                  id={`type-${type.id}`}
                  type="checkbox"
                  checked={typeIds.includes(type.id)}
                  onChange={() => setTypeIds((current) => toggle(current, type.id))}
                  className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                />
                <span>
                  {type.label}
                  <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                    WCAG {type.wcag}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Where the policy applies
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SURFACES.map((surface) => (
              <label key={surface.id} className={CHECK_ROW} htmlFor={`surface-${surface.id}`}>
                <input
                  id={`surface-${surface.id}`}
                  type="checkbox"
                  checked={surfaceIds.includes(surface.id)}
                  onChange={() => setSurfaceIds((current) => toggle(current, surface.id))}
                  className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                />
                <span>{surface.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rules in the policy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Coverage of image types", "Criteria referenced", "Estimated effort"].map(
                (item) => (
                  <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{item}</dt>
                    <dd className="text-right font-semibold">{DASH}</dd>
                  </div>
                ),
              )}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Rules in the policy
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.ruleCount}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  covering {result.coveragePercent}% of the image types this tool knows about, at{" "}
                  {result.conformance.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the policy as markdown"
                  className={GHOST_BTN}
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
                  aria-label="Reset all inputs"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Success criteria referenced", result.criteria.join(", ")],
                ["Surfaces in scope", result.surfaces.map((item) => item.label).join(", ")],
                ["House character limit", `${result.maxChars} characters`],
                ["Review cadence", result.cadence.label],
                [
                  "Estimated authoring effort",
                  `${result.effortHours} hours a month (about ${result.effortDays} working days)`,
                ],
                [
                  "Image types left uncovered",
                  result.gaps.length > 0 ? result.gaps.join(", ") : "None — every type is covered",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Rules by content type</h2>
            <div className="mt-4 space-y-5">
              {result.types.map((type) => (
                <article
                  key={type.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{type.label}</h3>
                    <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                      WCAG {type.wcag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{type.rule}</p>
                  <div className="mt-3 overflow-x-auto">
                    <p className="whitespace-pre rounded-md bg-[var(--muted)] px-3 py-2 text-xs font-semibold">
                      {type.pattern}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Example: {type.example}
                  </p>
                  <p className="mt-1 text-sm text-[var(--danger)]">{type.avoid}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Pre-publish checklist</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.qaChecklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-base font-semibold">Who does what</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {result.roles.map(([role, duty]) => (
                <div key={role} className="py-2.5">
                  <dt className="font-semibold">{role}</dt>
                  <dd className="mt-0.5 text-[var(--muted-foreground)]">{duty}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">The policy as markdown</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5">
                {result.markdown}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A policy documents practice — it is not a conformance claim. WCAG sets no character limit
        for alt text; the limit here is a house convention that keeps short alternatives short and
        pushes complex images towards a proper long description. Have a qualified specialist audit
        the result.
      </p>
    </main>
  );
}
