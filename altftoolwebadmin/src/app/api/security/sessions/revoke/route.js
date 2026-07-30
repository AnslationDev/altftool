import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { revokeSession } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withAdminApi(
  async ({ request, principal, audit }) => {
    const body = await request.json().catch(() => ({}));
    if (!body?.sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    const res = await revokeSession({
      sessionId: body.sessionId,
      actor: principal,
      reason: body.reason || "forced_logout",
    });
    // revokeSession() returns {ok:false} without touching any session when
    // sessionId matches no doc (already ended, mistyped, or raced with
    // another revoke) — audit that outcome distinctly instead of always
    // recording a successful force-logout that never actually happened.
    await audit({
      action: "security.session.revoke",
      status: res.ok ? "success" : "error",
      summary: res.ok
        ? `Force-logout session ${body.sessionId}`
        : `Force-logout failed — session ${body.sessionId} not found`,
      metadata: { sessionId: body.sessionId, reason: body.reason || "forced_logout", ok: res.ok },
    });
    return NextResponse.json(res);
  },
  {
    requireSuperAdmin: true,
    rateLimit: { limit: 30, windowMs: 60_000, scope: "security:revoke" },
  },
);
