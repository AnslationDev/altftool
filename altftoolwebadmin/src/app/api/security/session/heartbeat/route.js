import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { heartbeatSession } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withAdminApi(
  async ({ request, principal }) => {
    const body = await request.json().catch(() => ({}));
    if (!body?.sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    const result = await heartbeatSession({
      sessionId: body.sessionId,
      uid: principal.uid,
      touch: body.active !== false,
    });
    return NextResponse.json(result);
  },
  { rateLimit: { limit: 240, windowMs: 60_000, scope: "security:heartbeat" } },
);
