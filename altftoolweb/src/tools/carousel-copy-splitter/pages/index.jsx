"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GalleryHorizontalEnd, RotateCcw } from "lucide-react";

import { PLATFORMS, platformById, splitCarousel, toPlainText } from "../lib";

const SAMPLE = `Most people write a carousel like a blog post, and that is why nobody swipes past slide two. Start with the single idea you want remembered. Put it on slide one in under twelve words. Then give one supporting point per slide, never two. A slide carrying two ideas carries none. Keep sentences short and the type large enough to read at arm's length. Finish by telling people exactly what to do next.`;

const DEFAULTS = {
  platformId: "instagram",
  hook: "Your carousel is not too long. It is too crowded.",
  body: SAMPLE,
  cta: "Save this before your next launch.",
  charBudget: "220",
  maxSlides: "20",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ROLE_LABEL = { hook: "Hook", body: "Body", cta: "Call to action" };

export default function ToolHome() {
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [hook, setHook] = useState(DEFAULTS.hook);
  const [body, setBody] = useState(DEFAULTS.body);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [charBudget, setCharBudget] = useState(DEFAULTS.charBudget);
  const [maxSlides, setMaxSlides] = useState(DEFAULTS.maxSlides);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => splitCarousel({ hook, body, cta, charBudget, maxSlides: Number(maxSlides) }),
    [hook, body, cta, charBudget, maxSlides],
  );

  const ok = !result.error;
  const dash = "—";

  const applyPlatform = (id) => {
    setPlatformId(id);
    const platform = platformById(id);
    if (platform) {
      setCharBudget(String(platform.charBudget));
      setMaxSlides(String(platform.maxSlides));
    }
    setCopied(false);
  };

  const copyResult = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(toPlainText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPlatformId(DEFAULTS.platformId);
    setHook(DEFAULTS.hook);
    setBody(DEFAULTS.body);
    setCta(DEFAULTS.cta);
    setCharBudget(DEFAULTS.charBudget);
    setMaxSlides(DEFAULTS.maxSlides);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GalleryHorizontalEnd className="h-4 w-4" aria-hidden="true" />
          Carousel copy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Carousel Copy Splitter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the copy, set how much text one slide can hold, and it is packed onto slides at
          sentence boundaries — hook first, call to action last, no word ever cut in half.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="car-platform">
              Platform preset
            </label>
            <select
              id="car-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(event) => applyPlatform(event.target.value)}
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.label} — up to {platform.maxSlides} slides
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-budget">
              Characters per slide
            </label>
            <input
              id="car-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="600"
              step="10"
              value={charBudget}
              onChange={(event) => setCharBudget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-max">
              Slide limit
            </label>
            <input
              id="car-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="40"
              step="1"
              value={maxSlides}
              onChange={(event) => setMaxSlides(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="car-cta">
              Final slide (call to action)
            </label>
            <input
              id="car-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="car-hook">
            Slide one (hook) — leave blank to use the first sentence
          </label>
          <input
            id="car-hook"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={hook}
            onChange={(event) => setHook(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="car-body">
            Body copy
          </label>
          <textarea
            id="car-body"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={8}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
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
              Slides needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.slideCount : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `limit ${result.maxSlides} · ${result.budget} characters per slide`
                : "Fix the input above to split the copy"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the slide plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy slides"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the splitter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total characters", ok ? String(result.totalCharacters) : dash],
            ["Total words", ok ? String(result.totalWords) : dash],
            ["Average per slide", ok ? `${result.averageCharacters} characters` : dash],
            ["Shortest / longest slide", ok ? `${result.shortest} / ${result.longest}` : dash],
            ["Length spread (standard deviation)", ok ? String(result.deviation) : dash],
            ["Balanced", ok ? (result.balanced ? "Yes" : "No") : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
        {ok && result.warnings.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[var(--success)]">
            Balanced, inside the slide limit, and finished with a call to action.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 space-y-3">
          {result.slides.map((slide) => (
            <article
              key={slide.index}
              className={`rounded-xl bg-[var(--card)] p-5 ring-1 ${
                slide.index > result.maxSlides ? "ring-[var(--danger)]" : "ring-[var(--border)]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Slide {slide.index} · {ROLE_LABEL[slide.role]}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {slide.characters} chars · {slide.words} words · {slide.fill}% full
                </p>
              </div>
              <p className="mt-2 text-base leading-7">{slide.text}</p>
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Slide ${slide.index} uses ${slide.fill} percent of the character budget`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, slide.fill))}%` }}
                />
              </div>
              {slide.index > result.maxSlides ? (
                <p className="mt-2 text-xs font-semibold text-[var(--danger)]">
                  Past the slide limit for this platform.
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Character budgets depend on your template — the same 220 characters that fit a square slide
        at 28px will overflow at 40px. Set the budget from your own layout, then split.
      </p>
    </main>
  );
}
