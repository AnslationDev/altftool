"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DEFAULT_DAILY_FORMAT,
  FORBIDDEN_TITLE_CHARS,
  PACK_GROUPS,
  PROMPT_PACK,
  buildPromptPack,
  buildWikiLink,
  formatDateWithTokens,
  normalizeTag,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-US");
const DASH = "—";

const SLOT_FIELDS = [
  { key: "topic", label: "Topic", placeholder: "second brain workflows" },
  { key: "noteTitle", label: "Note title", placeholder: "Attention Is A Budget" },
  { key: "dateRange", label: "Date range", placeholder: "20-26 July 2026" },
  { key: "properties", label: "Frontmatter properties", placeholder: "created, tags, source, status" },
  { key: "cardCount", label: "Max flashcards", placeholder: "12" },
];

const DEFAULT_SELECTED = ["link-suggester", "moc-builder", "daily-review", "note-summariser"];

const DEFAULTS = {
  vaultName: "Studio",
  dailyFormat: DEFAULT_DAILY_FORMAT,
  sampleDate: "2026-07-27",
  linkNote: "Deep Work",
  linkHeading: "Chapter 2",
  linkAlias: "",
  tagInput: "area/work/deep focus",
  slots: {
    topic: "second brain workflows",
    noteTitle: "Attention Is A Budget",
    dateRange: "20-26 July 2026",
    properties: "created, tags, source, status",
    cardCount: "12",
  },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5";

/** Parse a yyyy-mm-dd string into a Date without touching the clock. */
function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function ToolHome() {
  const [vaultName, setVaultName] = useState(DEFAULTS.vaultName);
  const [dailyFormat, setDailyFormat] = useState(DEFAULTS.dailyFormat);
  const [sampleDate, setSampleDate] = useState(DEFAULTS.sampleDate);
  const [linkNote, setLinkNote] = useState(DEFAULTS.linkNote);
  const [linkHeading, setLinkHeading] = useState(DEFAULTS.linkHeading);
  const [linkAlias, setLinkAlias] = useState(DEFAULTS.linkAlias);
  const [tagInput, setTagInput] = useState(DEFAULTS.tagInput);
  const [slots, setSlots] = useState(DEFAULTS.slots);
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [copied, setCopied] = useState(false);

  const setSlot = (key) => (event) => {
    const { value } = event.target;
    setSlots((previous) => ({ ...previous, [key]: value }));
  };

  const toggle = (id) => {
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    );
    setCopied(false);
  };

  const pack = useMemo(
    () => buildPromptPack({ selectedIds: selected, values: { ...slots, dailyFormat }, vaultName }),
    [selected, slots, dailyFormat, vaultName],
  );

  const datePreview = useMemo(() => {
    const date = parseIsoDate(sampleDate);
    if (!date) return { error: "Pick a valid date." };
    return formatDateWithTokens(date, dailyFormat);
  }, [sampleDate, dailyFormat]);

  const linkPreview = useMemo(
    () => buildWikiLink({ note: linkNote, heading: linkHeading, alias: linkAlias }),
    [linkNote, linkHeading, linkAlias],
  );

  const tagPreview = useMemo(() => normalizeTag(tagInput), [tagInput]);

  const hasError = Boolean(pack.error);

  const copyPack = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(pack.combined);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setVaultName(DEFAULTS.vaultName);
    setDailyFormat(DEFAULTS.dailyFormat);
    setSampleDate(DEFAULTS.sampleDate);
    setLinkNote(DEFAULTS.linkNote);
    setLinkHeading(DEFAULTS.linkHeading);
    setLinkAlias(DEFAULTS.linkAlias);
    setTagInput(DEFAULTS.tagInput);
    setSlots(DEFAULTS.slots);
    setSelected(DEFAULT_SELECTED);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Prompts selected", DASH],
        ["Pack length", DASH],
        ["Words", DASH],
        ["Unfilled slots", DASH],
      ]
    : [
        ["Prompts selected", `${COUNT.format(pack.count)} of ${COUNT.format(PROMPT_PACK.length)}`],
        ["Pack length", `${COUNT.format(pack.characterCount)} characters`],
        ["Words", COUNT.format(pack.wordCount)],
        ["Unfilled slots", pack.missing.length === 0 ? "None" : pack.missing.join(", ")],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Obsidian
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Obsidian AI Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Twelve prompts for the jobs a vault actually needs — finding real links, splitting bloated
          notes, consolidating tags, reviewing a week of daily notes. Fill the slots once, tick the
          ones you want, copy the pack. Wikilink, tag and file name rules are checked live below.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Fill the slots</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-vault">
              Vault name
            </label>
            <input
              id="ob-vault"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={vaultName}
              onChange={(event) => setVaultName(event.target.value)}
            />
          </div>
          {SLOT_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`ob-slot-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`ob-slot-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={slots[field.key] ?? ""}
                onChange={setSlot(field.key)}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Choose your prompts</h2>
        {PACK_GROUPS.map((group) => (
          <div key={group} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {group}
            </p>
            <div className="mt-2 grid gap-2">
              {PROMPT_PACK.filter((entry) => entry.group === group).map((entry) => (
                <label key={entry.id} className={CHECK_ROW} htmlFor={`ob-pick-${entry.id}`}>
                  <input
                    id={`ob-pick-${entry.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={selected.includes(entry.id)}
                    onChange={() => toggle(entry.id)}
                  />
                  <span className="text-sm font-medium">{entry.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pack size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${COUNT.format(pack.count)} prompts`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Tick at least one prompt" : `${COUNT.format(pack.wordCount)} words ready to paste`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPack}
              disabled={hasError}
              aria-label="Copy the whole Obsidian prompt pack"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy pack"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {pack.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && pack.missing.length > 0 ? (
          <p className="mt-4 flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <span>
              These slots are still empty and will be pasted as {"{{placeholders}}"}:{" "}
              {pack.missing.join(", ")}
            </span>
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Vault syntax checker</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-format">
              Daily note format
            </label>
            <input
              id="ob-format"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={dailyFormat}
              onChange={(event) => setDailyFormat(event.target.value)}
            />
            <p className={HINT_CLASS}>YYYY MM DD MMM MMMM ddd dddd</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-date">
              Sample date
            </label>
            <input
              id="ob-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sampleDate}
              onChange={(event) => setSampleDate(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-sm">
          <span className="text-[var(--muted-foreground)]">File name: </span>
          {datePreview.error ? (
            <span role="alert" className="font-semibold text-[var(--danger)]">
              {datePreview.error}
            </span>
          ) : (
            <span className="font-semibold">{datePreview.formatted}.md</span>
          )}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-link-note">
              Link to note
            </label>
            <input
              id="ob-link-note"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={linkNote}
              onChange={(event) => setLinkNote(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-link-heading">
              Heading (optional)
            </label>
            <input
              id="ob-link-heading"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={linkHeading}
              onChange={(event) => setLinkHeading(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ob-link-alias">
              Alias (optional)
            </label>
            <input
              id="ob-link-alias"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={linkAlias}
              onChange={(event) => setLinkAlias(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 break-all text-sm">
          <span className="text-[var(--muted-foreground)]">Wikilink: </span>
          {linkPreview.error ? (
            <span role="alert" className="font-semibold text-[var(--danger)]">
              {linkPreview.error}
            </span>
          ) : (
            <span className="font-semibold">{linkPreview.link}</span>
          )}
        </p>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="ob-tag">
            Tag
          </label>
          <input
            id="ob-tag"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
          />
        </div>
        <p className="mt-2 break-all text-sm">
          <span className="text-[var(--muted-foreground)]">Valid tag: </span>
          {tagPreview.error ? (
            <span role="alert" className="font-semibold text-[var(--danger)]">
              {tagPreview.error}
            </span>
          ) : (
            <span className="font-semibold">
              {tagPreview.tag} · {tagPreview.depth} level{tagPreview.depth === 1 ? "" : "s"} of nesting
            </span>
          )}
        </p>

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Obsidian rejects these characters in a note file name:{" "}
          <span className="font-semibold">{FORBIDDEN_TITLE_CHARS.join(" ")}</span>
        </p>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your pack</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
              {pack.combined}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything happens in your browser — your notes are never read or uploaded. You paste the
        prompt and the relevant notes into your own assistant.
      </p>
    </main>
  );
}
