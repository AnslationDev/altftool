const MAX_SOURCE_CHARACTERS = 10 * 1024 * 1024;
const MAX_ENTRIES = 10_000;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CREDENTIAL_HEADERS = new Set([
  "authorization",
  "cookie",
  "proxy-authorization",
  "x-api-key",
]);
const SENSITIVE_QUERY_NAMES = new Set([
  "access_token",
  "apikey",
  "api_key",
  "authorization",
  "content",
  "email",
  "input",
  "key",
  "message",
  "prompt",
  "query",
  "search",
  "text",
  "token",
]);

function finiteNonNegative(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function normalizeHost(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
}

export function parseExpectedHosts(value) {
  const valid = [];
  const invalid = [];
  const seen = new Set();
  for (const raw of String(value || "").split(/[\r\n,]+/)) {
    const item = raw.trim().toLowerCase().replace(/\.$/, "");
    if (!item) continue;
    const wildcard = item.startsWith("*.");
    const candidate = wildcard ? item.slice(2) : item;
    let normalized = "";
    try {
      normalized = new URL(`https://${candidate}`).hostname
        .toLowerCase()
        .replace(/^\[|\]$/g, "")
        .replace(/\.$/, "");
    } catch {
      normalized = "";
    }
    if (
      !normalized ||
      normalized !== candidate.replace(/^\[|\]$/g, "") ||
      candidate.includes("/") ||
      /\s/.test(candidate)
    ) {
      invalid.push(raw.trim());
      continue;
    }
    const rule = wildcard ? `*.${normalized}` : normalized;
    if (!seen.has(rule)) {
      seen.add(rule);
      valid.push(rule);
    }
  }
  return { valid, invalid };
}

function matchesExpectedHost(host, rules) {
  return rules.some((rule) => {
    if (rule.startsWith("*.")) {
      const suffix = rule.slice(2);
      return host.length > suffix.length && host.endsWith(`.${suffix}`);
    }
    return host === rule;
  });
}

function headerNames(headers) {
  if (!Array.isArray(headers)) return [];
  return headers
    .map((header) => String(header?.name || "").trim().toLowerCase())
    .filter(Boolean);
}

function requestBodyBytes(request) {
  const declared = finiteNonNegative(request?.bodySize);
  if (declared) return declared;
  const text = request?.postData?.text;
  if (typeof text === "string") return new TextEncoder().encode(text).length;
  return 0;
}

function responseBytes(entry) {
  return Math.max(
    finiteNonNegative(entry?.response?.bodySize),
    finiteNonNegative(entry?.response?.content?.size),
  );
}

function queryNames(url) {
  return [...new Set([...url.searchParams.keys()].map((key) => key.toLowerCase()))];
}

function sourceEntries(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.log?.entries)) return parsed.log.entries;
  if (Array.isArray(parsed?.entries)) return parsed.entries;
  return null;
}

export function analyzeHar(source, expectedHostSource = "") {
  const raw = String(source || "");
  const bounded = raw.slice(0, MAX_SOURCE_CHARACTERS);
  if (!bounded.trim()) {
    return { ok: false, error: "Open or paste a HAR JSON trace first." };
  }

  let parsed;
  try {
    parsed = JSON.parse(bounded);
  } catch {
    return { ok: false, error: "The trace is not valid JSON." };
  }

  const entries = sourceEntries(parsed);
  if (!entries) {
    return {
      ok: false,
      error: "No HAR-style entries array was found at log.entries or entries.",
    };
  }

  const expectedHosts = parseExpectedHosts(expectedHostSource);
  if (expectedHosts.invalid.length) {
    return {
      ok: false,
      error:
        "Expected hosts must be hostnames only, such as api.example.com or *.example.com.",
      invalidExpectedHostCount: expectedHosts.invalid.length,
    };
  }

  const inspected = [];
  let invalidUrlCount = 0;
  for (const entry of entries.slice(0, MAX_ENTRIES)) {
    const request = entry?.request || {};
    let url;
    try {
      url = new URL(String(request.url || ""));
    } catch {
      invalidUrlCount += 1;
      continue;
    }

    const host = normalizeHost(url.hostname);
    const method = String(request.method || "GET").toUpperCase();
    const names = headerNames(request.headers);
    const query = queryNames(url);
    const credentialHeaderCount = names.filter((name) =>
      CREDENTIAL_HEADERS.has(name),
    ).length;
    const sensitiveQueryNameCount = query.filter((name) =>
      SENSITIVE_QUERY_NAMES.has(name),
    ).length;
    const bodyBytes = requestBodyBytes(request);
    const hasBody =
      Boolean(request?.postData) ||
      bodyBytes > 0 ||
      (BODY_METHODS.has(method) && finiteNonNegative(request.bodySize) > 0);
    const scope = LOOPBACK_HOSTS.has(host)
      ? "loopback"
      : matchesExpectedHost(host, expectedHosts.valid)
        ? "expected"
        : "unlisted";
    const cueCount =
      Number(hasBody) + Number(credentialHeaderCount > 0) + Number(sensitiveQueryNameCount > 0);

    inspected.push({
      host,
      method,
      scope,
      hasBody,
      requestBodyBytes: bodyBytes,
      responseBytes: responseBytes(entry),
      credentialHeaderCount,
      sensitiveQueryNameCount,
      queryNameCount: query.length,
      status: Number(entry?.response?.status) || 0,
      cueCount,
    });
  }

  const hostMap = new Map();
  for (const entry of inspected) {
    const current = hostMap.get(entry.host) || {
      host: entry.host,
      scope: entry.scope,
      requestCount: 0,
      bodyRequestCount: 0,
      requestBodyBytes: 0,
      responseBytes: 0,
      credentialHeaderRequestCount: 0,
      sensitiveQueryRequestCount: 0,
      failedRequestCount: 0,
      methods: new Set(),
    };
    current.requestCount += 1;
    current.bodyRequestCount += Number(entry.hasBody);
    current.requestBodyBytes += entry.requestBodyBytes;
    current.responseBytes += entry.responseBytes;
    current.credentialHeaderRequestCount += Number(entry.credentialHeaderCount > 0);
    current.sensitiveQueryRequestCount += Number(entry.sensitiveQueryNameCount > 0);
    current.failedRequestCount += Number(entry.status >= 400 || entry.status === 0);
    current.methods.add(entry.method);
    hostMap.set(entry.host, current);
  }

  const hosts = [...hostMap.values()]
    .map((host) => ({ ...host, methods: [...host.methods].sort() }))
    .sort((left, right) => {
      const scopeOrder = { unlisted: 0, expected: 1, loopback: 2 };
      return (
        scopeOrder[left.scope] - scopeOrder[right.scope] ||
        right.requestCount - left.requestCount ||
        left.host.localeCompare(right.host)
      );
    });

  const unlistedEntries = inspected.filter((entry) => entry.scope === "unlisted");
  return {
    ok: true,
    entries: inspected,
    hosts,
    entryCount: inspected.length,
    hostCount: hosts.length,
    loopbackRequestCount: inspected.filter((entry) => entry.scope === "loopback").length,
    expectedRequestCount: inspected.filter((entry) => entry.scope === "expected").length,
    unlistedRequestCount: unlistedEntries.length,
    unlistedBodyRequestCount: unlistedEntries.filter((entry) => entry.hasBody).length,
    credentialHeaderRequestCount: inspected.filter(
      (entry) => entry.credentialHeaderCount > 0,
    ).length,
    sensitiveQueryRequestCount: inspected.filter(
      (entry) => entry.sensitiveQueryNameCount > 0,
    ).length,
    invalidUrlCount,
    truncated: raw.length > bounded.length || entries.length > MAX_ENTRIES,
    expectedHostRuleCount: expectedHosts.valid.length,
  };
}

export function buildEgressReport(result) {
  if (!result?.ok) return null;
  return {
    generatedAt: new Date().toISOString(),
    entryCount: result.entryCount,
    hostCount: result.hostCount,
    loopbackRequestCount: result.loopbackRequestCount,
    expectedRequestCount: result.expectedRequestCount,
    unlistedRequestCount: result.unlistedRequestCount,
    unlistedBodyRequestCount: result.unlistedBodyRequestCount,
    credentialHeaderRequestCount: result.credentialHeaderRequestCount,
    sensitiveQueryRequestCount: result.sensitiveQueryRequestCount,
    invalidUrlCount: result.invalidUrlCount,
    expectedHostRuleCount: result.expectedHostRuleCount,
    hostSummaries: result.hosts.map((host, index) => ({
      host: index + 1,
      scope: host.scope,
      requestCount: host.requestCount,
      bodyRequestCount: host.bodyRequestCount,
      credentialHeaderRequestCount: host.credentialHeaderRequestCount,
      sensitiveQueryRequestCount: host.sensitiveQueryRequestCount,
      failedRequestCount: host.failedRequestCount,
    })),
    truncated: result.truncated,
    note:
      "This report excludes hostnames, URLs, headers, query values, request bodies, and response bodies. HAR metadata can only show recorded traffic, not prove that an app is fully local or that payload data was harmless.",
  };
}
