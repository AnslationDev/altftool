"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Globe, MapPin, RotateCcw, Search } from "lucide-react";

import {
  buildMapLinks,
  classifyIp,
  ipv4Subnet,
  normaliseLookup,
} from "../lib";

const DEFAULTS = {
  address: "8.8.8.8",
  prefix: "24",
};

const LOOKUP_ENDPOINT = "https://ipapi.co";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const text = (value) => (value === null || value === undefined || value === "" ? DASH : String(value));

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold break-all text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [address, setAddress] = useState(DEFAULTS.address);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [copied, setCopied] = useState(false);
  const [lookup, setLookup] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);

  const info = useMemo(() => classifyIp(address), [address]);
  const hasError = Boolean(info.error);

  const subnet = useMemo(() => {
    if (hasError || info.version !== "IPv4") return null;
    const parsedPrefix = Number.parseInt(prefix, 10);
    if (!Number.isInteger(parsedPrefix)) {
      return { error: "Enter a prefix length between 0 and 32." };
    }
    return ipv4Subnet(info.address, parsedPrefix);
  }, [hasError, info, prefix]);

  const mapLinks = useMemo(() => {
    if (!lookup || lookup.latitude === null || lookup.longitude === null) return null;
    return buildMapLinks(lookup.latitude, lookup.longitude);
  }, [lookup]);

  useEffect(() => {
    setCopied(false);
  }, [address, prefix]);

  const runLookup = async (target) => {
    setLoading(true);
    setLookupError("");
    try {
      const path = target ? `${LOOKUP_ENDPOINT}/${encodeURIComponent(target)}/json/` : `${LOOKUP_ENDPOINT}/json/`;
      const response = await fetch(path, { headers: { Accept: "application/json" } });
      const payload = await response.json();
      const normalised = normaliseLookup(payload);
      if (normalised.error) {
        setLookup(null);
        setLookupError(normalised.error);
      } else {
        setLookup(normalised);
        if (!target && normalised.ip) setAddress(normalised.ip);
      }
    } catch {
      setLookup(null);
      setLookupError("Could not reach the lookup service. Check your connection or an ad blocker.");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "IP Address Finder",
      `Address: ${info.address}`,
      `Version: ${info.version}`,
      `Block: ${info.block ?? "not in a special-purpose range"} (${info.rfc})`,
      `Scope: ${info.scopeLabel}`,
      `Publicly routable: ${info.isRoutable ? "yes" : "no"}`,
      `Reverse DNS pointer: ${info.reversePointer ?? DASH}`,
    ];
    if (subnet && !subnet.error) {
      lines.push(
        `Subnet: ${subnet.cidr}`,
        `Mask: ${subnet.subnetMask}`,
        `Usable hosts: ${num(subnet.usableHosts)}`,
      );
    }
    if (lookup) {
      lines.push(
        `Location: ${[lookup.city, lookup.region, lookup.country].filter(Boolean).join(", ") || DASH}`,
        `ISP / org: ${text(lookup.org)}`,
        `ASN: ${text(lookup.asn)}`,
        `Timezone: ${text(lookup.timezone)}`,
      );
    }
    return lines.join("\n");
  }, [hasError, info, subnet, lookup]);

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
    setAddress(DEFAULTS.address);
    setPrefix(DEFAULTS.prefix);
    setLookup(null);
    setLookupError("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Network lookup
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">IP Address Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check any IPv4 or IPv6 address against the IANA special-purpose registries, work out its
          subnet and reverse-DNS name, then optionally pull the ISP, ASN, timezone and approximate
          location for it.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="ip-address">
            IP address
          </label>
          <input
            id="ip-address"
            className={`${INPUT_CLASS} mt-1 font-mono`}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="8.8.8.8 or 2001:4860:4860::8888"
            inputMode="text"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="ip-prefix">
            Subnet prefix length (IPv4)
          </label>
          <input
            id="ip-prefix"
            className={`${INPUT_CLASS} mt-1`}
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            type="number"
            min="0"
            max="32"
            step="1"
          />
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={() => runLookup(address.trim())} disabled={loading || hasError}>
            <Search className="h-4 w-4" aria-hidden="true" />
            {loading ? "Looking up…" : "Look up details"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => runLookup(null)} disabled={loading}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Use my IP
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {info.error}
          </p>
        ) : null}

        <p className="mt-3 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Address
        </p>
        <p className="mt-1 font-mono text-2xl leading-tight font-bold break-all sm:text-3xl">
          {hasError ? DASH : info.address}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : `${info.version} · ${info.scopeLabel}`}
        </p>

        <dl className="mt-4">
          <Row label="Registry block" value={hasError ? DASH : (info.block ?? "None — ordinary unicast")} />
          <Row label="Defined by" value={hasError ? DASH : info.rfc} />
          <Row
            label="Publicly routable"
            value={hasError ? DASH : info.isRoutable ? "Yes" : "No — stays inside the local network"}
          />
          {!hasError && info.version === "IPv4" ? (
            <>
              <Row label="Decimal (32-bit)" value={num(info.integer)} />
              <Row label="Hexadecimal" value={info.hex} />
              <Row label="Binary" value={<span className="font-mono text-xs">{info.binary}</span>} />
            </>
          ) : null}
          {!hasError && info.version === "IPv6" ? (
            <Row label="Expanded form" value={<span className="font-mono text-xs">{info.expanded}</span>} />
          ) : null}
          <Row
            label="Reverse DNS pointer"
            value={hasError ? DASH : <span className="font-mono text-xs">{text(info.reversePointer)}</span>}
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={copyResult} aria-label="Copy IP details to clipboard" disabled={hasError}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {!hasError && info.version === "IPv4" ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-lg font-semibold">Subnet</h2>
          {subnet?.error ? (
            <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              {subnet.error}
            </p>
          ) : null}
          <dl className="mt-3">
            <Row label="Network (CIDR)" value={subnet?.error ? DASH : subnet.cidr} />
            <Row label="Subnet mask" value={subnet?.error ? DASH : subnet.subnetMask} />
            <Row label="Wildcard mask" value={subnet?.error ? DASH : subnet.wildcardMask} />
            <Row label="Broadcast" value={subnet?.error ? DASH : subnet.broadcast} />
            <Row
              label="Host range"
              value={subnet?.error ? DASH : `${subnet.firstHost} – ${subnet.lastHost}`}
            />
            <Row label="Total addresses" value={subnet?.error ? DASH : num(subnet.totalAddresses)} />
            <Row label="Usable hosts" value={subnet?.error ? DASH : num(subnet.usableHosts)} />
          </dl>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Location, ISP and network owner</h2>
        {lookupError ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {lookupError}
          </p>
        ) : null}
        {!lookup && !lookupError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Press “Look up details” to query the public geolocation database for this address, or
            “Use my IP” to inspect your own connection. Everything above is calculated offline.
          </p>
        ) : null}
        {lookup ? (
          <dl className="mt-3">
            <Row label="Address returned" value={text(lookup.ip)} />
            <Row
              label="Location"
              value={[lookup.city, lookup.region, lookup.country].filter(Boolean).join(", ") || DASH}
            />
            <Row label="Postal code" value={text(lookup.postal)} />
            <Row label="ISP / organisation" value={text(lookup.org)} />
            <Row label="ASN" value={text(lookup.asn)} />
            <Row label="Timezone" value={text(lookup.timezone)} />
            <Row label="UTC offset" value={text(lookup.utcOffset)} />
            <Row label="Currency" value={text(lookup.currency)} />
            <Row label="Dialling code" value={text(lookup.callingCode)} />
            <Row
              label="Coordinates"
              value={
                lookup.latitude === null || lookup.longitude === null
                  ? DASH
                  : `${lookup.latitude}, ${lookup.longitude}`
              }
            />
          </dl>
        ) : null}
        {mapLinks && !mapLinks.error ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <a className={GHOST_BTN} href={mapLinks.openStreetMap} target="_blank" rel="noreferrer noopener">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              OpenStreetMap
            </a>
            <a className={GHOST_BTN} href={mapLinks.googleMaps} target="_blank" rel="noreferrer noopener">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Google Maps
            </a>
          </div>
        ) : null}
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          IP geolocation resolves to the network operator’s registered area, not a street address.
          Expect city-level accuracy at best, and none at all behind a VPN or carrier-grade NAT.
        </p>
      </section>
    </main>
  );
}
