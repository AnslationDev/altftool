"use client";

import { useEffect, useState } from "react";
import { BookOpen, History, Moon, Route, Sun, Trash2, X } from "lucide-react";

const THEME_MODE_KEY = "appThemeMode";
const numberFormat = new Intl.NumberFormat("en-US");

function useLocalTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Deferred to an effect so the first client render matches SSR markup —
    // the real theme is only known once `document` exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const setTheme = (dark) => {
    const next = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_MODE_KEY, next);
    } catch {
      // theme persistence is best-effort
    }
    setIsDark(dark);
  };

  return [isDark, setTheme];
}

function DocsDialog({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Supported input formats"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">How scanning works</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close documentation"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X aria-hidden="true" size={15} />
          </button>
        </div>
        <div className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Everything runs locally in your browser — files and specs are never uploaded to a
            server. Public API scans fetch the spec directly from your browser.
          </p>
          <div>
            <h3 className="mb-1 font-semibold text-foreground">Recognized inputs</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>OpenAPI / Swagger specs (JSON or YAML)</li>
              <li>Postman collections (v2 / v2.1 exports)</li>
              <li>HAR files exported from browser DevTools</li>
              <li>Access logs with method, path, status, and latency</li>
              <li>Source code: fetch / axios calls, Express-style routes, cURL commands</li>
              <li>URL maps such as the api.github.com root document</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-foreground">How usage status is derived</h3>
            <p>
              Endpoints observed in traffic (logs, HAR, call sites) are ranked by real call
              counts — the top third is <strong>Actively Used</strong>, the middle{" "}
              <strong>Infrequently Used</strong>, the bottom <strong>Rarely Used</strong>.
              Endpoints declared in a spec but never observed in traffic are{" "}
              <strong>Unused</strong>.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-foreground">Trends</h3>
            <p>
              “vs last scan” deltas and sparklines compare against your scan history, stored on
              this device. Use <strong>Rescan</strong> to record a new scan (URL sources are
              re-fetched).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({ history, onClear, onClose }) {
  const ordered = [...history].reverse();
  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Scan history</h3>
        <div className="flex gap-1">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Trash2 aria-hidden="true" size={12} /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scan history"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X aria-hidden="true" size={14} />
          </button>
        </div>
      </div>
      {ordered.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No scans recorded yet — add a source or hit Rescan.
        </p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-auto">
          {ordered.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
            >
              <p className="font-semibold text-foreground">
                {numberFormat.format(entry.endpoints)} endpoints ·{" "}
                {numberFormat.format(entry.calls)} calls
              </p>
              <p className="text-muted-foreground">
                {new Date(entry.at).toLocaleString()} · {entry.domains} domain
                {entry.domains === 1 ? "" : "s"} · {entry.unused} unused
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function HeaderBar({ history, onClearHistory }) {
  const [isDark, setTheme] = useLocalTheme();
  const [docsOpen, setDocsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Route aria-hidden="true" size={19} />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            API Endpoint Usage Mapper
          </h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            Developer Tools
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Scan your codebase or paste your API spec to discover, map, and visualize all API
          endpoints and their usage.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDocsOpen(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <BookOpen aria-hidden="true" size={15} /> Documentation
        </button>

        {/* Theme switch — light / dark segmented pill */}
        <div
          role="group"
          aria-label="Color theme"
          className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
        >
          <button
            type="button"
            aria-pressed={!isDark}
            aria-label="Light theme"
            onClick={() => setTheme(false)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              !isDark ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun aria-hidden="true" size={15} />
          </button>
          <button
            type="button"
            aria-pressed={isDark}
            aria-label="Dark theme"
            onClick={() => setTheme(true)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isDark
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon aria-hidden="true" size={15} />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setHistoryOpen((open) => !open)}
            aria-expanded={historyOpen}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <History aria-hidden="true" size={15} /> Scan History
          </button>
          {historyOpen && (
            <HistoryPanel
              history={history}
              onClear={onClearHistory}
              onClose={() => setHistoryOpen(false)}
            />
          )}
        </div>
      </div>

      {docsOpen && <DocsDialog onClose={() => setDocsOpen(false)} />}
    </header>
  );
}
