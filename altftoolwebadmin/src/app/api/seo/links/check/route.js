// altftoolwebadmin/src/app/api/seo/links/check/route.js
//
// ALTF Engine — broken URL detection. Given a list of URLs/paths, performs
// server-side reachability checks (HEAD with GET fallback) and reports status,
// redirects and errors. Follows the admin API convention: rate-limit -> auth.

import { NextResponse } from "next/server";
import { authorizeSeoRequest, seoAccessErrorResponse } from "@/lib/seoAuth";
import { enforceRateLimit } from "@altftool/core/http";

const MAX_URLS = 60;
const TIMEOUT_MS = 8000;
const DEFAULT_BASE = (process.env.ALTFT_WEB_BASE_URL || "https://altftool.com").replace(/\/+$/, "");

function toAbsolute(input) {
  const s = String(input || "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `${DEFAULT_BASE}${s.startsWith("/") ? s : `/${s}`}`;
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const result = { url, ok: false, status: 0, redirected: false, finalUrl: url, error: null };
  try {
    let res;
    try {
      res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
      // Some servers reject HEAD — retry with GET.
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
      }
    } catch {
      res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    result.status = res.status;
    result.ok = res.ok;
    result.finalUrl = res.url || url;
    result.redirected = Boolean(res.redirected) || result.finalUrl.replace(/\/$/, "") !== url.replace(/\/$/, "");
  } catch (err) {
    result.error = err?.name === "AbortError" ? "Timeout" : String(err?.message || "Request failed");
  } finally {
    clearTimeout(timer);
  }
  return result;
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 20,
    windowMs: 60_000,
    scope: "seo-links-check",
  });
  if (limited) return limited;

  try {
    await authorizeSeoRequest(request, "read");
  } catch (error) {
    return seoAccessErrorResponse(error);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const urls = Array.isArray(body?.urls) ? body.urls : [];
  const targets = [...new Set(urls.map(toAbsolute).filter(Boolean))].slice(0, MAX_URLS);
  if (!targets.length) {
    return NextResponse.json({ error: "Provide at least one URL or path." }, { status: 400 });
  }

  try {
    const results = await Promise.all(targets.map(probe));
    const broken = results.filter((r) => r.error || r.status >= 400 || r.status === 0).length;
    return NextResponse.json({ checked: results.length, broken, results });
  } catch (error) {
    console.error("[seo/links/check]", error);
    return NextResponse.json({ error: "Link check failed" }, { status: 500 });
  }
}
