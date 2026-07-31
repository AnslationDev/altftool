/**
 * API: DNS Ownership Verification — real server-side check
 * POST /api/altflinking/verify-dns { domain, token }
 *
 * Looks up TXT records for the domain and checks whether the given
 * verification token is present in any of them. Runs server-side because
 * DNS resolution isn't available in the browser.
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import dns from "node:dns/promises";
import { verifyToken, err, ok } from "@/lib/altflinking/authMiddleware";

export async function POST(request) {
  // Tightened from the typical 20/min to 5/min because this route triggers
  // an attacker-directed DNS lookup against a caller-supplied domain —
  // a stricter per-instance cap is defense-in-depth against using it to
  // probe or amplify DNS traffic against arbitrary hosts. NOTE: this
  // limiter (packages/core/src/http.js -> createTtlCache) is a per-process
  // in-memory Map, so on a horizontally-scaled/serverless deployment (this
  // app runs on AWS Amplify/Lambda) each warm instance enforces its own
  // independent counter — the real aggregate ceiling across instances is
  // higher than 5/min, not a hard global cap.
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 5,
    scope: "altflinking:verify-dns",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const domain = (body.domain || "").toString().trim().toLowerCase()
    .replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const token = (body.token || "").toString().trim();
  if (!domain) return err("domain is required", 400);
  if (!token) return err("token is required", 400);

  try {
    const records = await dns.resolveTxt(domain);
    const flat = records.map((chunks) => chunks.join(""));
    const verified = flat.some((rec) => rec.includes(token));
    return ok({ verified, domain, checkedAt: new Date().toISOString() });
  } catch {
    // NXDOMAIN, no TXT records, or resolver failure — treat as not-yet-verified
    // rather than an error, since DNS propagation can take time.
    return ok({ verified: false, domain, checkedAt: new Date().toISOString() });
  }
}
