import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { getConsentStatus, recordConsent } from "@/lib/security/store";
import { PRIVACY_POLICY_VERSION, PRIVACY_POLICY_SUMMARY } from "@/lib/security/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminApi(async ({ principal }) => {
  const status = await getConsentStatus(principal.uid);
  return NextResponse.json({ ...status, policySummary: PRIVACY_POLICY_SUMMARY });
});

export const POST = withAdminApi(
  async ({ request, principal }) => {
    const status = await getConsentStatus(principal.uid);
    const version = status.currentVersion || PRIVACY_POLICY_VERSION;
    const res = await recordConsent({
      uid: principal.uid,
      email: principal.email,
      version,
      request,
    });
    return NextResponse.json({ ...res, currentVersion: version });
  },
  { rateLimit: { limit: 10, windowMs: 60_000, scope: "security:consent" } },
);
