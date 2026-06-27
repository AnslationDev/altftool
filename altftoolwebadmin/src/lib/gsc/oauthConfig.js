// altftoolwebadmin/src/lib/gsc/oauthConfig.js
//
// Google OAuth 2.0 configuration + CSRF "state" signing for the Search Console
// connection flow. Read-only config helpers (no network). Designed so the
// integration is INERT until the OAuth client credentials are provided.

import crypto from "node:crypto";

export const GSC_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/webmasters",
];

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export function getOAuthConfig() {
  return {
    clientId: process.env.GSC_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GSC_OAUTH_CLIENT_SECRET || "",
    redirectUri: process.env.GSC_OAUTH_REDIRECT_URI || "",
  };
}

export function isOAuthConfigured() {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  return Boolean(clientId && clientSecret && redirectUri);
}

function stateSecret() {
  return (
    process.env.GSC_OAUTH_STATE_SECRET ||
    process.env.GSC_OAUTH_CLIENT_SECRET ||
    process.env.ALTFT_REVALIDATE_SECRET ||
    ""
  );
}

/** HMAC-sign a small state payload to defend the callback against CSRF. */
export function signState(payload = {}) {
  const body = Buffer.from(JSON.stringify({ ...payload, ts: payload.ts || Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyState(state, maxAgeMs = 10 * 60 * 1000) {
  const [body, sig] = String(state || "").split(".");
  if (!body || !sig) throw new Error("Invalid OAuth state.");
  const expected = crypto.createHmac("sha256", stateSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("OAuth state signature mismatch.");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.ts || Date.now() - payload.ts > maxAgeMs) {
    throw new Error("OAuth state expired.");
  }
  return payload;
}

/** Build the Google consent URL (offline access + forced consent for a refresh token). */
export function buildAuthUrl(state) {
  const { clientId, redirectUri } = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GSC_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}
