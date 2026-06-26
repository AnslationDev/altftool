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
    await audit({
      action: "security.session.revoke",
      summary: `Force-logout session ${body.sessionId}`,
      metadata: { sessionId: body.sessionId, reason: body.reason || "forced_logout" },
    });
    return NextResponse.json(res);
  },
  {
    requireSuperAdmin: true,
    rateLimit: { limit: 30, windowMs: 60_000, scope: "security:revoke" },
  },
);
