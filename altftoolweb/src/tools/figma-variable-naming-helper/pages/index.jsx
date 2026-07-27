"use client";

import { useMemo, useState } from "react";
import { Copy, Figma, RotateCcw } from "lucide-react";
import { CASE_STYLES, SEPARATORS, generateTokenNames, lintNames, schemeSummary } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS = `${INPUT_CLASS} min-h-28 py-3`;
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [scheme, setScheme] = useState({ prefix: "brand", collection: "color", separator: "/", caseStyle: "kebab", includeTier: true });
  const [names, setNames] = useState("brand/color/primitive/teal/500\nbrand/color/semantic/text/primary\nbrand/color/bg-primary");
  const [copied, setCopied] = useState(false);
  const generated = useMemo(() => generateTokenNames(scheme, "all"), [scheme]);
  const lint = useMemo(() => lintNames(names, scheme), [names, scheme]);
  const summary = useMemo(() => schemeSummary(scheme), [scheme]);

  const update = (key, value) => setScheme((previous) => ({ ...previous, [key]: value }));
  const copy = async () => {
    if (generated.error) return;
    await navigator.clipboard.writeText(generated.rows.map((row) => row.name).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Figma className="h-4 w-4" aria-hidden="true" /> Design tokens
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Figma Variable Naming Helper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Generate a consistent variable scheme and lint pasted token names.</p>
      </header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Prefix<input className={`mt-2 ${INPUT_CLASS}`} value={scheme.prefix} onChange={(e) => update("prefix", e.target.value)} /></label>
          <label className="text-sm font-semibold">Collection<input className={`mt-2 ${INPUT_CLASS}`} value={scheme.collection} onChange={(e) => update("collection", e.target.value)} /></label>
          <label className="text-sm font-semibold">Separator<select className={`mt-2 ${INPUT_CLASS}`} value={scheme.separator} onChange={(e) => update("separator", e.target.value)}>{SEPARATORS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-semibold">Case<select className={`mt-2 ${INPUT_CLASS}`} value={scheme.caseStyle} onChange={(e) => update("caseStyle", e.target.value)}>{CASE_STYLES.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={scheme.includeTier} onChange={(e) => update("includeTier", e.target.checked)} /> Include primitive/semantic tier</label>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{summary.error ? summary.error : summary.text}</p>
      </section>
      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {generated.error ? <p className="text-sm text-[var(--danger)]">{generated.error}</p> : (
          <>
            <div className="grid gap-2 text-sm">
              {generated.rows.slice(0, 8).map((row) => <code key={row.name} className="rounded-md bg-[var(--surface-soft)] px-3 py-2">{row.name}</code>)}
            </div>
            <button type="button" className={`mt-4 ${PRIMARY_BTN}`} onClick={copy}><Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy generated names"}</button>
          </>
        )}
        <label className="mt-5 block text-sm font-semibold">Lint existing names<textarea className={`mt-2 ${AREA_CLASS}`} value={names} onChange={(e) => setNames(e.target.value)} /></label>
        {!lint.error && <p className="mt-3 text-sm text-[var(--muted-foreground)]">{lint.cleanCount}/{lint.total} clean · {lint.errorCount} errors · {lint.warningCount} warnings</p>}
        <button type="button" className={`mt-3 ${GHOST_BTN}`} onClick={() => setScheme({ prefix: "brand", collection: "color", separator: "/", caseStyle: "kebab", includeTier: true })}><RotateCcw className="h-4 w-4" /> Reset scheme</button>
      </section>
    </main>
  );
}
