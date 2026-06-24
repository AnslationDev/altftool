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

/** The Search Console property, e.g. "sc-domain:altftool.com" or "https://altftool.com/". */
export function gscSiteUrl() {
  return getServerEnv("GSC_SITE_URL") || "sc-domain:altftool.com";
}

async function gscRequest(method, url, data) {
  const client = buildClient();
  if (!client) {
    const err = new Error("Search Console is not configured (missing service-account credentials).");
    err.code = "GSC_NOT_CONFIGURED";
    throw err;
  }
  const res = await client.request({ url, method, data });
  return res.data;
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
