import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { listSessions, listDevices } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminApi(
  async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid") || null;
    const sessions = await listSessions({ uid });
    const devices = uid ? await listDevices(uid) : [];
    return NextResponse.json({ sessions, devices });
  },
  { requireSuperAdmin: true },
);
