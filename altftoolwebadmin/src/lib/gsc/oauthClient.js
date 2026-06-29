// altftoolwebadmin/src/lib/gsc/oauthClient.js
//
// Google OAuth 2.0 token operations (no SDK — plain HTTPS). Exchanges the
// authorization code for tokens, refreshes the access token on demand, and
// fetches the connected account's profile. All server-only.

import { GOOGLE_TOKEN_ENDPOINT, getOAuthConfig } from "./oauthConfig";
import { getRefreshToken, getStoredAccessToken, updateAccessToken } from "./tokenStore";

async function tokenRequest(params) {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error_description || data.error || "Google token request failed");
    err.status = res.status;
    err.googleError = data.error;
    throw err;
  }
  return data;
}

/** Exchange the authorization code for { access_token, refresh_token, expires_in, scope }. */
export async function exchangeCode(code) {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  return tokenRequest({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
}

async function refreshWithToken(refreshToken) {
  const { clientId, clientSecret } = getOAuthConfig();
  return tokenRequest({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });
}

/**
 * Return a valid access token for the org connection, refreshing + persisting
 * it transparently when the stored one is missing/expired. Throws GSC_NO_OAUTH
 * if no connection exists (callers fall back to the service account).
 */
export async function getValidAccessToken() {
  const cached = await getStoredAccessToken();
  if (cached) return cached;

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    const err = new Error("No Google account connected.");
    err.code = "GSC_NO_OAUTH";
    throw err;
  }

  const refreshed = await refreshWithToken(refreshToken);
  await updateAccessToken({ access_token: refreshed.access_token, expires_in: refreshed.expires_in });
  return refreshed.access_token;
}

/** Fetch the connected Google account profile (email + sub) using an access token. */
export async function fetchGoogleProfile(accessToken) {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return {};
  const data = await res.json().catch(() => ({}));
  return { email: data.email || null, sub: data.sub || null, name: data.name || null };
}

/** Best-effort token revocation at Google (used on disconnect). */
export async function revokeToken(token) {
  if (!token) return;
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" });
  } catch {
    /* best-effort */
  }
}
