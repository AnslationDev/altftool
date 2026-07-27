"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Video } from "lucide-react";

import { DEFAULT_WPM, FORMATS, TONES, generateHooks, reviewHook } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [topic, setTopic] = useState("building a tiny AI business");
  const [audience, setAudience] = useState("solo creators");
  const [outcome, setOutcome] = useState("a first paid customer");
  const [timeframe, setTimeframe] = useState("7 days");
  const [number, setNumber] = useState("5");
  const [format, setFormat] = useState("short");
  const [tone, setTone] = useState("direct");
  const [wpm, setWpm] = useState(String(DEFAULT_WPM));
  const [customHook, setCustomHook] = useState("Most AI business advice is backwards.");
  const [copied, setCopied] = useState("");

  const hooks = useMemo(
    () =>
      generateHooks({
        topic,
        audience,
        outcome,
        timeframe,
        number: Number(number),
        format,
        tone,
        wpm: Number(wpm),
      }),
    [topic, audience, outcome, timeframe, number, format, tone, wpm],
  );
  const review = useMemo(() => reviewHook(customHook, { format, wpm: Number(wpm) }), [customHook, format, wpm]);

  const copyText = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setTopic("building a tiny AI business");
    setAudience("solo creators");
    setOutcome("a first paid customer");
    setTimeframe("7 days");
    setNumber("5");
    setFormat("short");
    setTone("direct");
    setWpm(String(DEFAULT_WPM));
    setCustomHook("Most AI business advice is backwards.");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Video className="h-4 w-4" aria-hidden="true" />
          First three seconds
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Video Script Hook Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate opening hooks from proven copywriting patterns and check whether each one fits the
          time budget for shorts, standard videos or long-form intros.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className={LABEL_CLASS} htmlFor="vh-topic">Topic</label>
            <input id="vh-topic" className={`mt-2 ${INPUT_CLASS}`} value={topic} onChange={(event) => setTopic(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-audience">Audience</label>
            <input id="vh-audience" className={`mt-2 ${INPUT_CLASS}`} value={audience} onChange={(event) => setAudience(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-outcome">Outcome</label>
            <input id="vh-outcome" className={`mt-2 ${INPUT_CLASS}`} value={outcome} onChange={(event) => setOutcome(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-time">Timeframe</label>
            <input id="vh-time" className={`mt-2 ${INPUT_CLASS}`} value={timeframe} onChange={(event) => setTimeframe(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-format">Format</label>
            <select id="vh-format" className={`mt-2 ${INPUT_CLASS}`} value={format} onChange={(event) => setFormat(event.target.value)}>
              {FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-tone">Tone</label>
            <select id="vh-tone" className={`mt-2 ${INPUT_CLASS}`} value={tone} onChange={(event) => setTone(event.target.value)}>
              <option value="any">Any tone</option>
              {TONES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-wpm">Speaking pace WPM</label>
            <input id="vh-wpm" className={`mt-2 ${INPUT_CLASS}`} type="number" min="90" max="220" value={wpm} onChange={(event) => setWpm(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vh-number">List count</label>
            <input id="vh-number" className={`mt-2 ${INPUT_CLASS}`} type="number" min="2" max="99" value={number} onChange={(event) => setNumber(event.target.value)} />
          </div>
        </div>
      </section>

      {hooks.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {hooks.error}
        </p>
      ) : (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Generated hooks</p>
                <h2 className="mt-1 text-2xl font-semibold">{hooks.fitCount}/{hooks.total} fit the {hooks.budgetSeconds}s budget</h2>
              </div>
              <button className={GHOST_BTN} type="button" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {hooks.hooks.map((hook) => (
                <article key={hook.id} className="rounded-lg bg-[var(--surface-soft)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{hook.name} · {hook.seconds}s · {hook.words} words</p>
                      <p className="mt-2 text-lg font-semibold">{hook.text}</p>
                    </div>
                    <button className={PRIMARY_BTN} type="button" onClick={() => copyText(hook.id, hook.text)}>
                      {copied === hook.id ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                      {copied === hook.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{hook.rationale}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <label className={LABEL_CLASS} htmlFor="vh-review">Review your hook</label>
            <textarea id="vh-review" className="mt-2 min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" value={customHook} onChange={(event) => setCustomHook(event.target.value)} />
            {review.error ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">{review.error}</p>
            ) : (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Verdict</p>
                <h3 className={review.fits ? "mt-1 text-xl font-semibold text-[var(--success)]" : "mt-1 text-xl font-semibold text-[var(--warning)]"}>{review.verdict}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{review.words} words · {review.seconds}s · score {review.score}/{review.maxScore}</p>
                {review.issues.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {review.issues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </aside>
        </section>
      )}
    </main>
  );
}
