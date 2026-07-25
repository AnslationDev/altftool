"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  Network,
  RotateCcw,
  Search,
} from "lucide-react";

const LOOKUP_TIMEOUT_MS = 12_000;

function isIpv4(value) {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d{1,3}$/.test(part) &&
        Number(part) >= 0 &&
        Number(part) <= 255,
    )
  );
}

function isIpv6(value) {
  return (
    value.includes(":") &&
    /^[0-9a-f:.]+$/i.test(value) &&
    value.split(":").length >= 3
  );
}

function isValidIp(value) {
  return !value || isIpv4(value) || isIpv6(value);
}

function mapDetails(data) {
  return {
    ip: data.ip || "",
    type: data.type || "",
    city: data.city || "",
    region: data.region || "",
    country: data.country || "",
    countryCode: data.country_code || "",
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    postal: data.postal || "",
    timezone: data.timezone?.id || "",
    currency: data.currency?.code || "",
    callingCode: data.calling_code || "",
    asn: data.connection?.asn || "",
    isp: data.connection?.isp || data.connection?.org || "",
    domain: data.connection?.domain || "",
  };
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-(--border) py-3 last:border-b-0">
      <dt className="text-sm text-(--muted-foreground)">{label}</dt>
      <dd
        className={`max-w-[65%] break-words text-right text-sm font-semibold text-(--foreground) ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "Not available"}
      </dd>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, children }) {
  return (
    <section className="border border-(--border) bg-(--card) p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon aria-hidden="true" className="h-5 w-5 text-(--primary)" />
        <h2 className="text-base font-bold text-(--foreground)">{title}</h2>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

export default function IPChecker() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const normalizedQuery = query.trim();
  const valid = isValidIp(normalizedQuery);
  const mapUrl = useMemo(() => {
    if (
      !data ||
      !Number.isFinite(data.latitude) ||
      !Number.isFinite(data.longitude)
    ) {
      return "";
    }

    const latitudeDelta = 0.08;
    const longitudeDelta = 0.12;
    const bbox = [
      data.longitude - longitudeDelta,
      data.latitude - latitudeDelta,
      data.longitude + longitudeDelta,
      data.latitude + latitudeDelta,
    ].join(",");
    const params = new URLSearchParams({
      bbox,
      layer: "mapnik",
      marker: `${data.latitude},${data.longitude}`,
    });
    return `https://www.openstreetmap.org/export/embed.html?${params}`;
  }, [data]);

  async function checkIp() {
    if (!valid) {
      setError("Enter a valid IPv4 or IPv6 address.");
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      LOOKUP_TIMEOUT_MS,
    );

    try {
      const target = normalizedQuery
        ? `/${encodeURIComponent(normalizedQuery)}`
        : "/";
      const response = await fetch(`https://ipwho.is${target}`, {
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "The IP address could not be found.");
      }

      setData(mapDetails(payload));
    } catch (lookupError) {
      setData(null);
      setError(
        lookupError?.name === "AbortError"
          ? "The lookup took too long. Please try again."
          : lookupError?.message || "The lookup service is temporarily unavailable.",
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  function reset() {
    setQuery("");
    setData(null);
    setError("");
    setCopied(false);
  }

  async function copyIp() {
    if (!data?.ip) return;
    await navigator.clipboard.writeText(data.ip);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-(--background) px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center border border-(--border) bg-(--card)">
            <Globe2 aria-hidden="true" className="h-6 w-6 text-(--primary)" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-(--foreground) sm:text-4xl">
            IP Address Checker
          </h1>
          <p className="mt-3 text-base text-(--muted-foreground)">
            Inspect an IPv4 or IPv6 address, or leave the field empty to check
            your current public IP.
          </p>
        </header>

        <section
          aria-labelledby="ip-lookup-title"
          className="border border-(--border) bg-(--card) p-4 sm:p-6"
        >
          <h2 id="ip-lookup-title" className="sr-only">
            IP lookup
          </h2>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              checkIp();
            }}
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">IP address</span>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setError("");
                }}
                placeholder="Example: 8.8.8.8"
                aria-invalid={!valid}
                aria-describedby={error ? "ip-lookup-error" : undefined}
                className="h-11 w-full border border-(--input) bg-(--background) px-3 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !valid}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {loading ? (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <Search aria-hidden="true" className="h-4 w-4" />
                )}
                {loading ? "Checking" : "Check IP"}
              </button>
              <button
                type="button"
                onClick={reset}
                title="Reset lookup"
                aria-label="Reset lookup"
                className="grid h-11 w-11 place-items-center border border-(--border) bg-(--background) text-(--foreground) transition hover:bg-(--muted)"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div aria-live="polite">
            {error ? (
              <div
                id="ip-lookup-error"
                role="alert"
                className="mt-4 flex items-start gap-2 border border-(--destructive)/30 bg-(--destructive)/10 p-3 text-sm text-(--destructive)"
              >
                <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
        </section>

        {data ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryCard icon={MapPin} title="Location">
                <DetailRow label="Country" value={data.country} />
                <DetailRow label="Region" value={data.region} />
                <DetailRow label="City" value={data.city} />
                <DetailRow label="Postal code" value={data.postal} />
              </SummaryCard>

              <SummaryCard icon={Network} title="Network">
                <DetailRow label="IP address" value={data.ip} mono />
                <DetailRow label="Address type" value={data.type} />
                <DetailRow label="ISP" value={data.isp} />
                <DetailRow label="ASN" value={data.asn} mono />
              </SummaryCard>

              <SummaryCard icon={Clock3} title="Regional details">
                <DetailRow label="Timezone" value={data.timezone} />
                <DetailRow label="Currency" value={data.currency} />
                <DetailRow
                  label="Calling code"
                  value={data.callingCode ? `+${data.callingCode}` : ""}
                />
                <DetailRow
                  label="Coordinates"
                  value={
                    Number.isFinite(data.latitude) &&
                    Number.isFinite(data.longitude)
                      ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
                      : ""
                  }
                  mono
                />
              </SummaryCard>
            </div>

            <div className="grid gap-4 border border-(--border) bg-(--card) p-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
              <div className="min-h-72 overflow-hidden bg-(--muted)">
                {mapUrl ? (
                  <iframe
                    src={mapUrl}
                    title={`Approximate location for ${data.ip}`}
                    className="h-72 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="grid h-72 place-items-center px-6 text-center text-sm text-(--muted-foreground)">
                    Map coordinates are unavailable for this address.
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-5 p-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                    Lookup result
                  </p>
                  <p className="mt-2 break-all font-mono text-lg font-bold text-(--foreground)">
                    {data.ip}
                  </p>
                  <p className="mt-2 text-sm text-(--muted-foreground)">
                    IP geolocation is approximate and should not be used as a
                    precise physical address.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={copyIp}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-(--border) bg-(--background) px-3 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted)"
                  >
                    <Copy aria-hidden="true" className="h-4 w-4" />
                    {copied ? "Copied" : "Copy IP"}
                  </button>
                  {mapUrl ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=10/${data.latitude}/${data.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 bg-(--primary) px-3 text-sm font-semibold text-(--primary-foreground) transition hover:opacity-90"
                    >
                      Open map
                      <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 border border-dashed border-(--border) bg-(--card) px-6 py-12 text-center">
            <Globe2
              aria-hidden="true"
              className="mx-auto h-7 w-7 text-(--muted-foreground)"
            />
            <p className="mt-3 text-sm font-semibold text-(--foreground)">
              Lookup results will appear here
            </p>
            <p className="mt-1 text-sm text-(--muted-foreground)">
              No account or API key is required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
