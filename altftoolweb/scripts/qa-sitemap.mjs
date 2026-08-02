import { writeFile } from "node:fs/promises";

const baseUrl = new URL(process.env.BASE_URL || "http://127.0.0.1:3000");
const concurrency = Math.max(1, Number(process.env.CONCURRENCY || 12));
const timeoutMs = Math.max(1_000, Number(process.env.TIMEOUT_MS || 30_000));
const maxBodyBytes = Math.max(
  64 * 1024,
  Number(process.env.MAX_BODY_BYTES || 8 * 1024 * 1024),
);
const reportPath = process.env.REPORT_PATH || "";

function localize(url) {
  const localized = new URL(url, baseUrl);
  localized.protocol = baseUrl.protocol;
  localized.host = baseUrl.host;
  return localized.toString();
}

function decode(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function locations(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) =>
    decode(match[1].trim()),
  );
}

function hasNextRuntimeError(html) {
  return (
    /id=["']__next_error__["']/i.test(html) ||
    /<meta\b[^>]*\bname=["']next-error["'][^>]*>/i.test(html) ||
    /<(?:title|h1)\b[^>]*>\s*(?:Application error|Internal Server Error)\b/i.test(
      html,
    )
  );
}

async function request(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "ALTFTool-Release-QA/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readTextBounded(response, label) {
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > maxBodyBytes) {
    await response.body?.cancel();
    throw new Error(
      `${label} is ${contentLength} bytes; QA limit is ${maxBodyBytes}`,
    );
  }

  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parts = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBodyBytes) {
        await reader.cancel();
        throw new Error(
          `${label} exceeds the ${maxBodyBytes}-byte QA response limit`,
        );
      }
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
    return parts.join("");
  } finally {
    reader.releaseLock();
  }
}

const rootResponse = await request(new URL("/sitemap.xml", baseUrl));
if (!rootResponse.ok) {
  throw new Error(`Sitemap returned HTTP ${rootResponse.status}`);
}

const discovered = [];
for (const location of locations(
  await readTextBounded(rootResponse, "Root sitemap"),
)) {
  if (!location.endsWith(".xml")) {
    discovered.push(location);
    continue;
  }

  const childResponse = await request(localize(location));
  if (!childResponse.ok) {
    throw new Error(`${location} returned HTTP ${childResponse.status}`);
  }
  discovered.push(
    ...locations(await readTextBounded(childResponse, location)),
  );
}

const urls = [...new Set(discovered)];
const results = new Array(urls.length);
let cursor = 0;
let completed = 0;

async function worker() {
  while (cursor < urls.length) {
    const index = cursor;
    cursor += 1;
    const sourceUrl = urls[index];
    const startedAt = performance.now();

    try {
      const response = await request(localize(sourceUrl));
      const html = await readTextBounded(response, sourceUrl);
      const title = decode(
        html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "",
      );
      const description = decode(
        html.match(
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
        )?.[1] ||
          html.match(
            /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
          )?.[1] ||
          "",
      );
      const canonical = decode(
        html.match(
          /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
        )?.[1] ||
          html.match(
            /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
          )?.[1] ||
          "",
      );

      results[index] = {
        url: sourceUrl,
        status: response.status,
        ms: Math.round(performance.now() - startedAt),
        title,
        description,
        canonical,
        h1Count: (html.match(/<h1\b/gi) || []).length,
        nextError: hasNextRuntimeError(html),
      };
    } catch (error) {
      results[index] = {
        url: sourceUrl,
        status: 0,
        ms: Math.round(performance.now() - startedAt),
        error: error instanceof Error ? error.message : String(error),
      };
    }

    completed += 1;
    if (completed % 250 === 0 || completed === urls.length) {
      console.error(`Sitemap QA: ${completed}/${urls.length} routes checked`);
    }
  }
}

await Promise.all(
  Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()),
);

const canonicalPattern = /^https:\/\/(?:www\.)?altftool\.com(?:\/|$)/;
const failures = results.filter(
  (item) =>
    item.status !== 200 ||
    item.nextError ||
    !item.title ||
    !item.description ||
    !canonicalPattern.test(item.canonical) ||
    item.h1Count !== 1,
);
const durations = results.map((item) => item.ms).sort((a, b) => a - b);
const percentile = (value) =>
  durations[
    Math.min(durations.length - 1, Math.floor(durations.length * value))
  ] || 0;
const report = {
  summary: {
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    responseMs: {
      p50: percentile(0.5),
      p95: percentile(0.95),
      max: durations.at(-1) || 0,
    },
  },
  failures: failures.slice(0, 50),
};

console.log(JSON.stringify(report, null, 2));
if (reportPath) {
  await writeFile(reportPath, JSON.stringify({ report, results }, null, 2));
}
if (failures.length) process.exitCode = 1;
