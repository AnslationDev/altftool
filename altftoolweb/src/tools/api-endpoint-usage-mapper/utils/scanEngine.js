import yaml from "js-yaml";
import { METHODS, parseLine } from "./endpointAnalyzer.js";

// ---------------------------------------------------------------------------
// Path normalization — collapse concrete ids and {params} into :param tokens
// ---------------------------------------------------------------------------

export function normalizeTemplatePath(path) {
  if (!path) return "/";
  const clean = `/${String(path).trim()}`.replace(/\/{2,}/g, "/").split(/[?#]/)[0];
  return clean
    .split("/")
    .map((part) => {
      if (!part) return part;
      const template = part.match(/^\{(.+)\}$/);
      if (template) return `:${template[1]}`;
      if (/^\d+$/.test(part)) return ":id";
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part)) return ":id";
      if (/^(?:[a-z]+_)?[0-9a-f]{12,}$/i.test(part) && /\d/.test(part)) return ":id";
      if (/^[a-z]{2,8}_[a-z0-9_]{2,}$/i.test(part) && /\d/.test(part)) return ":id";
      return part;
    })
    .join("/") || "/";
}

function extractDomain(url) {
  const match = String(url || "").match(/https?:\/\/([^/\s"'`]+)/i);
  return match ? match[1].toLowerCase() : "";
}

// ---------------------------------------------------------------------------
// Structured-source detectors. Each returns an array of records:
//   { method, template, domain, summary, declared, ts, status, latency }
// `declared` records come from specs (no traffic); usage records add counts.
// ---------------------------------------------------------------------------

function fromOpenApi(spec) {
  const domain = extractDomain(spec.servers?.[0]?.url || spec.host ? `https://${spec.host || ""}` : "");
  const serverDomain = extractDomain(spec.servers?.[0]?.url) || (spec.host ? String(spec.host).toLowerCase() : "");
  const records = [];
  Object.entries(spec.paths || {}).forEach(([path, operations]) => {
    if (!operations || typeof operations !== "object") return;
    Object.entries(operations).forEach(([maybeMethod, operation]) => {
      const method = maybeMethod.toUpperCase();
      if (!METHODS.includes(method)) return;
      records.push({
        method,
        template: normalizeTemplatePath(path),
        domain: serverDomain || domain,
        summary: operation?.summary || operation?.description?.split("\n")[0] || "",
        declared: true,
      });
    });
  });
  return records;
}

function walkPostmanItems(items, records) {
  items.forEach((item) => {
    if (Array.isArray(item.item)) return walkPostmanItems(item.item, records);
    const request = item.request;
    if (!request) return;
    const urlObj = typeof request === "string" ? request : request.url;
    let rawPath = "";
    let domain = "";
    if (typeof urlObj === "string") {
      rawPath = urlObj;
      domain = extractDomain(urlObj);
    } else if (urlObj) {
      rawPath = `/${(urlObj.path || []).filter(Boolean).join("/")}`;
      domain = Array.isArray(urlObj.host) ? urlObj.host.join(".").toLowerCase() : String(urlObj.host || "").toLowerCase();
    }
    const parsed = parseLine(`GET ${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`);
    records.push({
      method: (typeof request === "object" && request.method ? request.method : "GET").toUpperCase(),
      template: normalizeTemplatePath(parsed?.normalized || rawPath),
      domain,
      summary: item.name || "",
      declared: true,
    });
  });
  return records;
}

function fromHar(har) {
  return (har.log?.entries || [])
    .map((entry) => {
      const url = entry?.request?.url;
      if (!url) return null;
      const parsed = parseLine(`${entry.request.method || "GET"} ${url}`);
      if (!parsed) return null;
      return {
        method: (entry.request.method || "GET").toUpperCase(),
        template: normalizeTemplatePath(parsed.normalized),
        domain: extractDomain(url),
        status: entry.response?.status || null,
        latency: entry.time ? Math.round(entry.time) : null,
        ts: entry.startedDateTime ? Date.parse(entry.startedDateTime) || null : null,
        declared: false,
      };
    })
    .filter(Boolean);
}

// api.github.com root returns { "user_url": "https://api.github.com/users/{user}", … }
function fromUrlMap(obj) {
  const entries = Object.entries(obj).filter(
    ([, value]) => typeof value === "string" && /^https?:\/\//.test(value),
  );
  if (!entries.length || entries.length < Object.keys(obj).length / 2) return null;
  return entries.map(([name, url]) => {
    // Strip scheme+host manually — new URL() would percent-encode {template}
    // placeholders. Also expand RFC 6570 forms like {/user} → /{user}.
    const path = url
      .replace(/\{\/([^}]+)\}/g, "/{$1}")
      .replace(/^https?:\/\/[^/]+/i, "")
      .split(/[?#{]\?/)[0];
    return {
      method: "GET",
      template: normalizeTemplatePath(path.replace(/\{[?&][^}]*\}/g, "")),
      domain: extractDomain(url),
      summary: name.replace(/_url$/, "").replaceAll("_", " "),
      declared: true,
    };
  });
}

function parseStructured(text) {
  let data = null;
  const trimmed = text.trim();
  if (/^[{[]/.test(trimmed)) {
    try {
      data = JSON.parse(trimmed);
    } catch {
      data = null;
    }
  }
  if (!data && /^(openapi|swagger|info|paths)\s*:/m.test(trimmed)) {
    try {
      data = yaml.load(trimmed);
    } catch {
      data = null;
    }
  }
  if (!data || typeof data !== "object") return null;

  if (data.paths && (data.openapi || data.swagger || data.info)) return fromOpenApi(data);
  if (data.info && Array.isArray(data.item)) return walkPostmanItems(data.item, []);
  if (data.log?.entries) return fromHar(data);
  if (!Array.isArray(data)) {
    const mapped = fromUrlMap(data);
    if (mapped) return mapped;
  }
  return null;
}

// Free text: logs, cURL scripts, source code — line-oriented scan.
function parseFreeText(text) {
  const records = [];
  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const parsed = parseLine(line);
    if (!parsed) return;
    const tsMatch = line.match(/\d{4}-\d{2}-\d{2}[T ][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?/);
    const isRouteDefinition = /\b(?:app|router)\.(?:get|post|put|patch|delete|options|head)\s*\(/i.test(line);
    records.push({
      method: parsed.method,
      template: normalizeTemplatePath(parsed.normalized),
      domain: extractDomain(line),
      status: parsed.status,
      latency: parsed.latency,
      ts: tsMatch ? Date.parse(tsMatch[0]) || null : null,
      declared: isRouteDefinition,
      example: parsed.path,
    });
  });
  return records;
}

export function parseSource(source) {
  const structured = parseStructured(source.text);
  const records = structured ?? parseFreeText(source.text);
  return records.map((record) => ({ ...record, sourceName: source.name, sourceKind: source.kind }));
}

// ---------------------------------------------------------------------------
// Merge + classify
// ---------------------------------------------------------------------------

const USAGE_LABELS = ["Actively Used", "Infrequently Used", "Rarely Used", "Unused"];

export function runScan(sources) {
  const records = sources.flatMap(parseSource);
  const grouped = new Map();

  records.forEach((record) => {
    const key = `${record.method} ${record.domain || "-"} ${record.template}`;
    const current =
      grouped.get(key) || {
        key,
        method: record.method,
        path: record.template,
        domain: record.domain || "",
        summary: "",
        calls: 0,
        errors: 0,
        declared: false,
        lastUsed: null,
        statuses: {},
        latencies: [],
        examples: new Set(),
        sources: new Set(),
      };
    current.sources.add(record.sourceName);
    if (record.summary && !current.summary) current.summary = record.summary;
    if (record.example) current.examples.add(record.example);
    if (record.declared) {
      current.declared = true;
    } else {
      current.calls += 1;
      if (record.status != null) {
        current.statuses[record.status] = (current.statuses[record.status] || 0) + 1;
        if (record.status >= 400) current.errors += 1;
      }
      if (record.latency != null) current.latencies.push(record.latency);
      if (record.ts != null) current.lastUsed = Math.max(current.lastUsed ?? 0, record.ts);
    }
    grouped.set(key, current);
  });

  let endpoints = [...grouped.values()].map((endpoint) => {
    const sorted = [...endpoint.latencies].sort((a, b) => a - b);
    const p95 = sorted.length
      ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)]
      : null;
    return {
      ...endpoint,
      examples: [...endpoint.examples],
      sources: [...endpoint.sources],
      avgLatency: sorted.length
        ? Math.round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length)
        : null,
      p95Latency: p95,
      errorRate: endpoint.calls ? (endpoint.errors / endpoint.calls) * 100 : 0,
    };
  });

  // Usage classification from real call counts: 0 calls → Unused; the rest by
  // terciles of the observed distribution.
  const activeCounts = endpoints.filter((e) => e.calls > 0).map((e) => e.calls).sort((a, b) => a - b);
  const tercile = (fraction) =>
    activeCounts.length
      ? activeCounts[Math.min(activeCounts.length - 1, Math.floor(activeCounts.length * fraction))]
      : 0;
  const p33 = tercile(1 / 3);
  const p66 = tercile(2 / 3);

  endpoints = endpoints
    .map((endpoint) => ({
      ...endpoint,
      usage:
        endpoint.calls === 0
          ? "Unused"
          : endpoint.calls >= p66
            ? "Actively Used"
            : endpoint.calls > p33
              ? "Infrequently Used"
              : "Rarely Used",
    }))
    .sort((a, b) => b.calls - a.calls || a.path.localeCompare(b.path));

  const totalCalls = endpoints.reduce((sum, e) => sum + e.calls, 0);
  const domains = [...new Set(endpoints.map((e) => e.domain).filter(Boolean))];
  const methodSet = [...new Set(endpoints.map((e) => e.method))];
  const unused = endpoints.filter((e) => e.usage === "Unused").length;

  // Method distribution — by calls when traffic exists, else by endpoint count.
  const methodBasis = totalCalls > 0 ? "calls" : "endpoints";
  const byMethod = METHODS.map((name) => ({
    name,
    value: endpoints
      .filter((e) => e.method === name)
      .reduce((sum, e) => sum + (methodBasis === "calls" ? e.calls : 1), 0),
  })).filter((item) => item.value > 0);

  const domainBasis = methodBasis;
  const topDomains = domains
    .map((domain) => ({
      domain,
      value: endpoints
        .filter((e) => e.domain === domain)
        .reduce((sum, e) => sum + (domainBasis === "calls" ? e.calls : 1), 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const usageBreakdown = USAGE_LABELS.map((label) => ({
    label,
    value: endpoints.filter((e) => e.usage === label).length,
  }));

  return {
    endpoints,
    totals: {
      endpoints: endpoints.length,
      calls: totalCalls,
      domains: domains.length,
      methods: methodSet.length,
      unused,
    },
    byMethod,
    methodBasis,
    topDomains,
    usageBreakdown,
    recordCount: records.length,
  };
}

export const USAGE_CLASSES = USAGE_LABELS;
