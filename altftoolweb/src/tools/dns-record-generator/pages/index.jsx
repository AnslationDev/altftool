"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, RotateCcw } from "lucide-react";

import { RECORD_TYPES, buildRecord } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TYPE_HINTS = {
  A: { valueLabel: "IPv4 address", placeholder: "192.0.2.10" },
  AAAA: { valueLabel: "IPv6 address", placeholder: "2001:db8::1" },
  CNAME: { valueLabel: "Target hostname", placeholder: "app.example.net" },
  TXT: { valueLabel: "Text value", placeholder: "v=spf1 include:_spf.example.com ~all" },
  SRV: { valueLabel: "Target hostname", placeholder: "sipserver.example.com" },
  ALIAS: { valueLabel: "Target hostname", placeholder: "lb.example-cdn.net" },
};

const DEFAULTS = {
  type: "A",
  name: "www",
  ttl: "3600",
  value: "192.0.2.10",
  priority: "10",
  weight: "5",
  port: "5060",
};

const DASH = "—";

export default function ToolHome() {
  const [type, setType] = useState(DEFAULTS.type);
  const [name, setName] = useState(DEFAULTS.name);
  const [ttl, setTtl] = useState(DEFAULTS.ttl);
  const [value, setValue] = useState(DEFAULTS.value);
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [port, setPort] = useState(DEFAULTS.port);
  const [copied, setCopied] = useState(false);

  const isSrv = type === "SRV";
  const hints = TYPE_HINTS[type];

  const result = useMemo(
    () => buildRecord({ type, name, ttl: ttl.trim() === "" ? NaN : Number(ttl), value, priority, weight, port }),
    [type, name, ttl, value, priority, weight, port],
  );
  const hasError = Boolean(result.error);

  const switchType = (next) => {
    setType(next);
    if (next === "SRV" && !name.startsWith("_")) setName("_sip._tcp");
    if (next !== "SRV" && name.startsWith("_")) setName("www");
    const samples = {
      A: "192.0.2.10",
      AAAA: "2001:db8::1",
      CNAME: "app.example.net",
      TXT: "v=spf1 include:_spf.example.com ~all",
      SRV: "sipserver.example.com",
      ALIAS: "lb.example-cdn.net",
    };
    setValue(samples[next]);
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.zoneLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setType(DEFAULTS.type);
    setName(DEFAULTS.name);
    setTtl(DEFAULTS.ttl);
    setValue(DEFAULTS.value);
    setPriority(DEFAULTS.priority);
    setWeight(DEFAULTS.weight);
    setPort(DEFAULTS.port);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          DNS zone files
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">DNS Record Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build A, AAAA, CNAME, TXT, SRV and ALIAS records in RFC 1035 zone-file syntax, with every
          field validated — IP formats, label limits, TTL range and the CNAME-at-apex rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="drg-type">
              Record type
            </label>
            <select
              id="drg-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={type}
              onChange={(event) => switchType(event.target.value)}
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drg-name">
              Name (host / owner)
            </label>
            <input
              id="drg-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder={isSrv ? "_sip._tcp" : "www, @, *.stage"}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drg-ttl">
              TTL (seconds)
            </label>
            <input
              id="drg-ttl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={ttl}
              onChange={(event) => setTtl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drg-value">
              {hints.valueLabel}
            </label>
            <input
              id="drg-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder={hints.placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          {isSrv ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="drg-priority">
                  Priority (0-65535)
                </label>
                <input
                  id="drg-priority"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="65535"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="drg-weight">
                  Weight (0-65535)
                </label>
                <input
                  id="drg-weight"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="65535"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="drg-port">
                  Port (1-65535)
                </label>
                <input
                  id="drg-port"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="65535"
                  value={port}
                  onChange={(event) => setPort(event.target.value)}
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated record
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${type} record`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated zone-file record"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy record"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <code className="whitespace-pre font-mono text-sm">
            {hasError ? DASH : result.zoneLine}
          </code>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Type", hasError ? DASH : result.type],
            ["Name", hasError ? DASH : result.name],
            ["TTL", hasError ? DASH : `${result.ttl} seconds`],
            ["Record data", hasError ? DASH : result.rdata],
          ].map(([label, val]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="min-w-0 break-all text-right font-semibold">{val}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Output uses BIND-style zone-file syntax. Some hosted DNS panels ask for the name, TTL and
        value in separate fields — copy the individual parts from the breakdown above in that case.
      </p>
    </main>
  );
}
