import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { getCurrentSessionForUser } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the calling admin's own current active session (device / browser /
// masked IP / approx + live location) so they can verify tracking is working.
export const GET = withAdminApi(async ({ principal }) => {
  const session = await getCurrentSessionForUser(principal.uid);
  return NextResponse.json({ session, uid: principal.uid, email: principal.email });
});
