"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

const InputField = React.memo(({ label, value, onChange, placeholder }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const copyToClipboard = useCallback(async () => {
    if (!navigator?.clipboard || !value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          defaultValue={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 font-mono text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

InputField.displayName = 'InputField';

export default function IpConverter({ ip, number, displayIp, displayNumber, onIpChange, onNumberChange }) {
  return (
    <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Conversion Fields
      </h2>

      <div className="space-y-4">
        <InputField
          label="IP Address"
          value={ip || displayIp}
          onChange={onIpChange}
          placeholder="e.g., 192.168.1.1"
        />

        <InputField
          label="Decimal Number"
          value={number || displayNumber}
          onChange={onNumberChange}
          placeholder="e.g., 3232235777"
        />
      </div>
    </section>
  );
}
