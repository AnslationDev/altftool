"use client";

/**
 * Normalization + formatting helpers for the WhereGoes redirect tracer.
 * The hosted backend (POST /api/check) returns:
 *   { chain: [{ url, status, responseTime, headers, error?, ... }], totalTime, finalUrl, warnings }
 */

export const STATUS_TEXT = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  410: "Gone",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export function statusText(status) {
  if (!status) return "No Response";
  return STATUS_TEXT[status] || `HTTP ${status}`;
}

export function statusKind(status) {
  if (!status) return "danger";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "warning";
  return "danger";
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatMs(ms) {
  return `${Math.round(ms || 0)} ms`;
}

function headerValue(headers, name) {
  if (!headers || typeof headers !== "object") return null;
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name);
  return key ? headers[key] : null;
}

export function normalizeResult(raw, inputUrl) {
  const chain = (raw?.chain || []).map((step, index) => {
    const sizeRaw = headerValue(step.headers, "content-length");
    const size = sizeRaw !== null ? Number.parseInt(sizeRaw, 10) : null;
    return {
      index,
      url: step.url,
      status: step.status || null,
      statusText: statusText(step.status),
      kind: statusKind(step.status),
      responseTime: Math.round(step.responseTime || 0),
      sizeBytes: Number.isFinite(size) ? size : null,
      headers: step.headers || {},
      error: step.error || null,
    };
  });

  const finalStep = chain[chain.length - 1] || null;
  const totalTime = Math.round(
    raw?.totalTime || chain.reduce((sum, step) => sum + step.responseTime, 0),
  );

  const seen = new Set();
  let loop = false;
  for (const step of chain) {
    const key = String(step.url || "").replace(/\/+$/, "");
    if (seen.has(key)) {
      loop = true;
      break;
    }
    seen.add(key);
  }
  const warningsText = (raw?.warnings || []).join(" ").toLowerCase();
  if (warningsText.includes("loop")) loop = true;

  const finalUrl = raw?.finalUrl || finalStep?.url || inputUrl;
  const completed = Boolean(finalStep && finalStep.status && finalStep.status < 400 && !finalStep.error);

  return {
    inputUrl,
    chain,
    totalTime,
    finalUrl,
    finalStep,
    redirects: chain.filter((step) => step.status >= 300 && step.status < 400).length,
    httpsSecure: String(finalUrl || "").startsWith("https://"),
    loop,
    method: "GET",
    completed,
    contentType: headerValue(finalStep?.headers, "content-type") || "—",
    server: headerValue(finalStep?.headers, "server") || "—",
    warnings: raw?.warnings || [],
  };
}

/* --------------------------------- exports --------------------------------- */

export function chainAsText(result) {
  const lines = result.chain.map(
    (step) =>
      `${step.index + 1}. ${step.url} — ${step.status || "ERR"} ${step.statusText} (${step.responseTime} ms)`,
  );
  return [`Redirect trace for ${result.inputUrl}`, ...lines, `Final: ${result.finalUrl}`].join("\n");
}

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportJson(result) {
  downloadBlob(JSON.stringify(result, null, 2), "wheregoes-trace.json", "application/json");
}

export function exportCsv(result) {
  const rows = [
    ["#", "URL", "Status", "Type", "Response Time (ms)", "Size (bytes)"],
    ...result.chain.map((step) => [
      step.index + 1,
      step.url,
      step.status ?? "",
      step.statusText,
      step.responseTime,
      step.sizeBytes ?? "",
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadBlob(csv, "wheregoes-trace.csv", "text/csv");
}

/* --------------------------------- demo mode -------------------------------- */

export function isDemoMode() {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("demo") === "1";
  } catch {
    return false;
  }
}

export function getDemoResult() {
  const raw = {
    totalTime: 663,
    finalUrl: "https://login.example.com",
    warnings: [],
    chain: [
      {
        url: "http://example.com",
        status: 301,
        responseTime: 102,
        headers: {
          location: "https://example.com",
          server: "cloudflare",
          "content-length": "178",
          "cache-control": "max-age=3600",
        },
      },
      {
        url: "https://example.com",
        status: 302,
        responseTime: 98,
        headers: {
          location: "https://www.example.com",
          server: "cloudflare",
          "content-length": "155",
        },
      },
      {
        url: "https://www.example.com",
        status: 307,
        responseTime: 120,
        headers: {
          location: "https://example.com/login",
          server: "cloudflare",
          "content-length": "162",
        },
      },
      {
        url: "https://example.com/login",
        status: 302,
        responseTime: 121,
        headers: {
          location: "https://login.example.com",
          server: "cloudflare",
          "content-length": "160",
        },
      },
      {
        url: "https://login.example.com",
        status: 200,
        responseTime: 222,
        headers: {
          "cache-control": "no-store, no-cache, must-revalidate",
          "content-type": "text/html; charset=UTF-8",
          date: "Wed, 15 May 2024 10:15:30 GMT",
          server: "cloudflare",
          "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
          "content-length": "25190",
          "x-frame-options": "SAMEORIGIN",
          "x-content-type-options": "nosniff",
          "referrer-policy": "strict-origin-when-cross-origin",
        },
      },
    ],
  };
  return normalizeResult(raw, "https://example.com");
}
