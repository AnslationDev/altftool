import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { getSecuritySettings, saveSecuritySettings } from "@/lib/security/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminApi(
  async () => NextResponse.json(await getSecuritySettings()),
  { requireSuperAdmin: true },
);

export const PUT = withAdminApi(
  async ({ request, principal, audit }) => {
    const patch = await request.json().catch(() => ({}));
    const next = await saveSecuritySettings(patch, principal);
    await audit({
      action: "security.settings.update",
      summary: "Updated security settings",
      changes: patch,
      metadata: { policyVersion: next.policyVersion },
    });
    return NextResponse.json(next);
  },
  {
    requireSuperAdmin: true,
    rateLimit: { limit: 20, windowMs: 60_000, scope: "security:settings" },
  },
);
