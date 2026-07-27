"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShoppingBag } from "lucide-react";

const INPUT_CLASS = "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]";
const GHOST_BTN = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)]";

function check({ width, height, fill, margin, whiteBg }) {
  const w = Number(width); const h = Number(height); const f = Number(fill); const m = Number(margin);
  const issues = [];
  if (Math.min(w, h) < 500) issues.push("Minimum side should be at least 500px.");
  if (Math.min(w, h) < 1500) issues.push("1500px+ is recommended for zoom quality.");
  if (Math.abs(w / h - 1) > 0.04) issues.push("Primary catalogue images should be close to square.");
  if (f < 80) issues.push("Product should fill around 80-90% of the frame.");
  if (m < 3) issues.push("Leave a small safe margin; product is too close to the edge.");
  if (!whiteBg) issues.push("Use a clean white or transparent-looking product background.");
  return { issues, status: issues.length === 0 ? "pass" : issues.length <= 2 ? "review" : "fail" };
}

export default function ToolHome() {
  const [width, setWidth] = useState("1500"); const [height, setHeight] = useState("1500"); const [fill, setFill] = useState("86"); const [margin, setMargin] = useState("7"); const [whiteBg, setWhiteBg] = useState(true); const [copied, setCopied] = useState(false);
  const result = useMemo(() => check({ width, height, fill, margin, whiteBg }), [width, height, fill, margin, whiteBg]);
  const copy = async () => { const text = result.issues.length ? result.issues.map((i) => `- ${i}`).join("\n") : "Flipkart image quick spec checks pass."; try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } };
  return <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6"><header className="mb-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><ShoppingBag className="h-4 w-4" aria-hidden="true" />Marketplace image QA</div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Flipkart Listing Image Spec Checker</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Check catalogue images for size, square crop, white background, frame fill and margin rules.</p></header><section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-4 sm:grid-cols-4">{[["Width", width, setWidth], ["Height", height, setHeight], ["Product fill %", fill, setFill], ["Margin %", margin, setMargin]].map(([label, value, setter]) => <div key={label}><label className="block text-sm font-semibold" htmlFor={`fk-${label}`}>{label}</label><input id={`fk-${label}`} className={`mt-2 ${INPUT_CLASS}`} type="number" value={value} onChange={(event) => setter(event.target.value)} /></div>)}<label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={whiteBg} onChange={(event) => setWhiteBg(event.target.checked)} />White background</label></div></section><section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><h2 className={result.status === "pass" ? "text-2xl font-semibold text-[var(--success)]" : result.status === "review" ? "text-2xl font-semibold text-[var(--warning)]" : "text-2xl font-semibold text-[var(--danger)]"}>{result.status === "pass" ? "Looks catalogue-ready" : "Needs edits"}</h2>{result.issues.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">{result.issues.map((issue) => <li key={issue}>• {issue}</li>)}</ul>}<div className="mt-5 flex flex-wrap gap-2"><button className={GHOST_BTN} type="button" onClick={() => { setWidth("1500"); setHeight("1500"); setFill("86"); setMargin("7"); setWhiteBg(true); }}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button><button className={PRIMARY_BTN} type="button" onClick={copy}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button></div></section></main>;
}
