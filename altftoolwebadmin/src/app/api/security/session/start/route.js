import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { startSession, getConsentStatus } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withAdminApi(
  async ({ request, principal }) => {
    const result = await startSession({
      uid: principal.uid,
      email: principal.email,
      request,
    });
    const consent = await getConsentStatus(principal.uid);
    return NextResponse.json({
      ok: true,
      sessionId: result.sessionId,
      risk: {
        level: result.risk.level,
        score: result.risk.score,
        suspicious: result.risk.suspicious,
        reasons: result.risk.reasons,
      },
      idleTimeoutMinutes: result.settings.idleTimeoutMinutes,
      session: result.session,
      consent,
    });
  },
  { rateLimit: { limit: 30, windowMs: 60_000, scope: "security:session-start" } },
);
