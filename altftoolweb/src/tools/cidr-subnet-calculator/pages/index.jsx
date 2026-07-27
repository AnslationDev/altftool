"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, RotateCcw } from "lucide-react";

import { computeSubnet } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRESETS = ["10.0.0.0/8", "172.16.0.0/12", "192.168.1.0/24", "192.168.1.130/26", "10.0.0.0/31"];

const DEFAULTS = { cidr: "192.168.1.130/26" };
const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [cidr, setCidr] = useState(DEFAULTS.cidr);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeSubnet({ cidr }), [cidr]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `CIDR: ${result.normalizedCidr}`,
      `Netmask: ${result.netmask}`,
      `Wildcard: ${result.wildcardMask}`,
      `Network: ${result.network}`,
      `Broadcast: ${result.broadcast ?? "none"}`,
      `Usable range: ${result.firstUsable} – ${result.lastUsable}`,
      `Usable hosts: ${NUM.format(result.usableHosts)}`,
      `Total addresses: ${NUM.format(result.totalAddresses)}`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCidr(DEFAULTS.cidr);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Network address", DASH],
        ["Broadcast address", DASH],
        ["Subnet mask", DASH],
        ["Wildcard mask", DASH],
        ["First usable host", DASH],
        ["Last usable host", DASH],
        ["Total addresses", DASH],
      ]
    : [
        ["Network address", result.network],
        ["Broadcast address", result.broadcast ?? "none (see note)"],
        ["Subnet mask", result.netmask],
        ["Wildcard mask", result.wildcardMask],
        ["First usable host", result.firstUsable],
        ["Last usable host", result.lastUsable],
        ["Total addresses", NUM.format(result.totalAddresses)],
        ["Host bits", String(result.hostBits)],
        ["Address type", result.addressClass],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Network className="h-4 w-4" aria-hidden="true" />
          Networking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CIDR Subnet Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter any IPv4 CIDR block to get the network, broadcast, usable host range, subnet mask
          and wildcard mask — with correct handling of /31 point-to-point and /32 host routes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="csc-cidr">
          IPv4 CIDR block
        </label>
        <input
          id="csc-cidr"
          className={`mt-2 font-mono ${INPUT_CLASS}`}
          type="text"
          inputMode="text"
          value={cidr}
          onChange={(event) => setCidr(event.target.value)}
          placeholder="192.168.1.0/24"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCidr(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Usable hosts
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.usableHosts)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.hostNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the subnet breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-mono font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Usable hosts = 2^(32−prefix) − 2 for /30 and larger; /31 links carry 2 usable addresses per
        RFC 3021 and /32 is a single host route. Wildcard masks are the bitwise inverse of the
        netmask, as used in Cisco ACLs and OSPF statements.
      </p>
    </main>
  );
}
