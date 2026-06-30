"use client";

// ALTF Engine — Meta SEO Management shared UI primitives.
// All styling uses semantic design tokens per master.md (light + dark, AA).

import { useState } from "react";
import { X, Plus } from "lucide-react";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-surface-soft transition disabled:opacity-50 disabled:cursor-not-allowed";
export const BTN_DANGER =
  "inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-danger/30 bg-danger-soft text-danger hover:bg-danger/10 transition disabled:opacity-50 disabled:cursor-not-allowed";
export const BTN_GHOST =
  "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md text-muted hover:text-foreground hover:bg-surface-soft transition";
export const INPUT =
  "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export function Field({ label, hint, htmlFor, children, error, right }) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {right}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-muted">{hint}</span>}
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

/** Color-coded counter: green inside recommended range, amber/red outside. */
export function CharCount({ value = "", min, max }) {
  const len = (value || "").length;
  let tone = "text-muted";
  if (max && len > max) tone = "text-danger";
  else if (min && len > 0 && len < min) tone = "text-warning";
  else if (len > 0) tone = "text-success";
  return (
    <span className={`text-xs tabular-nums ${tone}`}>
      {len}
      {max ? `/${max}` : ""}
    </span>
  );
}

export function TextInput({ id, value, onChange, placeholder, maxLength, type = "text", disabled }) {
  return (
    <input
      id={id}
      type={type}
      value={value ?? ""}
      maxLength={maxLength}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT}
    />
  );
}

export function TextArea({ id, value, onChange, placeholder, maxLength, rows = 3, mono, disabled }) {
  return (
    <textarea
      id={id}
      value={value ?? ""}
      maxLength={maxLength}
      rows={rows}
      disabled={disabled}
      spellCheck={!mono}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${INPUT} resize-y ${mono ? "font-mono text-[13px] leading-relaxed" : ""}`}
    />
  );
}

export function Select({ id, value, onChange, options = [], disabled }) {
  return (
    <select
      id={id}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT} cursor-pointer`}
    >
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}

export function Toggle({ checked, onChange, label, hint, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left transition hover:bg-surface-soft disabled:opacity-50"
    >
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          checked ? "bg-primary" : "bg-border-strong"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/** Tag/keyword editor backed by a string[] value. */
export function KeywordsInput({ value = [], onChange, placeholder = "Add keyword and press Enter" }) {
  const [draft, setDraft] = useState("");
  const list = Array.isArray(value) ? value : [];

  function add(raw) {
    const parts = String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...new Set([...list, ...parts])];
    onChange(next);
    setDraft("");
  }
  function remove(idx) {
    onChange(list.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-2 focus-within:ring-2 focus-within:ring-primary/30">
      <div className="flex flex-wrap gap-1.5">
        {list.map((kw, i) => (
          <span
            key={`${kw}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-1 text-xs font-medium text-primary"
          >
            {kw}
            <button type="button" onClick={() => remove(i)} className="hover:text-danger" aria-label={`Remove ${kw}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && list.length) {
              remove(list.length - 1);
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={list.length ? "" : placeholder}
          className="min-w-[140px] flex-1 bg-transparent px-1.5 py-1 text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}

export function SectionCard({ title, icon: Icon, description, children, actions }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            {Icon && <Icon className="h-4 w-4 text-muted" />}
            {title}
          </h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Banner({ tone = "info", children }) {
  const tones = {
    info: "bg-primary-soft text-primary border-primary/20",
    success: "bg-success-soft text-success border-success/20",
    warning: "bg-warning-soft text-warning border-warning/20",
    danger: "bg-danger-soft text-danger border-danger/20",
  };
  if (!children) return null;
  return (
    <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${tones[tone] || tones.info}`}>{children}</div>
  );
}

export function AddRowButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} className={BTN_SECONDARY}>
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}
