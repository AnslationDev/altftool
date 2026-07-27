import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse, routeError } from "@altftool/core/http";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";

export const runtime = "nodejs";

const CHECK_TIMEOUT_MS = 10000;
const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";
const MAX_SLUGS = 8;
const ALLOWED_PUBLIC_HOSTS = new Set(["altftool.com", "www.altftool.com"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function jsonAuthError(message = "Unauthorized", status = 401) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return "";
  return header.split("Bearer ")[1];
}

async function verifyAdminRequest(request) {
  const token = getBearerToken(request);

  if (process.env.NODE_ENV === "development" && token === LOCAL_ADMIN_TOKEN) {
    return { email: "admin@altftool.local", uid: "local-dev-admin" };
  }

  if (!token) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const decoded = await adminAuth.verifyIdToken(token);

  // RBAC-first: admins created through the current flow live only under
  // super_admin_dashboard/main/admin_users, so the legacy-only lookup below
  // 403'd every one of them.
  const rbacAdmin = await getRbacAdminDoc(decoded);
  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isActive) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }
    return decoded;
  }

  // Legacy fallback for admins created before the RBAC migration.
  let snap = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!snap.exists && decoded.email) {
    const byEmail = await adminDb
      .collection("admins")
      .where("email", "==", decoded.email)
      .limit(1)
      .get();
    if (!byEmail.empty) snap = byEmail.docs[0];
  }

  if (!snap.exists || snap.data()?.isActive === false) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  return decoded;
}

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeSlug(value = "") {
  const withoutQuery = String(value || "").split(/[?#]/)[0];
  return withoutQuery
    .replace(/^https?:\/\/[^/]+\/blogs\//i, "")
    .replace(/^\/?blogs\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

function defaultBaseUrl() {
  return (
    process.env.ALTFT_PUBLIC_RUNTIME_QA_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_ALTFT_SITE_URL ||
    "https://altftool.com"
  );
}

function normalizeBaseUrl(value = "") {
  const raw = cleanText(value) || defaultBaseUrl();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    const error = new Error("Only http(s) base URLs can be checked.");
    error.status = 400;
    throw error;
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function assertAllowedBaseUrl(url) {
  const host = url.hostname.toLowerCase();
  const isLocal = LOCAL_HOSTS.has(host);

  if (ALLOWED_PUBLIC_HOSTS.has(host)) return;
  if (process.env.NODE_ENV !== "production" && isLocal) return;

  const error = new Error("Runtime QA is limited to AltFTool public URLs.");
  error.status = 400;
  throw error;
}

function buildBlogUrl(baseUrl, slug) {
  const url = new URL(baseUrl);
  const encodedSlug = normalizeSlug(slug)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  url.pathname = `/blogs/${encodedSlug}`;
  return url;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("Request timed out.")), CHECK_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "AltFTool Admin Runtime QA (+https://altftool.com)",
      },
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractJsonLdPayloads(html = "") {
  const payloads = [];
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = scriptPattern.exec(html);

  while (match) {
    const source = match[1]?.trim();
    if (source) {
      try {
        payloads.push(JSON.parse(source));
      } catch {
        payloads.push({ "@type": "InvalidJsonLd" });
      }
    }
    match = scriptPattern.exec(html);
  }

  return payloads;
}

function collectSchemaNodes(value, nodes = []) {
  if (!value) return nodes;

  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaNodes(item, nodes));
    return nodes;
  }

  if (typeof value === "object") {
    nodes.push(value);
    if (Array.isArray(value["@graph"])) collectSchemaNodes(value["@graph"], nodes);
  }

  return nodes;
}

function getSchemaTypes(payloads = []) {
  const types = [];

  payloads.flatMap((payload) => collectSchemaNodes(payload)).forEach((node) => {
    const type = node?.["@type"];
    const values = Array.isArray(type) ? type : [type];
    values.filter(Boolean).forEach((item) => types.push(String(item)));
  });

  return [...new Set(types)];
}

function hasSchemaType(types = [], target = "") {
  return types.some((type) => type.toLowerCase() === target.toLowerCase());
}

function hasAny(html = "", patterns = []) {
  return patterns.some((pattern) => pattern.test(html));
}

function makeCheck(key, label, done, required = true, detail = "") {
  return {
    detail,
    done: Boolean(done),
    key,
    label,
    required,
  };
}

function analyzeBlogHtml(html = "", response = null) {
  const payloads = extractJsonLdPayloads(html);
  const schemaTypes = getSchemaTypes(payloads);
  const hasBlogPosting = hasSchemaType(schemaTypes, "BlogPosting") || hasSchemaType(schemaTypes, "Article");
  const hasBreadcrumb = hasSchemaType(schemaTypes, "BreadcrumbList");
  const hasFaqSchema = hasSchemaType(schemaTypes, "FAQPage");
  const hasNoIndex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  const checks = [
    makeCheck("load", "Page loads", response?.ok, true, response?.status ? `HTTP ${response.status}` : ""),
    makeCheck("blogposting", "BlogPosting JSON-LD", hasBlogPosting, true),
    makeCheck("breadcrumb", "Breadcrumb JSON-LD", hasBreadcrumb, true),
    makeCheck(
      "article-body",
      "Article body",
      hasAny(html, [/id=["']article-body["']/i, /aria-labelledby=["']blog-article-title["']/i, /<article[\s>]/i]),
      true,
    ),
    makeCheck("indexable", "Indexable", !hasNoIndex, true, hasNoIndex ? "Robots noindex found" : ""),
    makeCheck("title", "Article title", hasAny(html, [/id=["']blog-article-title["']/i, /<h1[\s>]/i]), false),
    makeCheck("toc", "Table of contents", hasAny(html, [/aria-label=["']Table of contents["']/i, /On This Page/i]), false),
    makeCheck("related-tools", "Related tools", hasAny(html, [/id=["']related-tools["']/i, /Tools for this guide/i]), false),
    makeCheck("faq", "FAQ schema or section", hasFaqSchema || hasAny(html, [/id=["']faq["']/i, /Reader questions/i, /Quick answers/i]), false),
    makeCheck("canonical", "Canonical/meta", hasAny(html, [/<link[^>]+rel=["']canonical["']/i, /<meta[^>]+name=["']description["']/i]), false),
  ];
  const requiredMissing = checks.filter((check) => check.required && !check.done).length;
  const optionalMissing = checks.filter((check) => !check.required && !check.done).length;
  const score = Math.max(0, Math.min(100, 100 - requiredMissing * 18 - optionalMissing * 5));

  return {
    checks,
    htmlBytes: html.length,
    issueCount: requiredMissing + optionalMissing,
    jsonLdCount: payloads.length,
    schemaTypes,
    score,
    state: requiredMissing ? "warning" : optionalMissing ? "warning" : "ok",
  };
}

function classifyStatus(status = 0) {
  if (status >= 200 && status < 400) return "ok";
  if (status === 401 || status === 403 || status === 429) return "warning";
  if (status >= 400) return "broken";
  return "warning";
}

async function probeBlog(baseUrl, slug) {
  const startedAt = Date.now();
  const normalizedSlug = normalizeSlug(slug);
  const url = buildBlogUrl(baseUrl, normalizedSlug);

  try {
    const response = await fetchHtml(url);
    const html = await response.text();
    const analysis = analyzeBlogHtml(html, response);
    const httpState = classifyStatus(response.status);
    const state = httpState === "broken" ? "broken" : analysis.state;

    return {
      ...analysis,
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      finalUrl: response.url,
      reason: state === "ok" ? "Runtime page looks healthy." : "Runtime page needs review.",
      slug: normalizedSlug,
      state,
      status: response.status,
      url: url.toString(),
    };
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      checks: [makeCheck("load", "Page loads", false, true, error?.message || "Request failed")],
      durationMs: Date.now() - startedAt,
      finalUrl: "",
      htmlBytes: 0,
      issueCount: 1,
      jsonLdCount: 0,
      reason: error?.message || "Runtime QA failed.",
      schemaTypes: [],
      score: 0,
      slug: normalizedSlug,
      state: "broken",
      status: null,
      url: url.toString(),
    };
  }
}

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 15,
      scope: "admin:blog-runtime-qa",
      windowMs: 60000,
    });
    if (limited) return limited;

    await verifyAdminRequest(request);

    const payload = await request.json().catch(() => ({}));
    const baseUrl = normalizeBaseUrl(payload.baseUrl);
    assertAllowedBaseUrl(baseUrl);

    const slugs = [
      ...new Set(
        (Array.isArray(payload.slugs) ? payload.slugs : [])
          .map(normalizeSlug)
          .filter(Boolean),
      ),
    ].slice(0, MAX_SLUGS);

    if (!slugs.length) {
      return NextResponse.json({ error: "At least one blog slug is required." }, { status: 400 });
    }

    const results = await Promise.all(slugs.map((slug) => probeBlog(baseUrl, slug)));
    const summary = results.reduce(
      (total, item) => {
        total[item.state] = (total[item.state] || 0) + 1;
        total.issueCount += item.issueCount || 0;
        total.total += 1;
        return total;
      },
      { broken: 0, issueCount: 0, ok: 0, total: 0, warning: 0 },
    );

    return jsonResponse(NextResponse, {
      baseUrl: baseUrl.origin,
      checkedAt: new Date().toISOString(),
      maxSlugs: MAX_SLUGS,
      results,
      summary,
    });
  } catch (error) {
    if (error?.status === 401) return jsonAuthError("Unauthorized", 401);
    if (error?.status === 403) return jsonAuthError("Forbidden", 403);
    return routeError(NextResponse, error, "Runtime QA failed.");
  }
}
