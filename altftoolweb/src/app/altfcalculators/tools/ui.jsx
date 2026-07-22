"use client";

// Shared UI primitives for calculator tools. Keeps every calculator concise and
// visually consistent. All styling lives in altfcalculators.css (afc- prefix).

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

// A labelled control row. `hint` shows small helper text under the control.
export function Field({ label, hint, htmlFor, children }) {
  return (
    <label className="afc-field" htmlFor={htmlFor}>
      {label ? <span className="afc-field-label">{label}</span> : null}
      {children}
      {hint ? <span className="afc-field-hint">{hint}</span> : null}
    </label>
  );
}

// A numeric input with an optional unit suffix and prefix (e.g. currency).
export function NumberInput({ prefix, suffix, className = "", ...props }) {
  return (
    <span className={`afc-input-wrap ${className}`}>
      {prefix ? <span className="afc-input-affix afc-input-prefix">{prefix}</span> : null}
      <input type="number" inputMode="decimal" className="afc-input" {...props} />
      {suffix ? <span className="afc-input-affix afc-input-suffix">{suffix}</span> : null}
    </span>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input type="text" className={`afc-input ${className}`} {...props} />;
}

export function TextArea({ className = "", rows = 4, ...props }) {
  return <textarea className={`afc-input afc-textarea ${className}`} rows={rows} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <span className={`afc-select-wrap ${className}`}>
      <select className="afc-select" {...props}>{children}</select>
    </span>
  );
}

// A segmented toggle (radio-style tabs). options: [{label, value}]
export function Segmented({ options, value, onChange, name }) {
  return (
    <div className="afc-segmented" role="tablist" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`afc-seg-btn ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Larger card-style radio group. options: [{label, value, desc}]
export function RadioCards({ options, value, onChange, name }) {
  return (
    <div className="afc-radio-cards" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`afc-radio-card ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="afc-radio-card-label">{opt.label}</span>
          {opt.desc ? <span className="afc-radio-card-desc">{opt.desc}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button type="button" className={`afc-btn afc-btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Read-only output with a copy-to-clipboard button.
export function CopyField({ value, label, multiline = false }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value ?? ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className={`afc-copyfield ${multiline ? "multiline" : ""}`}>
      {multiline ? (
        <textarea className="afc-input afc-code" readOnly value={value ?? ""} rows={6} aria-label={label} />
      ) : (
        <input className="afc-input afc-code" readOnly value={value ?? ""} aria-label={label} />
      )}
      <button type="button" className="afc-copy-btn" onClick={copy} aria-label="Copy">
        {copied ? <Check size={15} /> : <Copy size={15} />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

// The highlighted result area shown below the inputs.
export function ResultPanel({ title = "Result", children, muted = false }) {
  return (
    <div className={`afc-result ${muted ? "muted" : ""}`}>
      {title ? <div className="afc-result-title">{title}</div> : null}
      {children}
    </div>
  );
}

// A big headline number with a label.
export function ResultStat({ label, value, sub, accent = false }) {
  return (
    <div className={`afc-stat ${accent ? "accent" : ""}`}>
      <div className="afc-stat-value">{value}</div>
      <div className="afc-stat-label">{label}</div>
      {sub ? <div className="afc-stat-sub">{sub}</div> : null}
    </div>
  );
}

// A simple label:value row for detail breakdowns.
export function ResultRow({ label, value, strong = false }) {
  return (
    <div className={`afc-result-row ${strong ? "strong" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Layout helpers.
export function Grid({ cols = 2, children }) {
  return <div className={`afc-grid afc-grid-${cols}`}>{children}</div>;
}

export function CalcNote({ children }) {
  return <p className="afc-note">{children}</p>;
}
