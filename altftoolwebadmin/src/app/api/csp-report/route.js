// altftoolwebadmin/src/app/api/csp-report/route.js
//
// Collector for the site-wide Content-Security-Policy-Report-Only header
// (see packages/core/src/next.js). The CSP is not yet enforced, so this
// endpoint is purely diagnostic: it exists so a would-be violation is
// visible somewhere other than a visitor's own DevTools console, which is
// the only prerequisite for ever safely flipping the policy to enforced.
// Default-inert: set ALTFT_CSP_REPORT_LOG=1 to emit logs, or wire a real
// sink (Firestore / log aggregator) where noted below.

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeReport(entry) {
  // Legacy `report-uri` shape: { "csp-report": { "violated-directive": ... } }
  const legacy = entry?.["csp-report"];
  if (legacy) {
    return {
      documentUri: legacy["document-uri"] || "",
      violatedDirective: legacy["violated-directive"] || legacy["effective-directive"] || "",
      blockedUri: legacy["blocked-uri"] || "",
      sourceFile: legacy["source-file"] || "",
      lineNumber: legacy["line-number"] ?? null,
    };
  }
  // Modern Reporting API shape: { type: "csp-violation", body: {...}, url }
  const body = entry?.body;
  if (body) {
    return {
      documentUri: entry.url || body.documentURL || "",
      violatedDirective: body.violatedDirective || body.effectiveDirective || "",
      blockedUri: body.blockedURL || "",
      sourceFile: body.sourceFile || "",
      lineNumber: body.lineNumber ?? null,
    };
  }
  return null;
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 120,
    scope: "csp-report",
    windowMs: 60_000,
  });
  if (limited) return limited;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (process.env.ALTFT_CSP_REPORT_LOG === "1") {
    const entries = Array.isArray(payload) ? payload : [payload];
    for (const entry of entries) {
      const report = normalizeReport(entry);
      if (!report || !report.violatedDirective) continue;
      console.log({
        event: "csp-violation",
        app: "admin",
        directive: report.violatedDirective,
        blockedUri: report.blockedUri,
        documentUri: report.documentUri,
        sourceFile: report.sourceFile,
        line: report.lineNumber,
      });
      // To persist: write `report` to Firestore or a log aggregator here.
    }
  }

  // Browsers only keep sending reports to an endpoint that answers cleanly;
  // never surface a 4xx/5xx here even for a malformed payload.
  return new NextResponse(null, { status: 204 });
}
