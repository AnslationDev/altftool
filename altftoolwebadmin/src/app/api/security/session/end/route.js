import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { endSession } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called on logout: the admin revokes their own active device session so it
// doesn't linger as "active" until idle timeout.
export const POST = withAdminApi(
  async ({ request, principal }) => {
    const res = await endSession({ uid: principal.uid, request });
    return NextResponse.json(res);
  },
  { rateLimit: { limit: 20, windowMs: 60_000, scope: "security:session-end" } },
);
