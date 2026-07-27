"use client";

import {
  Banknote,
  Coins,
  DollarSign,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { SAMPLE_RATE_PRESETS } from "../lib/analyzeUsage.mjs";

export default function RateConfigurator({
  rateSource,
  onRateSourceChange,
  currency,
  onCurrencyChange,
  onApplyPreset,
}) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-sm font-extrabold text-[var(--foreground)]">Token Pricing Rates</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Rates per 1 Million Tokens ($/1M tokens)
          </p>
        </div>
        <Coins className="size-4 text-[var(--primary)]" aria-hidden="true" />
      </div>

      {/* Preset Buttons */}
      <div className="mt-3.5">
        <label className="block text-[11px] font-bold text-[var(--muted-foreground)]">
          Quick Preset Rates
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {Object.values(SAMPLE_RATE_PRESETS).map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => onApplyPreset(preset.rates)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 text-[11px] font-bold text-[var(--foreground)] transition-all hover:border-[var(--primary)] hover:bg-[var(--surface)]"
            >
              <Zap className="size-3 text-[var(--primary)]" />
              <span className="truncate">{preset.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rates JSON Input */}
      <div className="mt-3.5">
        <label className="block text-[11px] font-bold text-[var(--muted-foreground)]">
          Rate Table JSON (Model input &amp; output per million)
        </label>
        <textarea
          className="mt-1 h-36 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 font-mono text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)]"
          value={rateSource}
          onChange={(e) => onRateSourceChange(e.target.value)}
          placeholder={`{\n  "gpt-4o": { "inputPerMillion": 2.5, "outputPerMillion": 10 },\n  "*": { "inputPerMillion": 2.5, "outputPerMillion": 10 }\n}`}
          spellCheck="false"
        />
      </div>

      {/* Currency Code Selector */}
      <div className="mt-3.5">
        <label className="block text-[11px] font-bold text-[var(--muted-foreground)]">
          Display Currency Code
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 font-mono text-xs font-bold uppercase text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            value={currency}
            maxLength={3}
            onChange={(e) => onCurrencyChange(e.target.value.replace(/[^A-Za-z]/g, ""))}
            placeholder="USD"
          />
          {["USD", "EUR", "GBP", "INR"].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onCurrencyChange(code)}
              className={`rounded-xl px-3 text-xs font-extrabold transition-all ${
                currency.toUpperCase() === code
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary-soft)]/20 p-3.5 text-xs font-medium leading-relaxed text-[var(--foreground)]">
        💡 <strong>Zero Built-in Assumptions:</strong> Provider API rates change frequently. Supply your exact contracted rates per million tokens.
      </div>
    </section>
  );
}
