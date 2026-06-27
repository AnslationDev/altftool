// altftoolwebadmin/src/lib/gscClient.js
//
// Google Search Console client for the ALTF Engine.
// Reuses the existing Firebase service-account credentials (FIREBASE_CLIENT_EMAIL +
// FIREBASE_PRIVATE_KEY) to mint a Google access token for the Search Console API
// via google-auth-library (already a transitive dep of firebase-admin).
//
// PREREQUISITES (one-time, done by an admin in Google Cloud + Search Console):
//   1. Enable "Google Search Console API" for the project.
//   2. Add the service-account email as an OWNER of the Search Console property.
//
// Endpoints used (all under searchconsole.googleapis.com):
//   - sites.list                 GET  /webmasters/v3/sites
//   - urlInspection.index.inspect POST /v1/urlInspection/index:inspect
//   - searchanalytics.query      POST /webmasters/v3/sites/{site}/searchAnalytics/query
//   - sitemaps.list / submit     GET/PUT /webmasters/v3/sites/{site}/sitemaps[/{feed}]

import { JWT } from "google-auth-library";
import { getServerEnv } from "@altftool/core/env";
import { getValidAccessToken } from "./gsc/oauthClient";
import { isConnected as isOAuthConnected, getActiveProperty } from "./gsc/tokenStore";

const SCOPES = ["https://www.googleapis.com/auth/webmasters"];
const BASE = "https://searchconsole.googleapis.com";

let cachedClient = null;

function buildClient() {
  if (cachedClient) return cachedClient;
  const email = getServerEnv("GSC_CLIENT_EMAIL") || getServerEnv("FIREBASE_CLIENT_EMAIL");
  let key = getServerEnv("GSC_PRIVATE_KEY") || getServerEnv("FIREBASE_PRIVATE_KEY");
  if (!email || !key) return null;
  key = key.replace(/\\n/g, "\n");
  cachedClient = new JWT({ email, key, scopes: SCOPES });
  return cachedClient;
}

export function isGscConfigured() {
  return Boolean(
    (getServerEnv("GSC_CLIENT_EMAIL") || getServerEnv("FIREBASE_CLIENT_EMAIL")) &&
      (getServerEnv("GSC_PRIVATE_KEY") || getServerEnv("FIREBASE_PRIVATE_KEY")),
  );
}

/** Ready if EITHER an OAuth account is connected OR a service account is set. */
export async function isGscReady() {
  if (isGscConfigured()) return true;
  try {
    return await isOAuthConnected();
  } catch {
    return false;
  }
}

/** The Search Console property, e.g. "sc-domain:altftool.com" or "https://altftool.com/". */
export function gscSiteUrl() {
  return getServerEnv("GSC_SITE_URL") || "sc-domain:altftool.com";
}

/** Prefer the OAuth-selected property; fall back to the env property. */
export async function gscActiveSiteUrl() {
  try {
    const selected = await getActiveProperty();
    if (selected) return selected;
  } catch {
    /* ignore */
  }
  return gscSiteUrl();
}

/**
 * Bearer token resolution: prefer the org OAuth connection (auto-refreshing),
 * fall back to the service-account JWT. Throws GSC_NOT_CONFIGURED when neither
 * is available.
 */
async function getBearerToken() {
  try {
    return await getValidAccessToken();
  } catch (error) {
    if (error?.code !== "GSC_NO_OAUTH") throw error;
  }
  const client = buildClient();
  if (!client) {
    const err = new Error("Search Console is not configured (connect a Google account or set service-account credentials).");
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }
  const token = await client.getAccessToken();
  return typeof token === "string" ? token : token?.token;
}

async function gscRequest(method, url, data) {
  const token = await getBearerToken();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData?.error?.message || `Search Console request failed (${res.status}).`);
    err.status = res.status;
    err.response = { status: res.status, data: errData };
    throw err;
  }
  return res.json().catch(() => ({}));
}

export async function gscListSites() {
  const data = await gscRequest("GET", `${BASE}/webmasters/v3/sites`);
  return data?.siteEntry || [];
}

export async function gscInspectUrl(inspectionUrl, siteUrl = gscSiteUrl()) {
  const data = await gscRequest("POST", `${BASE}/v1/urlInspection/index:inspect`, {
    inspectionUrl,
    siteUrl,
    languageCode: "en-US",
  });
  return data?.inspectionResult || data;
}

export async function gscSearchAnalytics(
  { startDate, endDate, dimensions = ["query"], rowLimit = 25 } = {},
  siteUrl = gscSiteUrl(),
) {
  const data = await gscRequest(
    "POST",
    `${BASE}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { startDate, endDate, dimensions, rowLimit },
  );
  return data?.rows || [];
}

export async function gscListSitemaps(siteUrl = gscSiteUrl()) {
  const data = await gscRequest(
    "GET",
    `${BASE}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
  );
  return data?.sitemap || [];
}

export async function gscSubmitSitemap(feedpath, siteUrl = gscSiteUrl()) {
  await gscRequest(
    "PUT",
    `${BASE}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
  );
  return { ok: true };
}
