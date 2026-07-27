"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  MAX_DURATION_SECONDS,
  MAX_VARIANTS,
  MIN_DURATION_SECONDS,
  MIN_VARIANTS,
  PLATFORMS,
  STRUCTURES,
  buildUgcBrief,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  productName: "Monsoon Roast coffee",
  audience: "Urban coffee drinkers aged 25-40 who already own a grinder",
  keyMessage: "Tastes like a cafe pour-over without buying one",
  ctaText: "Tap shop now and use the pack code inside",
  structureId: "problem-solution",
  platformId: "meta-reels",
  durationSeconds: "30",
  hookVariants: "3",
  ctaVariants: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [keyMessage, setKeyMessage] = useState(DEFAULTS.keyMessage);
  const [ctaText, setCtaText] = useState(DEFAULTS.ctaText);
  const [structureId, setStructureId] = useState(DEFAULTS.structureId);
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [durationSeconds, setDurationSeconds] = useState(DEFAULTS.durationSeconds);
  const [hookVariants, setHookVariants] = useState(DEFAULTS.hookVariants);
  const [ctaVariants, setCtaVariants] = useState(DEFAULTS.ctaVariants);
  const [copied, setCopied] = useState(false);

  const brief = useMemo(
    () =>
      buildUgcBrief({
        productName,
        audience,
        keyMessage,
        ctaText,
        structureId,
        platformId,
        durationSeconds: Number(durationSeconds),
        hookVariants: Number(hookVariants),
        ctaVariants: Number(ctaVariants),
      }),
    [
      productName,
      audience,
      keyMessage,
      ctaText,
      structureId,
      platformId,
      durationSeconds,
      hookVariants,
      ctaVariants,
    ],
  );

  const hasError = Boolean(brief.error);

  const briefText = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `UGC BRIEF — ${brief.product}`,
      `${brief.structure.label} · ${brief.durationSeconds}s · ${brief.platform.label}`,
      "",
      `Audience: ${brief.audience || "—"}`,
      `Key message: ${brief.keyMessage || "—"}`,
      `Call to action: ${brief.ctaText || "—"}`,
      "",
      "SHOT LIST",
      ...brief.shotList.map(
        (scene) =>
          `${scene.start}-${scene.end}s  ${scene.label} (${scene.words} words max) — ${scene.direction} | On screen: ${scene.onScreen}`,
      ),
      "",
      "DELIVERY SPEC",
      `${brief.platform.ratio}, ${brief.platform.resolution}, ${brief.platform.fps}`,
      brief.platform.codec,
      `Max file: ${brief.platform.maxFile}`,
      brief.platform.safeZone,
      `Deliver ${brief.totalCuts} cut(s): ${brief.hookVariants} hook x ${brief.ctaVariants} CTA, plus all raw footage.`,
      "",
      "DO",
      ...brief.dos.map((line) => `- ${line}`),
      "",
      "DO NOT",
      ...brief.donts.map((line) => `- ${line}`),
    ];
    return lines.join("\n");
  }, [brief, hasError]);

  const copyBrief = async () => {
    if (!briefText) return;
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setProductName(DEFAULTS.productName);
    setAudience(DEFAULTS.audience);
    setKeyMessage(DEFAULTS.keyMessage);
    setCtaText(DEFAULTS.ctaText);
    setStructureId(DEFAULTS.structureId);
    setPlatformId(DEFAULTS.platformId);
    setDurationSeconds(DEFAULTS.durationSeconds);
    setHookVariants(DEFAULTS.hookVariants);
    setCtaVariants(DEFAULTS.ctaVariants);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          UGC production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">UGC Brief Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A timed shot list with a word budget per scene, the delivery spec for the placement you
          are buying, and the dos and don&apos;ts that stop a reshoot.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ugc-product">
              Product
            </label>
            <input
              id="ugc-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ugc-audience">
              Who the ad is for
            </label>
            <textarea
              id="ugc-audience"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ugc-message">
              One key message
            </label>
            <input
              id="ugc-message"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={keyMessage}
              onChange={(event) => setKeyMessage(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ugc-cta">
              Call to action
            </label>
            <input
              id="ugc-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={ctaText}
              onChange={(event) => setCtaText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ugc-structure">
              Ad structure
            </label>
            <select
              id="ugc-structure"
              className={`mt-2 ${INPUT_CLASS}`}
              value={structureId}
              onChange={(event) => setStructureId(event.target.value)}
            >
              {STRUCTURES.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ugc-platform">
              Placement
            </label>
            <select
              id="ugc-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(event) => setPlatformId(event.target.value)}
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ugc-duration">
              Runtime (seconds)
            </label>
            <input
              id="ugc-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_DURATION_SECONDS}
              max={MAX_DURATION_SECONDS}
              step="5"
              value={durationSeconds}
              onChange={(event) => setDurationSeconds(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="ugc-hooks">
                Hook variants
              </label>
              <input
                id="ugc-hooks"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_VARIANTS}
                max={MAX_VARIANTS}
                step="1"
                value={hookVariants}
                onChange={(event) => setHookVariants(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ugc-ctas">
                CTA variants
              </label>
              <input
                id="ugc-ctas"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_VARIANTS}
                max={MAX_VARIANTS}
                step="1"
                value={ctaVariants}
                onChange={(event) => setCtaVariants(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {brief.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cuts to deliver
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : brief.totalCuts}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${brief.hookVariants} hooks x ${brief.ctaVariants} CTAs · about ${NUM.format(brief.totalMinutes / 60)} hours of work`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBrief}
              disabled={hasError}
              aria-label="Copy the full UGC brief"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy brief"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the UGC brief generator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Structure", hasError ? DASH : brief.structure.label],
            ["Scenes", hasError ? DASH : String(brief.shotList.length)],
            [
              "Spoken words across the ad",
              hasError ? DASH : `${brief.totalWords} at ${brief.speakingWpm} wpm`,
            ],
            ["Frame", hasError ? DASH : `${brief.platform.ratio}, ${brief.platform.resolution}`],
            ["Codec and container", hasError ? DASH : brief.platform.codec],
            ["Maximum file size", hasError ? DASH : brief.platform.maxFile],
            [
              "Estimated shoot + edit",
              hasError ? DASH : `${brief.shootMinutes} + ${brief.editMinutes} minutes`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {brief.structure.note} {brief.platform.safeZone}
          </p>
        )}
      </section>

      {!hasError && brief.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fix before briefing the creator</h2>
          <ul className="mt-3 space-y-2">
            {brief.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Shot list</h2>
            <ol className="mt-4 space-y-3">
              {brief.shotList.map((scene) => (
                <li
                  key={scene.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-[var(--primary-foreground)]">
                      {scene.start}s – {scene.end}s
                    </span>
                    <span className="text-sm font-semibold">{scene.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {scene.seconds}s · {scene.words} words max
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{scene.direction}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    On screen: {scene.onScreen}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {brief.dos.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h2 className="mt-5 text-base font-semibold">Do not</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {brief.donts.map((line) => (
                <li key={line} className="text-[var(--muted-foreground)]">
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Brief to send</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {briefText}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Delivery specs are the platforms&apos; published recommendations and change with product
        updates — check the current ad spec sheet before a large shoot. Shoot and edit minutes are
        planning estimates, not quotes. Disclosure requirements are the advertiser&apos;s legal
        responsibility as well as the creator&apos;s.
      </p>
    </main>
  );
}
