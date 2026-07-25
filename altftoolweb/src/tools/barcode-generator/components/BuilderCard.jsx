"use client";

import { useState } from "react";
import { Check, Info, Sparkles } from "lucide-react";
import { FORMAT_GROUPS, SIZE_PRESETS } from "../utils/barcodeFormats";

const STEPS = [
  { id: 1, label: "Enter Data" },
  { id: 2, label: "Customize" },
  { id: 3, label: "Generate" },
];

function ColorField({ label, value, onChange }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color picker`}
          className="h-6 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (/^#?[0-9a-f]{0,6}$/i.test(next)) onChange(next.startsWith("#") ? next : `#${next}`);
          }}
          aria-label={`${label} hex value`}
          className="w-full min-w-0 bg-transparent font-mono text-xs font-semibold text-foreground outline-none"
        />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, asSwitch }) {
  if (asSwitch) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span
          aria-hidden="true"
          className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform ${
              checked ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
        {label}
      </button>
    );
  }
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-current"
      />
      {label}
    </label>
  );
}

export default function BuilderCard({
  data,
  onDataChange,
  format,
  onFormatChange,
  formatInfo,
  sizeKey,
  onSizeChange,
  lineColor,
  onLineColorChange,
  background,
  onBackgroundChange,
  margin,
  onMarginChange,
  showText,
  onShowTextChange,
  showCode,
  onShowCodeChange,
  quietZone,
  onQuietZoneChange,
  onLoadExample,
  onGenerate,
  generated,
}) {
  const [step, setStep] = useState(1);
  const maxLength = formatInfo.maxLength;

  return (
    <section aria-label="Barcode builder" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {/* Step tabs */}
      <div role="tablist" aria-label="Builder steps" className="mb-5 flex border-b border-border">
        {STEPS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={step === id}
            onClick={() => setStep(id)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              step === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                step === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {id}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step 1 — Enter data */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="barcode-data" className="text-sm font-semibold text-foreground">
                Enter text, numbers or data to encode
              </label>
              <button
                type="button"
                onClick={onLoadExample}
                className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Use example
              </button>
            </div>
            <textarea
              id="barcode-data"
              value={data}
              maxLength={maxLength}
              onChange={(event) => onDataChange(event.target.value)}
              spellCheck={false}
              rows={3}
              className="w-full resize-y rounded-xl border border-border bg-background p-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder={formatInfo.example}
            />
            <p className="mt-1 text-right text-[11px] tabular-nums text-muted-foreground">
              {data.length} / {maxLength}
            </p>
          </div>

          <div>
            <label htmlFor="barcode-format" className="mb-1.5 block text-sm font-semibold text-foreground">
              Select Barcode Format
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <select
                id="barcode-format"
                value={format}
                onChange={(event) => onFormatChange(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {FORMAT_GROUPS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.formats.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="flex items-start gap-2 rounded-xl bg-primary/10 p-3">
                <Info aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-xs leading-5 text-foreground">{formatInfo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Customize */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="min-w-0">
              <label htmlFor="barcode-size" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Size
              </label>
              <select
                id="barcode-size"
                value={sizeKey}
                onChange={(event) => onSizeChange(event.target.value)}
                className="min-h-9 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <ColorField label="Color" value={lineColor} onChange={onLineColorChange} />
            <ColorField label="Background" value={background} onChange={onBackgroundChange} />
            <div className="min-w-0">
              <label htmlFor="barcode-margin" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Margin
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5">
                <input
                  id="barcode-margin"
                  type="number"
                  min={0}
                  max={40}
                  step={2}
                  value={margin}
                  onChange={(event) => onMarginChange(Math.max(0, Math.min(40, Number(event.target.value) || 0)))}
                  className="w-full min-w-0 bg-transparent text-xs font-semibold tabular-nums text-foreground outline-none"
                />
                <span className="text-[11px] text-muted-foreground">px</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Toggle label="Show Text" checked={showText} onChange={onShowTextChange} asSwitch />
            <Toggle label="Show Code" checked={showCode} onChange={onShowCodeChange} />
            <Toggle label="Add Quiet Zone" checked={quietZone} onChange={onQuietZoneChange} />
          </div>
        </div>
      )}

      {/* Step 3 — Generate */}
      {step === 3 && (
        <dl className="space-y-2 rounded-xl border border-border bg-background p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Data</dt>
            <dd className="max-w-60 truncate font-mono font-semibold text-foreground">{data || "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Format</dt>
            <dd className="font-semibold text-foreground">{formatInfo.label}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-semibold text-foreground">{SIZE_PRESETS[sizeKey].label}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Colors</dt>
            <dd className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
              <span aria-hidden="true" className="h-3.5 w-3.5 rounded border border-border" style={{ background: lineColor }} />
              {lineColor.toUpperCase()} on
              <span aria-hidden="true" className="h-3.5 w-3.5 rounded border border-border" style={{ background }} />
              {background.toUpperCase()}
            </dd>
          </div>
          <p className="pt-1 text-xs leading-5 text-muted-foreground">
            Generating validates the data, refreshes the preview, and saves this barcode to your
            history.
          </p>
        </dl>
      )}

      <button
        type="button"
        onClick={onGenerate}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
      >
        {generated ? (
          <Check aria-hidden="true" size={16} />
        ) : (
          <Sparkles aria-hidden="true" size={16} />
        )}
        {generated ? "Generated & saved!" : "Generate Barcode"}
      </button>
    </section>
  );
}
