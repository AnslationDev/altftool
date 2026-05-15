"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Code2,
  Compass,
  Database,
  Globe,
  KeyRound,
  Loader2,
  Map,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const PROVIDERS = [
  { value: "auto", label: "Auto", detail: "Try IPWho.is, then IPinfo, then ipapi" },
  { value: "ipwhois", label: "IPWho.is", detail: "No key required" },
  { value: "ipinfo", label: "IPinfo", detail: "Optional token supported" },
  { value: "ipapi", label: "ipapi.co", detail: "Fallback provider" },
];

const CLOUD_HINTS = [
  "amazon",
  "aws",
  "azure",
  "cloudflare",
  "digitalocean",
  "google cloud",
  "hosting",
  "linode",
  "ovh",
  "server",
  "vultr",
];

function sanitizeTarget(value = "") {
  const input = value.trim();
  if (!input) return "";

  try {
    const url = input.includes("://") ? new URL(input) : new URL(`https://${input}`);
    return url.hostname.replace(/^\[|\]$/g, "");
  } catch {
    return input
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/^\[|\]$/g, "")
      .trim();
  }
}

function isValidIPv4(value) {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      if (part.length > 1 && part.startsWith("0")) return false;
      const number = Number(part);
      return number >= 0 && number <= 255;
    })
  );
}

function isValidIPv6(value) {
  if (!value.includes(":")) return false;
  if (!/^[0-9a-f:.]+$/i.test(value)) return false;
  if ((value.match(/::/g) || []).length > 1) return false;

  const withoutIpv4 = value.includes(".") ? value.replace(/\d+\.\d+\.\d+\.\d+$/, "0:0") : value;
  const groups = withoutIpv4.split(":").filter(Boolean);
  return groups.length <= 8 && groups.every((group) => /^[0-9a-f]{1,4}$/i.test(group));
}

function isDomain(value) {
  return /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(value);
}

function classifyTarget(value) {
  if (isValidIPv4(value)) return "ipv4";
  if (isValidIPv6(value)) return "ipv6";
  if (isDomain(value)) return "domain";
  return "invalid";
}

function getPrivateSignal(ip) {
  if (isValidIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return "Private 10.0.0.0/8";
    if (a === 172 && b >= 16 && b <= 31) return "Private 172.16.0.0/12";
    if (a === 192 && b === 168) return "Private 192.168.0.0/16";
    if (a === 127) return "Loopback";
    if (a === 169 && b === 254) return "Link-local";
    if (a === 100 && b >= 64 && b <= 127) return "Carrier-grade NAT";
    if (a === 0) return "This network";
    if (a >= 224) return "Multicast or reserved";
  }

  const lower = ip.toLowerCase();
  if (lower === "::1") return "Loopback";
  if (lower.startsWith("fc") || lower.startsWith("fd")) return "Unique local IPv6";
  if (lower.startsWith("fe80")) return "Link-local IPv6";
  return "";
}

function formatCoordinate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return Number(value).toFixed(5);
}

function hasCoordinates(result) {
  return (
    Number.isFinite(Number(result?.latitude)) &&
    Number.isFinite(Number(result?.longitude))
  );
}

function copyText(value, onDone) {
  navigator.clipboard?.writeText(value);
  onDone();
}

function createRiskSignals(result) {
  const signals = [];
  const privateSignal = getPrivateSignal(result.ip || "");

  if (privateSignal) {
    signals.push({
      label: privateSignal,
      level: "info",
      detail: "This address is not expected to geolocate like a public internet IP.",
    });
  }

  const orgText = `${result.org || ""} ${result.isp || ""} ${result.domain || ""}`.toLowerCase();
  const matchedCloud = CLOUD_HINTS.find((hint) => orgText.includes(hint));
  if (matchedCloud) {
    signals.push({
      label: "Cloud or hosting signal",
      level: "medium",
      detail: `Provider text contains "${matchedCloud}". This can indicate hosting, CDN, or infrastructure use.`,
    });
  }

  if (result.anycast) {
    signals.push({
      label: "Anycast IP",
      level: "info",
      detail: "Anycast locations may show a provider location rather than the exact user location.",
    });
  }

  if (!hasCoordinates(result)) {
    signals.push({
      label: "Coordinates unavailable",
      level: "low",
      detail: "The provider did not return precise latitude and longitude fields.",
    });
  }

  if (!signals.length) {
    signals.push({
      label: "No obvious network flags",
      level: "low",
      detail: "No private, cloud, hosting, or anycast signal was detected from available fields.",
    });
  }

  return signals;
}

function normalizeIpWhois(data) {
  if (!data?.success) {
    throw new Error(data?.message || "IPWho.is could not lookup this target.");
  }

  return {
    provider: "IPWho.is",
    ip: data.ip,
    type: data.type,
    continent: data.continent,
    country: data.country,
    countryCode: data.country_code,
    flag: data.flag?.emoji,
    region: data.region,
    city: data.city,
    postal: data.postal,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone?.id,
    timezoneAbbr: data.timezone?.abbr,
    utcOffset: data.timezone?.utc,
    callingCode: data.calling_code,
    capital: data.capital,
    borders: data.borders,
    asn: data.connection?.asn ? `AS${data.connection.asn}` : "",
    org: data.connection?.org,
    isp: data.connection?.isp,
    domain: data.connection?.domain,
    raw: data,
  };
}

function normalizeIpInfo(data) {
  if (data?.error) {
    throw new Error(data.error.message || data.error.title || "IPinfo lookup failed.");
  }

  const [latitude, longitude] = String(data.loc || "")
    .split(",")
    .map((part) => Number(part));
  const orgMatch = String(data.org || "").match(/^(AS\d+)\s+(.*)$/);

  return {
    provider: "IPinfo",
    ip: data.ip,
    hostname: data.hostname,
    city: data.city,
    region: data.region,
    country: data.country,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    postal: data.postal,
    timezone: data.timezone,
    asn: orgMatch?.[1] || "",
    org: orgMatch?.[2] || data.org,
    isp: orgMatch?.[2] || data.org,
    anycast: data.anycast,
    raw: data,
  };
}

function normalizeIpApi(data) {
  if (data?.error || data?.reason) {
    throw new Error(data.message || data.reason || "ipapi.co lookup failed.");
  }

  return {
    provider: "ipapi.co",
    ip: data.ip,
    type: data.version ? `IPv${data.version}` : "",
    city: data.city,
    region: data.region,
    country: data.country_name || data.country,
    countryCode: data.country_code,
    postal: data.postal,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    utcOffset: data.utc_offset,
    callingCode: data.country_calling_code,
    asn: data.asn,
    org: data.org,
    isp: data.org,
    raw: data,
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}

async function resolveDomain(domain) {
  const queries = [
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=AAAA`,
  ];

  for (const url of queries) {
    const data = await fetchJson(url);
    const answer = data.Answer?.find((item) => item.data && !item.data.endsWith("."));
    if (answer?.data) return answer.data;
  }

  throw new Error("Could not resolve this domain to a public IP.");
}

async function lookupIp(ip, provider, token) {
  const attempts =
    provider === "auto" ? ["ipwhois", "ipinfo", "ipapi"] : [provider];
  const errors = [];

  for (const attempt of attempts) {
    try {
      if (attempt === "ipwhois") {
        return normalizeIpWhois(
          await fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`),
        );
      }

      if (attempt === "ipinfo") {
        const suffix = token ? `?token=${encodeURIComponent(token)}` : "";
        return normalizeIpInfo(
          await fetchJson(`https://ipinfo.io/${encodeURIComponent(ip)}/json${suffix}`),
        );
      }

      if (attempt === "ipapi") {
        return normalizeIpApi(
          await fetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`),
        );
      }
    } catch (error) {
      errors.push(`${attempt}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | ") || "Lookup failed.");
}

async function prepareTarget(input) {
  const target = sanitizeTarget(input);
  const type = classifyTarget(target);

  if (type === "invalid") {
    throw new Error("Enter a valid IPv4, IPv6, domain, or URL.");
  }

  if (type === "domain") {
    const resolvedIp = await resolveDomain(target);
    return { target, type, ip: resolvedIp };
  }

  const privateSignal = getPrivateSignal(target);
  if (privateSignal) {
    throw new Error(`${privateSignal} address. Enter a public IP for geolocation.`);
  }

  return { target, type, ip: target };
}

export default function MainComponent() {
  const [query, setQuery] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [provider, setProvider] = useState("auto");
  const [apiToken, setApiToken] = useState("");
  const [result, setResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState("");

  const signals = useMemo(() => (result ? createRiskSignals(result) : []), [result]);
  const localTime = useMemo(() => {
    if (!result?.timezone) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: result.timezone,
      }).format(new Date());
    } catch {
      return "N/A";
    }
  }, [result]);

  const hasMapCoordinates = hasCoordinates(result);
  const coordinates =
    hasMapCoordinates
      ? `${formatCoordinate(result.latitude)}, ${formatCoordinate(result.longitude)}`
      : "";

  const googleMapUrl = coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`
    : "";
  const osmUrl = coordinates
    ? `https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=10/${result.latitude}/${result.longitude}`
    : "";
  const osmEmbedUrl = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(result.longitude) - 0.4}%2C${Number(result.latitude) - 0.25}%2C${Number(result.longitude) + 0.4}%2C${Number(result.latitude) + 0.25}&layer=mapnik&marker=${result.latitude}%2C${result.longitude}`
    : "";

  const setCopy = (label) => {
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const lookupTarget = async (input, options = {}) => {
    const prepared = await prepareTarget(input);
    const data = await lookupIp(prepared.ip, provider, apiToken.trim());
    return {
      ...data,
      input: prepared.target,
      resolvedFromDomain: prepared.type === "domain" ? prepared.target : "",
    };
  };

  const handleLookup = async (input = query) => {
    setLoading(true);
    setError("");
    setStatus("");
    setResult(null);

    try {
      const data = await lookupTarget(input);
      setResult(data);
      setQuery(data.input || data.ip);
      setStatus(`Lookup complete via ${data.provider}.`);
    } catch (err) {
      setError(err.message || "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMyIp = async () => {
    setLoading(true);
    setError("");
    setStatus("Detecting your public IP...");

    try {
      const data = await fetchJson("https://api.ipify.org?format=json");
      setQuery(data.ip);
      const lookup = await lookupTarget(data.ip);
      setResult(lookup);
      setStatus(`Your public IP is ${data.ip}.`);
    } catch (err) {
      setError(err.message || "Could not detect your IP.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLookup = async () => {
    const items = [...new Set(
      bulkInput
        .split(/[\n, ]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    )].slice(0, 12);

    if (!items.length) {
      setError("Paste up to 12 IP addresses or domains for bulk lookup.");
      return;
    }

    setBulkLoading(true);
    setError("");
    setStatus("");
    setBulkResults([]);

    const rows = [];
    for (const item of items) {
      try {
        const data = await lookupTarget(item);
        rows.push({ ok: true, input: item, data });
      } catch (err) {
        rows.push({ ok: false, input: item, error: err.message });
      }
      setBulkResults([...rows]);
    }

    setStatus(`Bulk lookup finished for ${rows.length} target(s).`);
    setBulkLoading(false);
  };

  const copyJson = () => {
    if (!result) return;
    copyText(JSON.stringify(result.raw, null, 2), () => setCopy("json"));
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="heading">IP Geolocation Lookup</h1>
        <p className="description mt-3">
          Lookup public IP location, ISP, ASN, timezone, coordinates, map links,
          and network signals from multiple providers.
        </p>
      </div>

      <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_220px_180px]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-(--foreground)">
              IP address, domain, or URL
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleLookup();
              }}
              placeholder="8.8.8.8, 2001:4860:4860::8888, or example.com"
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-3 text-(--foreground) outline-none transition focus:border-(--primary)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-(--foreground)">
              Provider
            </span>
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-3 text-(--foreground) outline-none transition focus:border-(--primary)"
            >
              {PROVIDERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => handleLookup()}
              disabled={loading || !query.trim()}
              className="btn-primary inline-flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Lookup
            </button>
            <button
              type="button"
              onClick={handleMyIp}
              disabled={loading}
              className="btn-secondary inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Globe className="h-4 w-4" />
              My IP
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_280px] 2xl:items-end">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-(--foreground)">
              <KeyRound className="h-4 w-4 text-(--primary)" />
              Optional IPinfo token
            </span>
            <input
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              placeholder="Only used for IPinfo provider or Auto fallback"
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-3 text-(--foreground) outline-none transition focus:border-(--primary)"
            />
          </label>
          <div className="rounded-lg border border-(--border) bg-(--background) p-3 text-xs leading-5 text-(--muted-foreground)">
            {PROVIDERS.find((item) => item.value === provider)?.detail}
            <br />
            Token stays in this browser session and is not saved by the tool.
          </div>
        </div>
      </section>

      {(error || status) && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            error
              ? "border-red-500/40 bg-red-500/10 text-red-600"
              : "border-green-500/40 bg-green-500/10 text-green-700"
          }`}
        >
          {error ? (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{error || status}</p>
        </div>
      )}

      {result && (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-(--section-highlight) px-2 py-1 text-xs font-semibold text-(--primary)">
                      {result.provider}
                    </span>
                    {result.flag && <span className="text-xl">{result.flag}</span>}
                    {result.resolvedFromDomain && (
                      <span className="rounded-lg border border-(--border) px-2 py-1 text-xs text-(--muted-foreground)">
                        Resolved from {result.resolvedFromDomain}
                      </span>
                    )}
                  </div>
                  <h2 className="break-all font-mono text-2xl font-bold text-(--foreground)">
                    {result.ip}
                  </h2>
                  <p className="mt-2 text-sm text-(--muted-foreground)">
                    {[result.city, result.region, result.country || result.countryCode]
                      .filter(Boolean)
                      .join(", ") || "Location unavailable"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyText(result.ip, () => setCopy("ip"))}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Clipboard className="h-4 w-4" />
                    {copied === "ip" ? "Copied" : "Copy IP"}
                  </button>
                  <button
                    type="button"
                    onClick={copyJson}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Code2 className="h-4 w-4" />
                    {copied === "json" ? "Copied" : "Copy JSON"}
                  </button>
                </div>
              </div>

              <div className="tool-card-grid mt-6">
                {[
                  ["Country", result.country || result.countryCode || "N/A"],
                  ["Region", result.region || "N/A"],
                  ["City", result.city || "N/A"],
                  ["Postal", result.postal || "N/A"],
                  ["Latitude", formatCoordinate(result.latitude)],
                  ["Longitude", formatCoordinate(result.longitude)],
                  ["Timezone", result.timezone || "N/A"],
                  ["Local time", localTime],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-(--border) bg-(--background) p-3"
                  >
                    <p className="text-xs text-(--muted-foreground)">{label}</p>
                    <p className="mt-1 break-words text-sm font-semibold text-(--foreground)">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Network Details
                  </h2>
                  <p className="text-sm text-(--muted-foreground)">
                    Provider, ASN, organization, and domain metadata.
                  </p>
                </div>
              </div>

              <div className="tool-card-grid">
                {[
                  ["ASN", result.asn || "N/A"],
                  ["ISP", result.isp || "N/A"],
                  ["Organization", result.org || "N/A"],
                  ["Network domain", result.domain || "N/A"],
                  ["Hostname", result.hostname || "N/A"],
                  ["IP type", result.type || (isValidIPv6(result.ip) ? "IPv6" : "IPv4")],
                  ["UTC offset", result.utcOffset || "N/A"],
                  ["Calling code", result.callingCode || "N/A"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-(--border) bg-(--background) p-3"
                  >
                    <p className="text-xs text-(--muted-foreground)">{label}</p>
                    <p className="mt-1 break-words text-sm font-semibold text-(--foreground)">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Network Signals
                  </h2>
                  <p className="text-sm text-(--muted-foreground)">
                    These are hints from returned network fields, not a fraud verdict.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {signals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-lg border border-(--border) bg-(--background) p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          signal.level === "medium"
                            ? "text-orange-600"
                            : signal.level === "info"
                              ? "text-blue-600"
                              : "text-green-600"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-(--foreground)">
                          {signal.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">
                          {signal.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-(--foreground)">Raw JSON</h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    Provider response for debugging and developer workflows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRaw((value) => !value)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  {showRaw ? "Hide JSON" : "Show JSON"}
                </button>
              </div>

              {showRaw && (
                <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-(--border) bg-(--background) p-4 text-xs leading-6 text-(--foreground)">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-(--card) border border-(--border) rounded-lg p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Map Location
                  </h2>
                  <p className="text-sm text-(--muted-foreground)">
                    Approximate provider coordinates.
                  </p>
                </div>
              </div>

              {osmEmbedUrl ? (
                <div className="overflow-hidden rounded-lg border border-(--border) bg-(--background)">
                  <iframe
                    title="IP map"
                    src={osmEmbedUrl}
                    className="h-72 w-full"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-sm text-(--muted-foreground)">
                  Coordinates unavailable
                </div>
              )}

              <div className="tool-compact-grid mt-4">
                <a
                  href={googleMapUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`btn-secondary inline-flex items-center justify-center gap-2 ${
                    !googleMapUrl ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Compass className="h-4 w-4" />
                  Google
                </a>
                <a
                  href={osmUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`btn-secondary inline-flex items-center justify-center gap-2 ${
                    !osmUrl ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Map className="h-4 w-4" />
                  OSM
                </a>
              </div>
            </section>

            <section className="bg-(--card) border border-(--border) rounded-lg p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Quick Copy
                  </h2>
                  <p className="text-sm text-(--muted-foreground)">
                    Grab common values.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  ["coords", "Coordinates", coordinates || "N/A"],
                  ["isp", "ISP", result.isp || "N/A"],
                  ["asn", "ASN", result.asn || "N/A"],
                  ["timezone", "Timezone", result.timezone || "N/A"],
                ].map(([key, label, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => copyText(value, () => setCopy(key))}
                    disabled={value === "N/A"}
                    className="flex w-full items-center justify-between rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-left text-sm transition hover:border-(--primary) disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-(--muted-foreground)">{label}</span>
                    <span className="max-w-40 truncate font-semibold text-(--foreground)">
                      {copied === key ? "Copied" : value}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}

      <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-(--foreground)">Bulk Lookup</h2>
            <p className="mt-1 text-sm text-(--muted-foreground)">
              Paste up to 12 IP addresses or domains, separated by commas, spaces, or new lines.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBulkLookup}
            disabled={bulkLoading || !bulkInput.trim()}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bulkLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Run Bulk Lookup
          </button>
        </div>

        <textarea
          value={bulkInput}
          onChange={(event) => setBulkInput(event.target.value)}
          placeholder={"8.8.8.8\n1.1.1.1\nexample.com"}
          className="min-h-28 w-full rounded-lg border border-(--border) bg-(--background) px-3 py-3 text-(--foreground) outline-none transition focus:border-(--primary)"
        />

        {bulkResults.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-(--border)">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-(--background) text-(--muted-foreground)">
                <tr>
                  <th className="px-4 py-3 font-medium">Input</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">ISP</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bulkResults.map((row) => (
                  <tr key={row.input} className="border-t border-(--border)">
                    <td className="px-4 py-3 font-mono">{row.input}</td>
                    <td className="px-4 py-3 font-mono">
                      {row.ok ? row.data.ip : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {row.ok
                        ? [row.data.city, row.data.region, row.data.country || row.data.countryCode]
                            .filter(Boolean)
                            .join(", ") || "N/A"
                        : "-"}
                    </td>
                    <td className="max-w-56 truncate px-4 py-3">
                      {row.ok ? row.data.isp || row.data.org || "N/A" : "-"}
                    </td>
                    <td className="px-4 py-3">{row.ok ? row.data.provider : "-"}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        row.ok ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {row.ok ? "OK" : row.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
