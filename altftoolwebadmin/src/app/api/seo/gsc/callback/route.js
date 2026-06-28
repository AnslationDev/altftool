// altftoolwebadmin/src/app/api/seo/gsc/callback/route.js
//
// Step 2 of the OAuth flow: Google redirects here with ?code&state. We verify
// the signed state (CSRF), exchange the code for tokens, fetch the account
// profile, encrypt + store the org connection, then redirect back to the SEO
// Center. This route is hit by the browser (no admin bearer) — the signed state
// is the trust anchor.

import { NextResponse } from "next/server";
import { verifyState } from "@/lib/gsc/oauthConfig";
import { exchangeCode, fetchGoogleProfile } from "@/lib/gsc/oauthClient";
import { saveConnection } from "@/lib/gsc/tokenStore";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE = "/altftool/seo/search-console";
const ok = (base) => `${base}${PAGE}?connected=1`;
const fail = (base, msg) => `${base}${PAGE}?error=${encodeURIComponent(msg)}`;

export async function GET(request) {
  const url = new URL(request.url);
  const base = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) return NextResponse.redirect(fail(base, oauthError));
  if (!code || !state) return NextResponse.redirect(fail(base, "Missing authorization code or state."));

  let payload;
  try {
    payload = verifyState(state);
  } catch {
    return NextResponse.redirect(fail(base, "Invalid or expired sign-in state. Please try again."));
  }

  try {
    const tokens = await exchangeCode(code);
    const profile = await fetchGoogleProfile(tokens.access_token);
    await saveConnection({
      tokens,
      profile,
      scopes: String(tokens.scope || "").split(" ").filter(Boolean),
      actor: { uid: payload.uid, email: payload.email },
    });
    await writeAdminAuditLog({
      action: "seo.gsc.connect.success",
      module: "seo",
      actorUid: payload.uid,
      actorEmail: payload.email || null,
      status: "success",
      summary: `Connected Google Search Console as ${profile.email || "unknown account"}`,
    }).catch(() => {});
    return NextResponse.redirect(ok(base));
  } catch (error) {
    console.error("[gsc/callback]", error);
    await writeAdminAuditLog({
      action: "seo.gsc.connect.error",
      module: "seo",
      actorUid: payload?.uid || null,
      status: "error",
      summary: error?.message || "OAuth exchange failed",
    }).catch(() => {});
    return NextResponse.redirect(fail(base, error?.message || "Could not connect Google account."));
  }
}
