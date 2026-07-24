import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const jsonHeaders = {
  Accept: "application/json",
  "User-Agent": "ALTFTool-Live-Utilities/1.0 (https://altftool.com)",
};

const timeoutFetch = async (url, options = {}, timeout = 9000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
      headers: { ...jsonHeaders, ...(options.headers || {}) },
    });
    if (!response.ok) throw new Error(`Upstream returned HTTP ${response.status}`);
    return response;
  } finally {
    clearTimeout(timer);
  }
};

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const isPrivateAddress = (address) => {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const normalized = address.toLowerCase().split("%")[0];
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
};

const assertPublicUrl = async (candidate) => {
  const url = new URL(candidate);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use an HTTP(S) URL");
  if (url.username || url.password || url.port) throw new Error("Credentials and custom ports are not accepted");
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((record) => isPrivateAddress(record.address)))
    throw new Error("Private, local, or reserved network destinations are blocked");
  return url;
};

const safeWebsiteFetch = async (candidate) => {
  let url = await assertPublicUrl(candidate);
  for (let redirects = 0; redirects <= 4; redirects += 1) {
    const response = await timeoutFetch(url, { method: "GET", redirect: "manual" });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) return response;
    url = await assertPublicUrl(new URL(location, url));
  }
  throw new Error("Too many redirects");
};

async function handle(slug, params) {
  const query = String(params.get("q") || "").trim();
  const latitude = number(params.get("lat"), 19.076);
  const longitude = number(params.get("lon"), 72.8777);

  if (slug === "isitdown-now") {
    const candidate = /^https?:\/\//i.test(query) ? query : `https://${query}`;
    const url = await assertPublicUrl(candidate);
    const started = Date.now();
    const response = await safeWebsiteFetch(url);
    await response.body?.cancel();
    return {
      summary: `${url.hostname} responded`,
      source: response.url,
      rows: [
        ["HTTP status", response.status],
        ["Response time", `${Date.now() - started} ms from ALTFTool server`],
        ["Final URL", response.url],
      ],
      note: "This checks from ALTFTool's server region, not every global network.",
    };
  }

  if (slug === "cloud-status-board") {
    const providers = [
      ["GitHub", "https://www.githubstatus.com/api/v2/status.json"],
      ["Cloudflare", "https://www.cloudflarestatus.com/api/v2/status.json"],
      ["OpenAI", "https://status.openai.com/api/v2/status.json"],
    ];
    const results = await Promise.allSettled(
      providers.map(async ([name, url]) => {
        const data = await (await timeoutFetch(url)).json();
        return [name, data.status?.description || "Unknown", data.status?.indicator || "unknown", url];
      }),
    );
    return {
      summary: "Current provider status",
      source: "Provider-operated status APIs",
      rows: results.map((result, index) =>
        result.status === "fulfilled"
          ? result.value
          : [providers[index][0], "Unavailable", "unknown", providers[index][1]],
      ),
    };
  }

  if (slug === "dns-propagation-checker") {
    const name = query || "altftool.com";
    const type = String(params.get("type") || "A").toUpperCase();
    const resolvers = [
      ["Google", `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`],
      ["Cloudflare", `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`],
    ];
    const results = await Promise.allSettled(
      resolvers.map(async ([provider, url]) => {
        const data = await (await timeoutFetch(url, { headers: { Accept: "application/dns-json" } })).json();
        return [
          provider,
          data.Status,
          (data.Answer || []).map((answer) => answer.data).join(", ") || "No answer",
          Math.min(...(data.Answer || []).map((answer) => answer.TTL).filter(Number.isFinite), 0),
        ];
      }),
    );
    return {
      summary: `${type} answers for ${name}`,
      source: "Google Public DNS and Cloudflare DNS-over-HTTPS",
      rows: results.map((result, index) =>
        result.status === "fulfilled"
          ? result.value
          : [resolvers[index][0], "Error", result.reason?.message || "Unavailable", "—"],
      ),
    };
  }

  if (slug === "domain-expiry-radar") {
    const domain = (query || "altftool.com").replace(/^https?:\/\//, "").split("/")[0];
    const data = await (await timeoutFetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`)).json();
    const events = Object.fromEntries((data.events || []).map((event) => [event.eventAction, event.eventDate]));
    return {
      summary: data.ldhName || domain,
      source: data.links?.find((link) => link.rel === "self")?.href || "RDAP bootstrap service",
      rows: [
        ["Registration", events.registration || "Not supplied"],
        ["Expiration", events.expiration || "Not supplied"],
        ["Last changed", events.lastChanged || "Not supplied"],
        ["Status", (data.status || []).join(", ") || "Not supplied"],
        ["Registrar", (data.entities || []).find((entity) => entity.roles?.includes("registrar"))?.handle || "Not supplied"],
      ],
    };
  }

  if (slug === "eth-gas-now") {
    const response = await timeoutFetch("https://cloudflare-eth.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
    });
    const data = await response.json();
    const base = Number(BigInt(data.result)) / 1e9;
    return {
      summary: `${base.toFixed(3)} gwei current RPC gas price`,
      source: "Cloudflare Ethereum Gateway",
      rows: [
        ["Slow estimate", `${(base * 0.9).toFixed(3)} gwei`],
        ["Normal estimate", `${base.toFixed(3)} gwei`],
        ["Fast estimate", `${(base * 1.2).toFixed(3)} gwei`],
        ["21,000 gas transfer", `${(base * 21000 / 1e9).toFixed(8)} ETH`],
      ],
      note: "Tiers are transparent multipliers around the current RPC gas price, not inclusion guarantees.",
    };
  }

  if (slug === "crypto-price-alarm") {
    const asset = (query || "bitcoin").toLowerCase().replace(/\s+/g, "-");
    const currency = String(params.get("currency") || "usd").toLowerCase();
    const data = await (
      await timeoutFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(asset)}&vs_currencies=${encodeURIComponent(currency)}&include_24hr_change=true&include_last_updated_at=true`,
      )
    ).json();
    const item = data[asset];
    if (!item) throw new Error("Asset ID was not found by the price source");
    return {
      summary: `${item[currency]} ${currency.toUpperCase()}`,
      source: "CoinGecko simple price API",
      rows: [
        ["Asset ID", asset],
        ["Price", item[currency]],
        ["24-hour change", `${number(item[`${currency}_24h_change`], 0).toFixed(3)}%`],
        ["Updated", new Date(item.last_updated_at * 1000).toISOString()],
      ],
    };
  }

  if (slug === "fx-rate-alerter") {
    const [base, quote] = (query || "USD/INR").toUpperCase().split(/[\/,\s-]+/);
    const data = await (
      await timeoutFetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(quote)}`)
    ).json();
    return {
      summary: `1 ${base} = ${data.rates?.[quote]} ${quote}`,
      source: "Frankfurter reference-rates API",
      rows: [["Base", base], ["Quote", quote], ["Rate date", data.date], ["Rate", data.rates?.[quote]]],
      note: "Reference rate, not a tradable quote. Banks and payment providers add spreads and fees.",
    };
  }

  if (slug === "release-watchtower") {
    const repository = (query || "vercel/next.js").replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    const data = await (
      await timeoutFetch(`https://api.github.com/repos/${repository}/releases/latest`, {
        headers: { "X-GitHub-Api-Version": "2026-03-10" },
      })
    ).json();
    return {
      summary: data.name || data.tag_name,
      source: data.html_url,
      rows: [
        ["Repository", repository],
        ["Tag", data.tag_name],
        ["Published", data.published_at],
        ["Prerelease", data.prerelease ? "Yes" : "No"],
        ["Assets", data.assets?.length || 0],
      ],
    };
  }

  if (slug === "quake-near-me") {
    const radius = Math.max(1, Math.min(20000, number(params.get("radius"), 500)));
    const minimum = Math.max(0, number(params.get("min"), 2.5));
    const endpoint = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");
    endpoint.search = new URLSearchParams({
      format: "geojson",
      latitude: String(latitude),
      longitude: String(longitude),
      maxradiuskm: String(radius),
      minmagnitude: String(minimum),
      orderby: "time",
      limit: "50",
    });
    const data = await (await timeoutFetch(endpoint, {}, 15000)).json();
    return {
      summary: `${data.metadata?.count || 0} recent earthquake(s)`,
      source: data.metadata?.url || endpoint.toString(),
      rows: (data.features || []).map((feature) => [
        feature.properties?.mag,
        feature.properties?.place,
        `${haversine(latitude, longitude, feature.geometry.coordinates[1], feature.geometry.coordinates[0]).toFixed(1)} km`,
        new Date(feature.properties?.time).toISOString(),
      ]),
    };
  }

  if (slug === "iss-pass-finder") {
    const current = await (
      await timeoutFetch("https://api.wheretheiss.at/v1/satellites/25544")
    ).json();
    const distance = haversine(latitude, longitude, current.latitude, current.longitude);
    return {
      summary: `ISS is ${distance.toFixed(0)} km from your ground coordinates`,
      source: "Where the ISS at? live position API",
      rows: [
        ["ISS latitude", current.latitude],
        ["ISS longitude", current.longitude],
        ["Altitude", `${number(current.altitude, 0).toFixed(1)} km`],
        ["Velocity", `${number(current.velocity, 0).toFixed(0)} km/h`],
        ["Visibility", current.visibility],
        ["Ground distance", `${distance.toFixed(1)} km`],
      ],
      note: "This live position check does not claim a visible pass; visibility also needs orbital prediction, twilight, horizon, and weather.",
    };
  }

  if (slug === "aqi-live-dashboard") {
    const data = await (
      await timeoutFetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`,
      )
    ).json();
    const current = data.current || {};
    return {
      summary: `AQI ${current.us_aqi ?? current.european_aqi ?? "unavailable"}`,
      source: "Open-Meteo Air Quality API using CAMS data",
      rows: Object.entries(current)
        .filter(([key]) => !["time", "interval"].includes(key))
        .map(([key, value]) => [key, value, data.current_units?.[key] || ""]),
    };
  }

  if (slug === "uv-safety-window") {
    const data = await (
      await timeoutFetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=uv_index,uv_index_clear_sky&forecast_days=3&timezone=auto`,
      )
    ).json();
    const rows = (data.hourly?.time || [])
      .map((time, index) => [time, data.hourly.uv_index[index], data.hourly.uv_index_clear_sky[index]])
      .filter((row) => row[1] <= 2)
      .slice(0, 48);
    return {
      summary: `${rows.length} comparatively low-UV forecast hour(s) shown`,
      source: "Open-Meteo forecast API",
      rows,
      note: "Low UV does not mean zero risk. Forecasts change; protection needs vary by skin, medicine, altitude, reflection, and exposure duration.",
    };
  }

  if (slug === "aurora-visibility-forecast") {
    const data = await (
      await timeoutFetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")
    ).json();
    const latest = data.at(-1);
    const kp = number(latest?.[1], 0);
    const absoluteLatitude = Math.abs(latitude);
    const estimatedBoundary = 67 - kp * 2.2;
    return {
      summary:
        absoluteLatitude >= estimatedBoundary
          ? "Geomagnetic latitude screening suggests possible aurora"
          : "Location is equatorward of the simple Kp visibility screen",
      source: "NOAA Space Weather Prediction Center Kp product",
      rows: [
        ["Latest UTC", latest?.[0]],
        ["Kp", kp],
        ["Location latitude", latitude],
        ["Simple latitude boundary", estimatedBoundary.toFixed(1)],
      ],
      note: "This is a rough latitude/Kp screen, not a visibility forecast. Darkness, clouds, moonlight, light pollution, magnetic latitude, and local horizon matter.",
    };
  }

  if (slug === "severe-weather-watch") {
    const point = await (
      await timeoutFetch(`https://api.weather.gov/points/${latitude},${longitude}`)
    ).json();
    const zone = point.properties?.forecastZone?.split("/").pop();
    const data = await (
      await timeoutFetch(`https://api.weather.gov/alerts/active?zone=${encodeURIComponent(zone)}`)
    ).json();
    return {
      summary: `${data.features?.length || 0} active official alert(s)`,
      source: "U.S. National Weather Service",
      rows: (data.features || []).map((feature) => [
        feature.properties?.severity,
        feature.properties?.event,
        feature.properties?.headline,
        feature.properties?.expires,
      ]),
      note: "NWS coverage is for the United States and territories. Elsewhere use the local national meteorological authority.",
    };
  }

  if (slug === "global-market-session-clock") {
    const now = new Date();
    const markets = [
      ["NSE", "Asia/Kolkata", 9 * 60 + 15, 15 * 60 + 30],
      ["London", "Europe/London", 8 * 60, 16 * 60 + 30],
      ["New York", "America/New_York", 9 * 60 + 30, 16 * 60],
      ["Tokyo", "Asia/Tokyo", 9 * 60, 15 * 60],
      ["Hong Kong", "Asia/Hong_Kong", 9 * 60 + 30, 16 * 60],
    ];
    const rows = markets.map(([name, zone, open, close]) => {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
          .formatToParts(now)
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, part.value]),
      );
      const minute = Number(parts.hour) * 60 + Number(parts.minute);
      const weekday = !["Sat", "Sun"].includes(parts.weekday);
      return [name, zone, `${parts.weekday} ${parts.hour}:${parts.minute}`, weekday && minute >= open && minute < close ? "Open" : "Closed", `${Math.floor(open / 60)}:${String(open % 60).padStart(2, "0")}–${Math.floor(close / 60)}:${String(close % 60).padStart(2, "0")}`];
    });
    return { summary: "Market clocks at request time", source: "IANA time zones and configured regular sessions", rows };
  }

  if (slug === "pin-code-region-lookup") {
    const pin = query.replace(/\D/g, "");
    if (!/^[1-9]\d{5}$/.test(pin)) throw new Error("Enter a valid six-digit Indian PIN");
    const data = await (
      await timeoutFetch(`https://api.postalpincode.in/pincode/${pin}`)
    ).json();
    const result = data?.[0];
    if (result?.Status !== "Success") throw new Error(result?.Message || "PIN was not found");
    return {
      summary: `${result.PostOffice?.length || 0} post office(s) for ${pin}`,
      source: "Postal PIN Code API; confirm against India Post's official PIN directory",
      rows: (result.PostOffice || []).map((office) => [
        office.Name,
        office.BranchType,
        office.District,
        office.State,
        office.Circle,
        office.DeliveryStatus,
      ]),
      note: "The lookup provider is not India Post. Confirm critical addressing data in India Post's official PIN Code directory.",
    };
  }

  if (slug === "product-recall-watchlist") {
    const term = query || "battery";
    const endpoint = new URL("https://www.saferproducts.gov/RestWebServices/Recall");
    endpoint.search = new URLSearchParams({ format: "json", RecallTitle: term });
    const data = await (await timeoutFetch(endpoint)).json();
    return {
      summary: `${Array.isArray(data) ? data.length : 0} U.S. CPSC recall result(s)`,
      source: endpoint.toString(),
      rows: (Array.isArray(data) ? data : []).slice(0, 50).map((recall) => [
        recall.RecallDate,
        recall.RecallTitle,
        recall.RecallNumber,
        recall.URL,
      ]),
      note: "Coverage is the U.S. CPSC database only. Search the official regulator in the country where the product was sold, and match model/serial details.",
    };
  }

  throw new Error("Unsupported live utility");
}

export async function GET(request) {
  try {
    const params = request.nextUrl.searchParams;
    const slug = String(params.get("slug") || "");
    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      ...(await handle(slug, params)),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Live source unavailable" },
      { status: 400 },
    );
  }
}
