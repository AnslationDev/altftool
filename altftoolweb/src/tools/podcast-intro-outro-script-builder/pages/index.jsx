"use client";

import { useMemo, useState } from "react";
import { AudioLines, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_WPM,
  MIN_WPM,
  SPEAKING_RATES,
  TONES,
  buildScriptPack,
  formatDuration,
  formatScriptText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  show: "Build Notes",
  showSubject: "how engineering teams actually get built",
  host: "Ravi Iyer",
  guest: "Asha Menon",
  guestRole: "head of engineering at Nexa Labs",
  guestLink: "asha.dev",
  topic: "hiring your first ten engineers",
  hookQuestion: "why your first ten hires decide everything that follows",
  takeaway: "how to write a scorecard before you write the job ad",
  cta: "share it with one person who is hiring right now.",
  sponsor: "",
  sponsorLine: "",
  includeSponsor: false,
  includeGuest: true,
  tone: "warm",
  wpm: String(SPEAKING_RATES.conversational.wpm),
};

const DASH = "—";

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFields((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const pack = useMemo(
    () => buildScriptPack({ ...fields, wpm: Number(fields.wpm) }),
    [fields],
  );

  const hasError = Boolean(pack.error);
  const scriptText = useMemo(() => (hasError ? "" : formatScriptText(pack)), [pack, hasError]);

  const copyResult = async () => {
    if (!scriptText) return;
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFields(DEFAULTS);
    setCopied(false);
  };

  const renderBlock = (title, block) => (
    <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {block.words} words · {formatDuration(block.seconds)}
        </p>
      </div>
      <div className="mt-4 space-y-4">
        {block.rows.map((row) => (
          <article key={row.id} className="rounded-lg border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                {row.label}
              </h3>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                {row.words} w · {formatDuration(row.seconds)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{row.text}</p>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AudioLines className="h-4 w-4" aria-hidden="true" />
          Podcast production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Intro Outro Script Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the show details once and get a repeatable intro and outro, broken into sections
          with word counts and read times at your own speaking rate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pio-show">
              Show name
            </label>
            <input id="pio-show" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.show} onChange={set("show")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pio-subject">
              What the show is about
            </label>
            <input id="pio-subject" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.showSubject} onChange={set("showSubject")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pio-host">
              Host name
            </label>
            <input id="pio-host" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.host} onChange={set("host")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pio-topic">
              Episode topic
            </label>
            <input id="pio-topic" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.topic} onChange={set("topic")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pio-hook">
              Hook — the question the episode answers
            </label>
            <input id="pio-hook" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.hookQuestion} onChange={set("hookQuestion")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pio-takeaway">
              One-line takeaway
            </label>
            <input id="pio-takeaway" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.takeaway} onChange={set("takeaway")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pio-cta">
              Call to action
            </label>
            <input id="pio-cta" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.cta} onChange={set("cta")} />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2">
            <input id="pio-hasguest" className={CHECK_CLASS} type="checkbox" checked={fields.includeGuest} onChange={set("includeGuest")} />
            <label className="text-sm font-semibold" htmlFor="pio-hasguest">
              This episode has a guest
            </label>
          </div>

          {fields.includeGuest ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="pio-guest">
                  Guest name
                </label>
                <input id="pio-guest" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.guest} onChange={set("guest")} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pio-guestrole">
                  Guest role
                </label>
                <input id="pio-guestrole" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.guestRole} onChange={set("guestRole")} />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="pio-guestlink">
                  Where listeners find the guest
                </label>
                <input id="pio-guestlink" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.guestLink} onChange={set("guestLink")} />
              </div>
            </>
          ) : null}

          <div className="sm:col-span-2 flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2">
            <input id="pio-hassponsor" className={CHECK_CLASS} type="checkbox" checked={fields.includeSponsor} onChange={set("includeSponsor")} />
            <label className="text-sm font-semibold" htmlFor="pio-hassponsor">
              Include a sponsor read
            </label>
          </div>

          {fields.includeSponsor ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="pio-sponsor">
                  Sponsor name
                </label>
                <input id="pio-sponsor" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.sponsor} onChange={set("sponsor")} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pio-sponsorline">
                  Sponsor line
                </label>
                <input id="pio-sponsorline" className={`mt-2 ${INPUT_CLASS}`} type="text" value={fields.sponsorLine} onChange={set("sponsorLine")} />
              </div>
            </>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="pio-tone">
              Tone
            </label>
            <select id="pio-tone" className={`mt-2 ${INPUT_CLASS}`} value={fields.tone} onChange={set("tone")}>
              {Object.values(TONES).map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pio-wpm">
              Speaking rate (words per minute)
            </label>
            <input
              id="pio-wpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WPM}
              max={MAX_WPM}
              step="5"
              value={fields.wpm}
              onChange={set("wpm")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(SPEAKING_RATES).map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setFields((prev) => ({ ...prev, wpm: String(profile.wpm) }))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {profile.label} · {profile.wpm}
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {pack.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Intro plus outro read time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(pack.totalSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the speaking rate to see the scripts" : `${pack.totalWords} words at ${pack.wpm} wpm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy both scripts"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy scripts"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Intro", hasError ? DASH : `${pack.intro.words} words · ${formatDuration(pack.intro.seconds)}`],
            ["Outro", hasError ? DASH : `${pack.outro.words} words · ${formatDuration(pack.outro.seconds)}`],
            ["Sections written", hasError ? DASH : pack.intro.rows.length + pack.outro.rows.length],
            ["Tone", hasError ? DASH : pack.toneLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? renderBlock("Intro script", pack.intro) : null}
      {!hasError ? renderBlock("Outro script", pack.outro) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Read times include a short pause allowance per section and are an estimate — record a test
        pass to confirm your own pace before locking a music bed to the intro.
      </p>
    </main>
  );
}
