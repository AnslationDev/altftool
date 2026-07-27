"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Star, Terminal } from "lucide-react";

import {
  buildCheatSheet,
  categoryCounts,
  COMMAND_CATEGORIES,
  COMMANDS,
  getCommand,
  searchCommands,
} from "../lib";

const DEFAULTS = { query: "", category: "All" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_CLASS =
  "block w-full overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-2 font-mono text-xs text-[var(--foreground)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [favourites, setFavourites] = useState(["grep", "tar", "systemctl"]);
  const [copiedKey, setCopiedKey] = useState("");

  const counts = useMemo(() => categoryCounts(), []);
  const search = useMemo(() => searchCommands(query, { category }), [query, category]);
  const hasError = Boolean(search.error);
  const results = hasError ? [] : search.results;

  const favouriteCommands = useMemo(
    () => favourites.map((name) => getCommand(name)).filter(Boolean),
    [favourites],
  );

  const cheatSheet = useMemo(
    () =>
      buildCheatSheet(
        favouriteCommands.length > 0 ? favouriteCommands : results,
        favouriteCommands.length > 0 ? "MY LINUX CHEAT SHEET" : "LINUX COMMAND SEARCH RESULTS",
      ),
    [favouriteCommands, results],
  );

  const toggleFavourite = (name) => {
    setFavourites((previous) =>
      previous.includes(name) ? previous.filter((entry) => entry !== name) : [...previous, name],
    );
    setCopiedKey("");
  };

  const copyText = async (text, key) => {
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
    setQuery(DEFAULTS.query);
    setCategory(DEFAULTS.category);
    setFavourites(["grep", "tar", "systemctl"]);
    setCopiedKey("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          {NUM.format(COMMANDS.length)} commands
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Linux Common Command Query Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search {NUM.format(COMMANDS.length)} everyday Linux commands by name, alias, keyword or
          what they do. Each entry shows the usage synopsis in manual-page form and worked examples
          you can copy straight into a shell. Star the ones you keep forgetting and export them as a
          cheat sheet.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="linux-query">
            Search
          </label>
          <input
            id="linux-query"
            className={`${INPUT_CLASS} mt-1`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="compress, permissions, find files…"
            type="search"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="linux-category">
            Category
          </label>
          <select
            id="linux-category"
            className={`${INPUT_CLASS} mt-1`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All categories ({NUM.format(COMMANDS.length)})</option>
            {COMMAND_CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>
                {entry} ({NUM.format(counts[entry] ?? 0)})
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {search.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Matching commands
        </p>
        <p className="mt-1 text-4xl leading-none font-bold">
          {hasError ? DASH : NUM.format(search.total)}
        </p>

        <dl className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Query</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : query.trim() === "" ? "(everything)" : query.trim()}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Category filter</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{category}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Starred for the cheat sheet</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {favouriteCommands.length === 0 ? "None" : favouriteCommands.map((c) => c.name).join(", ")}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => copyText(cheatSheet, "sheet")}
            aria-label="Copy the cheat sheet to the clipboard"
            disabled={hasError}
          >
            {copiedKey === "sheet" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedKey === "sheet" ? "Copied!" : "Copy cheat sheet"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {results.length === 0 && !hasError ? (
          <p className="rounded-xl bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
            Nothing matches “{query}”. Try a plain word such as “permissions”, “archive” or
            “ports”.
          </p>
        ) : null}

        {results.map((command) => {
          const starred = favourites.includes(command.name);
          return (
            <article
              key={command.name}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-xl font-bold">{command.name}</h2>
                  <p className="mt-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
                    {command.category}
                  </p>
                </div>
                <button
                  type="button"
                  className={GHOST_BTN}
                  onClick={() => toggleFavourite(command.name)}
                  aria-pressed={starred}
                  aria-label={`${starred ? "Remove" : "Add"} ${command.name} ${starred ? "from" : "to"} the cheat sheet`}
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                  {starred ? "Starred" : "Star"}
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {command.description}
              </p>

              <p className="mt-3 text-xs font-semibold text-[var(--muted-foreground)]">Usage</p>
              <code className={`${CODE_CLASS} mt-1`}>{command.syntax}</code>

              <p className="mt-3 text-xs font-semibold text-[var(--muted-foreground)]">Examples</p>
              <ul className="mt-1 grid gap-2">
                {command.examples.map((example) => (
                  <li key={example} className="flex flex-wrap items-center gap-2">
                    <code className={`${CODE_CLASS} flex-1`}>{example}</code>
                    <button
                      type="button"
                      className={GHOST_BTN}
                      onClick={() => copyText(example, `${command.name}-${example}`)}
                      aria-label={`Copy the example ${example}`}
                    >
                      {copiedKey === `${command.name}-${example}` ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copiedKey === `${command.name}-${example}` ? "Copied!" : "Copy"}
                    </button>
                  </li>
                ))}
              </ul>

              {command.related?.length ? (
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  See also: <span className="font-mono">{command.related.join(", ")}</span>
                </p>
              ) : null}
            </article>
          );
        })}
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        Synopses follow the manual-page convention: square brackets mark optional arguments. Options
        differ between GNU coreutils and BSD or macOS builds — run{" "}
        <code className="rounded bg-[var(--muted)] px-1">man &lt;command&gt;</code> on the machine
        you are actually using before running anything destructive.
      </p>
    </main>
  );
}
