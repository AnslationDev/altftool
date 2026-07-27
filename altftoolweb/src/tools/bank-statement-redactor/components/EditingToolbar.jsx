"use client";

import {
  Banknote,
  Copy,
  CreditCard,
  EyeOff,
  Globe2,
  Hash,
  Landmark,
  MapPin,
  MousePointer2,
  Plus,
  ReceiptText,
  Trash2,
  UserRound,
} from "lucide-react";
import { BANK_STATEMENT_PRESETS, REDACTION_MODES } from "../lib/redactorModel.mjs";

const PRESET_ICONS = {
  name: UserRound,
  address: MapPin,
  account: Hash,
  ifsc: Landmark,
  iban: Globe2,
  cards: CreditCard,
  balances: Banknote,
  transactions: ReceiptText,
};

function PercentInput({ id, label, value, onChange }) {
  return (
    <label htmlFor={id} className="block text-[11px] font-bold text-[var(--muted-foreground)]">
      {label}
      <span className="relative mt-1 block">
        <input
          id={id}
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={Math.round(value * 1000) / 10}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 pr-7 font-mono text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[10px] font-bold text-[var(--muted-foreground)]">
          %
        </span>
      </span>
    </label>
  );
}

export default function EditingToolbar({
  activeToolMode,
  onChangeToolMode,
  selectedRedactionMode,
  onChangeRedactionMode,
  selectedRectangle,
  onUpdateSelected,
  onRemoveSelected,
  onAddPreset,
  onAddCustom,
  onClearPage,
  onCopyToAllPages,
  pageCount,
  activePageRectanglesCount,
}) {
  return (
    <div className="space-y-5">
      {/* 1. Redaction Mask Visual Style */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-[var(--foreground)]">Redaction Mask Style</h2>
        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
          Choose visual mask appearance applied during export flattening
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {Object.values(REDACTION_MODES).map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => onChangeRedactionMode(mode.key)}
              className={`flex flex-col rounded-2xl border p-3 text-left transition-all ${
                selectedRedactionMode === mode.key
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary-soft)] shadow-2xs"
                  : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span className="text-xs font-bold text-[var(--foreground)]">{mode.label}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-[var(--muted-foreground)]">
                {mode.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Selected Redaction Mask Controls */}
      {selectedRectangle && (
        <section className="rounded-3xl border border-[var(--primary)] bg-[var(--primary-soft)]/20 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--primary)]/20 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-[var(--foreground)]">Selected Mask Properties</h3>
              <p className="text-[11px] font-mono text-[var(--muted-foreground)]">ID: {selectedRectangle.id}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveSelected(selectedRectangle.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 text-xs font-bold text-[var(--danger)] transition-all hover:bg-[var(--danger)] hover:text-white"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)]">
                Label / Category Tag
              </label>
              <input
                type="text"
                value={selectedRectangle.label}
                onChange={(e) => onUpdateSelected({ label: e.target.value })}
                className="mt-1 h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            {selectedRectangle.mode === "custom" && (
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)]">
                  Custom Placeholder Text
                </label>
                <input
                  type="text"
                  value={selectedRectangle.customText || ""}
                  placeholder="e.g. [CONFIDENTIAL]"
                  onChange={(e) => onUpdateSelected({ customText: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <PercentInput
                id="red-x"
                label="Left (X)"
                value={selectedRectangle.x}
                onChange={(x) => onUpdateSelected({ x })}
              />
              <PercentInput
                id="red-y"
                label="Top (Y)"
                value={selectedRectangle.y}
                onChange={(y) => onUpdateSelected({ y })}
              />
              <PercentInput
                id="red-w"
                label="Width"
                value={selectedRectangle.width}
                onChange={(width) => onUpdateSelected({ width })}
              />
              <PercentInput
                id="red-h"
                label="Height"
                value={selectedRectangle.height}
                onChange={(height) => onUpdateSelected({ height })}
              />
            </div>

            {pageCount > 1 && (
              <button
                type="button"
                onClick={onCopyToAllPages}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--foreground)] shadow-2xs transition-all hover:bg-[var(--surface-soft)]"
              >
                <Copy className="size-4 text-[var(--primary)]" />
                <span>Apply position to all {pageCount} pages</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 3. Preset Regions & Manual Controls */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-[var(--foreground)]">Statement Region Presets</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Drop bounding boxes over common statement sections
            </p>
          </div>
          <MousePointer2 className="size-4 text-[var(--primary)]" aria-hidden="true" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {Object.values(BANK_STATEMENT_PRESETS).map((preset) => {
            const Icon = PRESET_ICONS[preset.key] || EyeOff;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => onAddPreset(preset.key)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs font-bold text-[var(--foreground)] shadow-2xs transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
              >
                <Icon className="size-4 text-[var(--primary)]" aria-hidden="true" />
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onAddCustom}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] px-3 text-xs font-extrabold text-[var(--primary)] shadow-2xs transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>Custom Mask</span>
          </button>
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onClearPage}
            disabled={activePageRectanglesCount === 0}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--danger)] transition-all hover:bg-[var(--danger-soft)] disabled:opacity-40"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            <span>Clear page masks ({activePageRectanglesCount})</span>
          </button>
        </div>
      </section>
    </div>
  );
}
