"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw, Shuffle, X } from "lucide-react";
import { CHANNELS, MAX_FIELD_LENGTH, OCCASIONS, TONES, buildNote } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  recipient: "Aunt Meera",
  sender: "Rohan",
  occasion: "gift",
  channel: "card",
  tone: "warm",
  item: "blue ceramic teapot",
  detail: "We have used it every morning since it arrived",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [occasion, setOccasion] = useState(DEFAULTS.occasion);
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [item, setItem] = useState(DEFAULTS.item);
  const [detail, setDetail] = useState(DEFAULTS.detail);
  const [seed, setSeed] = useState(1);
  const [copiedKey, setCopiedKey] = useState("");

  const occasionSpec = OCCASIONS.find((o) => o.id === occasion) ?? OCCASIONS[0];
  const channelSpec = CHANNELS.find((c) => c.id === channel) ?? CHANNELS[0];

  const note = useMemo(
    () => buildNote({ recipient, sender, occasion, channel, tone, item, detail, seed }),
    [recipient, sender, occasion, channel, tone, item, detail, seed],
  );

  const hasError = Boolean(note.error);
  const fullText = hasError
    ? ""
    : note.subject
      ? `Subject: ${note.subject}\n\n${note.body}`
      : note.body;

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const reset = () => {
    setRecipient(DEFAULTS.recipient);
    setSender(DEFAULTS.sender);
    setOccasion(DEFAULTS.occasion);
    setChannel(DEFAULTS.channel);
    setTone(DEFAULTS.tone);
    setItem(DEFAULTS.item);
    setDetail(DEFAULTS.detail);
    setSeed(1);
    setCopiedKey("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Note writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Thank You Note Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a note with the four parts a good thank you needs — greeting, specific thanks, the
          difference it made, and a forward-looking close — at the right length for a card, an email
          or a message.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ty-recipient">
              Who are you thanking
            </label>
            <input
              id="ty-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={recipient}
              placeholder="Aunt Meera"
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ty-sender">
              Your name
            </label>
            <input
              id="ty-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sender}
              placeholder="Rohan"
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ty-occasion">
              What for
            </label>
            <select
              id="ty-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            >
              {OCCASIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ty-channel">
              Where is it going
            </label>
            <select
              id="ty-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
            >
              {CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ty-tone">
              Tone
            </label>
            <select
              id="ty-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ty-item">
              {occasionSpec.itemLabel}
            </label>
            <input
              id="ty-item"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={item}
              maxLength={MAX_FIELD_LENGTH}
              placeholder={occasionSpec.itemPlaceholder}
              onChange={(event) => setItem(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ty-detail">
              What difference did it make (one sentence, in your words)
            </label>
            <textarea
              id="ty-detail"
              className="mt-2 min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={detail}
              maxLength={MAX_FIELD_LENGTH}
              placeholder="We have used it every morning since it arrived"
              onChange={(event) => setDetail(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave this blank and a general line is used instead — but one true detail is what
              makes a thank you note read as sincere.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => setSeed((value) => value + 1)}
            aria-label="Rewrite the note with different wording"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Rewrite
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {note.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Word count
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(note.wordCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the fields above to build the note."
                : `${channelSpec.label} · target ${note.minWords}-${note.maxWords} words`}
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={() => copy(fullText, "note")}
            aria-label="Copy the thank you note"
            disabled={hasError}
          >
            {copiedKey === "note" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedKey === "note" ? "Copied!" : "Copy note"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Occasion", occasionSpec.label],
            ["Channel", channelSpec.label],
            ["Tone", TONES.find((t) => t.id === tone)?.label ?? DASH],
            ["Subject line", hasError ? DASH : (note.subject ?? "Not needed for this channel")],
            ["Within target length", hasError ? DASH : note.inRange ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your note</h2>
            {note.subject && (
              <p className="mt-3 text-sm">
                <span className="text-[var(--muted-foreground)]">Subject: </span>
                <span className="font-semibold">{note.subject}</span>
              </p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{note.body}</p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Note check</h2>
            <ul className="mt-3 grid gap-3">
              {note.checks.map((check) => (
                <li key={check.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      check.ok === null
                        ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        : check.ok
                          ? "bg-[var(--success)]/15 text-[var(--success)]"
                          : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                    aria-hidden="true"
                  >
                    {check.ok === null ? (
                      <span className="text-xs font-bold">i</span>
                    ) : check.ok ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{check.label}</span>
                    <span className="block text-[var(--muted-foreground)]">{check.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The draft is built in your browser and nothing you type leaves the page. Read it once and
        change at least one line into your own words before you send it.
      </p>
    </main>
  );
}
