"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw, Search, TriangleAlert } from "lucide-react";

import {
  CATEGORIES,
  FAIR_HOUSING_PROTECTED_CLASSES,
  LONG_PROMPT_TOKENS,
  PROMPTS,
  RISKY_LISTING_PHRASES,
  checkFairHousingLanguage,
  fillPrompt,
  searchPrompts,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const FIRST = PROMPTS[0];

const exampleValues = (prompt) =>
  prompt ? Object.fromEntries(prompt.variables.map((variable) => [variable.key, variable.placeholder])) : {};

const SCREEN_DEFAULT =
  "Charming three-bedroom home in a safe neighborhood with good schools, perfect for families. Walking distance to the park.";

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeId, setActiveId] = useState(FIRST.id);
  const [values, setValues] = useState(() => exampleValues(FIRST));
  const [copied, setCopied] = useState(false);
  const [screenText, setScreenText] = useState(SCREEN_DEFAULT);

  const results = useMemo(() => searchPrompts({ query, category }), [query, category]);
  const active = useMemo(() => PROMPTS.find((prompt) => prompt.id === activeId) || null, [activeId]);
  const filled = useMemo(
    () => fillPrompt({ template: active ? active.template : "", values }),
    [active, values],
  );
  const screen = useMemo(() => checkFairHousingLanguage(screenText), [screenText]);

  const failed = Boolean(filled.error);

  const selectPrompt = (prompt) => {
    setActiveId(prompt.id);
    setValues(exampleValues(prompt));
    setCopied(false);
  };

  const updateValue = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };

  const clearFields = () => {
    if (!active) return;
    setValues(Object.fromEntries(active.variables.map((variable) => [variable.key, ""])));
    setCopied(false);
  };

  const reset = () => {
    setQuery("");
    setCategory("All");
    setActiveId(FIRST.id);
    setValues(exampleValues(FIRST));
    setScreenText(SCREEN_DEFAULT);
    setCopied(false);
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(filled.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const rows = failed
    ? [
        ["Prompt", DASH],
        ["Category", DASH],
        ["Blanks filled", DASH],
        ["Words", DASH],
        ["Characters", DASH],
        ["Estimated tokens", DASH],
        ["Fair housing screen", DASH],
      ]
    : [
        ["Prompt", active ? active.title : DASH],
        ["Category", active ? active.category : DASH],
        ["Blanks filled", `${NUM.format(filled.filledCount)} / ${NUM.format(filled.totalCount)}`],
        ["Words", NUM.format(filled.words)],
        ["Characters", NUM.format(filled.characters)],
        [
          "Estimated tokens",
          `${NUM.format(filled.estimatedTokens)}${filled.isLong ? ` — over ${NUM.format(LONG_PROMPT_TOKENS)}, check small context windows` : ""}`,
        ],
        [
          "Fair housing screen",
          filled.fairHousingClean
            ? "No flagged phrase in what you typed"
            : `${NUM.format(filled.fairHousingFlags.length)} phrase${filled.fairHousingFlags.length === 1 ? "" : "s"} flagged`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Real estate prompts
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Real Estate Agent Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {NUM.format(PROMPTS.length)} fill-in-the-blank prompts for listing copy, seller outreach, neighbourhood guides
          and negotiation. Everything you type is screened against {NUM.format(RISKY_LISTING_PHRASES.length)} phrases that
          HUD advertising guidance flags under the Fair Housing Act.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="re-search">
              Search prompts
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="re-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="listing, expired, offer, referral"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-category">
              Category
            </label>
            <select
              id="re-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {NUM.format(results.length)} of {NUM.format(PROMPTS.length)} prompts
        </p>

        {results.length === 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            No prompt matches that search. Try a shorter word or set the category back to all.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {results.map((prompt) => {
              const isActive = prompt.id === activeId;
              return (
                <li key={prompt.id}>
                  <button
                    type="button"
                    onClick={() => selectPrompt(prompt)}
                    aria-pressed={isActive}
                    className={`flex min-h-11 w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                      {prompt.category}
                    </span>
                    <span className="text-sm font-semibold">{prompt.title}</span>
                    <span className="text-xs leading-5 text-[var(--muted-foreground)]">{prompt.goal}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {active && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Fill in the blanks</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{active.tip}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.variables.map((variable) => (
              <div key={variable.key}>
                <label className={LABEL_CLASS} htmlFor={`re-var-${variable.key}`}>
                  {variable.label}
                </label>
                <input
                  id={`re-var-${variable.key}`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  placeholder={variable.placeholder}
                  value={values[variable.key] ?? ""}
                  onChange={(event) => updateValue(variable.key, event.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={clearFields} className={GHOST_BTN}>
              Clear fields
            </button>
            <button type="button" onClick={() => selectPrompt(active)} className={GHOST_BTN}>
              Use example values
            </button>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(filled.estimatedTokens)} tokens`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Choose a prompt to build your text."
                : `${NUM.format(filled.filledCount)} of ${NUM.format(filled.totalCount)} blanks filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the finished prompt to the clipboard"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the prompt pack" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {filled.error}
          </p>
        )}

        {!failed && filled.missing.length > 0 && (
          <p role="status" className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Still blank: {filled.missing.join(", ")}. They stay visible as {"{{placeholders}}"} in the copied text.
          </p>
        )}

        {!failed && filled.fairHousingFlags.length > 0 && (
          <div role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            <p className="font-semibold">Fair housing check on what you typed:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {filled.fairHousingFlags.map((flag) => (
                <li key={flag.phrase}>
                  <strong>“{flag.phrase}”</strong> — {flag.basis}. {flag.why}
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">{filled.text}</pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <TriangleAlert className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Screen finished copy for fair housing language
        </h2>
        <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="re-screen">
          Paste listing or marketing copy
        </label>
        <textarea
          id="re-screen"
          rows={4}
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={screenText}
          onChange={(event) => setScreenText(event.target.value)}
        />

        {screen.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {screen.error}
          </p>
        ) : screen.clean ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            None of the {NUM.format(screen.checkedPhrases)} flagged phrases appear in this copy. That is not legal
            clearance — context can make an unlisted phrase unlawful.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Phrase</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Protected class</th>
                  <th scope="col" className="py-2 font-semibold">Write instead</th>
                </tr>
              </thead>
              <tbody>
                {screen.flags.map((flag) => (
                  <tr key={flag.phrase} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3 font-semibold text-[var(--danger)]">{flag.phrase}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{flag.basis}</td>
                    <td className="py-2.5">{flag.instead}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Protected classes under the federal Fair Housing Act: {FAIR_HOUSING_PROTECTED_CLASSES.join(", ")}. Many states
          and cities add more, such as source of income, age or marital status.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts assume roughly four characters per token in English; the exact figure depends on the model
        tokenizer. The fair housing screen is a drafting aid built on HUD advertising guidance, not legal advice —
        check your brokerage's compliance process before publishing. Everything runs in your browser.
      </p>
    </main>
  );
}
