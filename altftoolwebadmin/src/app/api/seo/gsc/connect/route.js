// altftoolwebadmin/src/app/api/seo/gsc/connect/route.js
//
// Step 1 of the OAuth flow: a Super Admin requests the Google consent URL.
// Returns { authUrl } with an HMAC-signed CSRF state; the browser then navigates
// to Google. Inert (configured:false) until OAuth client env is set.

import { NextResponse } from "next/server";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { isOAuthConfigured, buildAuthUrl, signState } from "@/lib/gsc/oauthConfig";
import { isEncryptionConfigured } from "@/lib/gsc/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler({ principal, audit }) {
  if (!isOAuthConfigured()) {
    return NextResponse.json({ configured: false, error: "Google OAuth is not configured on the server." });
  }
  if (!isEncryptionConfigured()) {
    return NextResponse.json({
      configured: false,
      error: "Token encryption key (GSC_TOKEN_ENC_KEY) is missing — refusing to start OAuth.",
    });
  }
  const state = signState({ uid: principal.uid, email: principal.email });
  await audit({ action: "seo.gsc.connect.initiate", module: "seo", summary: "Started Search Console OAuth connect" });
  return NextResponse.json({ configured: true, authUrl: buildAuthUrl(state) });
}

export const POST = withAdminApi(handler, {
  requireSuperAdmin: true,
  rateLimit: { limit: 10, windowMs: 60_000, scope: "seo-gsc-connect" },
  audit: { module: "seo" },
  mutating: true,
});
