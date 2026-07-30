/**
 * Public (pre-auth) endpoint to record login attempts and enforce login
 * rate limiting + suspicious-login signals. Called by the login page on both
 * success and failure. No admin token required (failures happen before auth),
 * but the endpoint itself is IP rate-limited to prevent abuse.
 */
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { recordLoginAttempt, evaluateLoginRateLimit } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    windowMs: 60_000,
    scope: "security:login-event",
  });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const success = Boolean(body?.success);

  // Per-IP limiting above is not enough on its own: one caller can still
  // fabricate an unlimited stream of login.failed / critical
  // login.rate_limited events against a single victim email by rotating
  // nothing at all (same IP, same email, just repeat). Key a second, tighter
  // limit on the normalized target email so repeated fabrication against one
  // address gets cut off well before it can manufacture the critical
  // rate-limited event over and over.
  if (email) {
    const emailLimited = enforceRateLimit(NextResponse, request, {
      key: email.toLowerCase(),
      limit: 5,
      windowMs: 60_000,
      scope: "security:login-event:email",
    });
    if (emailLimited) return emailLimited;
  }

  // Evaluate BEFORE recording this attempt so the threshold is on prior fails.
  const rate = await evaluateLoginRateLimit({ email, request });
  await recordLoginAttempt({ email, success, request });

  return NextResponse.json({
    ok: true,
    blocked: rate.blocked,
    remaining: Math.max(0, rate.max - rate.failures),
  });
}
