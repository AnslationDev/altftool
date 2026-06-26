import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { listSecurityEvents } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminApi(
  async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));
    const cursor = Number(searchParams.get("cursor")) || null;
    const { events, nextCursor } = await listSecurityEvents({ limit, cursor });
    return NextResponse.json({ events, nextCursor });
  },
  { requireSuperAdmin: true },
);
