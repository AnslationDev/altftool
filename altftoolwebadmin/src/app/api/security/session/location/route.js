import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { updateSessionLocation } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The admin attaches their browser-provided (consented) live location to their
// own active session. Coordinates are rounded server-side for privacy.
export const POST = withAdminApi(
  async ({ request, principal }) => {
    const body = await request.json().catch(() => ({}));
    if (!body?.sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    const res = await updateSessionLocation({
      sessionId: body.sessionId,
      uid: principal.uid,
      location: {
        latitude: body.latitude,
        longitude: body.longitude,
        accuracy: body.accuracy,
        place: body.place,
        city: body.city,
        region: body.region,
        country: body.country,
      },
    });
    return NextResponse.json(res);
  },
  { rateLimit: { limit: 30, windowMs: 60_000, scope: "security:location" } },
);
