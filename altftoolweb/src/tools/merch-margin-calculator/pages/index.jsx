"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shirt } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function calc(values) {
  const price = Number(values.price);
  const costs = Number(values.blank) + Number(values.print) + Number(values.packaging) + Number(values.shipping);
  const variableFees = price * ((Number(values.marketplacePct) + Number(values.paymentPct) + Number(values.returnsPct)) / 100);
  const fixedFees = Number(values.fixedFee);
  const profit = price - costs - variableFees - fixedFees;
  const margin = price > 0 ? profit / price : 0;
  const breakeven = (costs + fixedFees) / Math.max(0.01, 1 - (Number(values.marketplacePct) + Number(values.paymentPct) + Number(values.returnsPct)) / 100);
  return { costs, variableFees, fixedFees, profit, margin, breakeven, markup: costs > 0 ? profit / costs : 0 };
}

const DEFAULTS = { price: "34", blank: "8.5", print: "5.25", packaging: "1.2", shipping: "4.8", marketplacePct: "10", paymentPct: "3", fixedFee: "0.3", returnsPct: "4" };

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => calc(values), [values]);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const copyResult = async () => {
    const text = [`Merch Margin Calculator`, `Price ${USD.format(Number(values.price))}`, `Profit ${USD.format(result.profit)} (${(result.margin * 100).toFixed(1)}% margin)`, `Break-even price ${USD.format(result.breakeven)}`].join("\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><Shirt className="h-4 w-4" aria-hidden="true" />Merch economics</div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Merch Margin Calculator</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Calculate profit per merch unit after blank cost, print, shipping, marketplace fees, payment fees and expected returns.</p></header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-4 sm:grid-cols-3">{Object.entries({ price: "Sale price", blank: "Blank cost", print: "Print cost", packaging: "Packaging", shipping: "Shipping", marketplacePct: "Marketplace %", paymentPct: "Payment %", fixedFee: "Fixed fee", returnsPct: "Returns %" }).map(([key, label]) => <div key={key}><label className="block text-sm font-semibold" htmlFor={`merch-${key}`}>{label}</label><input id={`merch-${key}`} className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="0.01" value={values[key]} onChange={(event) => update(key, event.target.value)} /></div>)}</div></section>
      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-3 sm:grid-cols-4"><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Profit</p><p className={result.profit >= 0 ? "mt-1 font-semibold text-[var(--success)]" : "mt-1 font-semibold text-[var(--danger)]"}>{USD.format(result.profit)}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Margin</p><p className="mt-1 font-semibold">{(result.margin * 100).toFixed(1)}%</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Break-even</p><p className="mt-1 font-semibold">{USD.format(result.breakeven)}</p></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Fees</p><p className="mt-1 font-semibold">{USD.format(result.variableFees + result.fixedFees)}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button className={GHOST_BTN} type="button" onClick={() => setValues(DEFAULTS)}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button><button className={PRIMARY_BTN} type="button" onClick={copyResult}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button></div></section>
    </main>
  );
}
