"use client";

import { useState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";

/**
 * Renders a tool's declared options as simple controls. When a tool declares
 * no options the drawer renders nothing, so the shell stays clean.
 *
 * @param {{
 *   schema: import("../_lib/types.js").ToolOption[],
 *   values: Record<string, unknown>,
 *   onChange: (key: string, value: unknown) => void,
 * }} props
 */
export default function SettingsDrawer({ schema, values, onChange }) {
  const [open, setOpen] = useState(true);
  if (!Array.isArray(schema) || schema.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        suppressHydrationWarning
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-foreground sm:text-base">
          <Settings2 className="h-[18px] w-[18px] text-muted-foreground" /> Options
        </span>
        <ChevronDown className={`h-[18px] w-[18px] text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="flex flex-col gap-x-8 gap-y-3.5 border-t border-border px-5 pb-5 pt-4 lg:flex-row lg:flex-wrap lg:items-center">
          {schema.map((opt) => (
            <OptionControl key={opt.key} option={opt} value={values[opt.key]} onChange={onChange} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OptionControl({ option, value, onChange }) {
  if (option.type === "boolean") {
    const checked = Boolean(value);
    return (
      <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={() => onChange(option.key, !checked)}
        />
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
            checked ? "border-primary bg-primary" : "border-border-strong bg-surface"
          }`}
        >
          {checked ? (
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M5 10.5l3.2 3.2L15 6.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </span>
        {option.label}
      </label>
    );
  }

  if (option.type === "select") {
    return (
      <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
        <span>{option.label}</span>
        <div className="relative">
          <select
            value={String(value ?? "")}
            onChange={(e) => {
              const choice = option.choices?.find((c) => String(c.value) === e.target.value);
              onChange(option.key, choice ? choice.value : e.target.value);
            }}
            suppressHydrationWarning
            className="appearance-none rounded-xl border border-border bg-surface py-2 pl-3.5 pr-9 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {(option.choices || []).map((c) => (
              <option key={String(c.value)} value={String(c.value)}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </label>
    );
  }

  return (
    <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
      <span>{option.label}</span>
      <input
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(option.key, e.target.value)}
        suppressHydrationWarning
        className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
