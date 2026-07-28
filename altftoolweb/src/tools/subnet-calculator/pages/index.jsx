"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, RotateCcw } from "lucide-react";
import { calculateSubnet, splitSubnet } from "../lib";

const DASH = "—";

const PREFIX_OPTIONS = Array.from({ length: 33 }, (_, i) => i);

const intFmt = new Intl.NumberFormat("en-US");

function Row({ label, value, mono = true }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd
        className={
          mono
            ? "font-mono text-sm break-all text-[var(--foreground)]"
            : "text-sm text-[var(--foreground)]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export default function SubnetCalculatorPage() {
  const [address, setAddress] = useState("192.168.1.10");
  const [prefix, setPrefix] = useState("24");
  const [splitPrefix, setSplitPrefix] = useState("26");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculateSubnet({ address, prefix }), [address, prefix]);

  const split = useMemo(() => {
    if (result.error) return null;
    return splitSubnet({ address, prefix }, splitPrefix);
  }, [address, prefix, splitPrefix, result.error]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Subnet ${result.cidr}`,
      `Netmask: ${result.netmask}`,
      `Wildcard: ${result.wildcard}`,
      `Network: ${result.network}`,
      `Broadcast: ${result.broadcast ?? "none (RFC 3021)"}`,
      `Host range: ${result.firstHost} – ${result.lastHost}`,
      `Usable hosts: ${intFmt.format(result.usableHosts)}`,
      `Total addresses: ${intFmt.format(result.totalAddresses)}`,
      `Scope: ${result.scope}${result.scopeBlock ? ` (${result.scopeBlock}, ${result.scopeReference})` : ""}`,
    ].join("\n");
  }, [hasError, result]);

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleReset() {
    setAddress("192.168.1.10");
    setPrefix("24");
    setSplitPrefix("26");
    setCopied(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <Network className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            IPv4 Subnet Calculator
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Enter an address and a prefix to get the network, broadcast, usable host range and
            host count.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ip-address" className="text-sm font-medium text-[var(--foreground)]">
            IPv4 address (CIDR allowed)
          </label>
          <input
            id="ip-address"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="192.168.1.10 or 10.0.0.5/22"
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ip-prefix" className="text-sm font-medium text-[var(--foreground)]">
            Prefix length
          </label>
          <select
            id="ip-prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {PREFIX_OPTIONS.map((p) => (
              <option key={p} value={String(p)}>
                /{p}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy subnet summary to clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to the default address and prefix"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Network</p>
        <p className="mt-1 font-mono text-3xl leading-tight font-semibold break-all text-[var(--foreground)]">
          {hasError ? DASH : result.cidr}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : `${intFmt.format(result.usableHosts)} usable hosts`}
        </p>

        {!hasError && result.note ? (
          <p className="mt-3 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            {result.note}
          </p>
        ) : null}

        <dl className="mt-4">
          <Row label="Netmask" value={hasError ? DASH : result.netmask} />
          <Row label="Wildcard mask" value={hasError ? DASH : result.wildcard} />
          <Row label="Network address" value={hasError ? DASH : result.network} />
          <Row
            label="Broadcast address"
            value={hasError ? DASH : (result.broadcast ?? "none")}
          />
          <Row label="First usable host" value={hasError ? DASH : result.firstHost} />
          <Row label="Last usable host" value={hasError ? DASH : result.lastHost} />
          <Row
            label="Total addresses"
            value={hasError ? DASH : intFmt.format(result.totalAddresses)}
          />
          <Row label="Host bits" value={hasError ? DASH : String(result.hostBits)} />
          <Row
            label="Scope"
            mono={false}
            value={
              hasError
                ? DASH
                : result.scopeBlock
                  ? `${result.scope} — ${result.scopeBlock} (${result.scopeReference})`
                  : result.scope
            }
          />
          <Row
            label="Classful"
            mono={false}
            value={
              hasError
                ? DASH
                : `Class ${result.class}${
                    result.classDefaultPrefix ? ` (default /${result.classDefaultPrefix})` : ""
                  }`
            }
          />
        </dl>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left font-mono text-xs">
            <tbody>
              <tr>
                <th scope="row" className="py-1 pr-4 font-sans font-normal text-[var(--muted-foreground)]">
                  Address
                </th>
                <td className="py-1 whitespace-nowrap text-[var(--foreground)]">
                  {hasError ? DASH : result.addressBinary}
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-1 pr-4 font-sans font-normal text-[var(--muted-foreground)]">
                  Netmask
                </th>
                <td className="py-1 whitespace-nowrap text-[var(--foreground)]">
                  {hasError ? DASH : result.maskBinary}
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-1 pr-4 font-sans font-normal text-[var(--muted-foreground)]">
                  Network
                </th>
                <td className="py-1 whitespace-nowrap text-[var(--foreground)]">
                  {hasError ? DASH : result.networkBinary}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Split into subnets</h2>
        <div className="mt-3 flex flex-col gap-1.5 sm:max-w-xs">
          <label htmlFor="split-prefix" className="text-sm font-medium text-[var(--foreground)]">
            New prefix length
          </label>
          <select
            id="split-prefix"
            value={splitPrefix}
            onChange={(e) => setSplitPrefix(e.target.value)}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {PREFIX_OPTIONS.map((p) => (
              <option key={p} value={String(p)}>
                /{p}
              </option>
            ))}
          </select>
        </div>

        {split && split.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {split.error}
          </p>
        ) : null}

        {split && !split.error ? (
          <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-[var(--card)] text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Subnet
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Host range
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Hosts
                  </th>
                </tr>
              </thead>
              <tbody>
                {split.subnets.map((s) => (
                  <tr key={s.cidr} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-mono whitespace-nowrap text-[var(--foreground)]">
                      {s.cidr}
                    </td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap text-[var(--muted-foreground)]">
                      {s.firstHost} – {s.lastHost}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-[var(--foreground)]">
                      {intFmt.format(s.usableHosts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
