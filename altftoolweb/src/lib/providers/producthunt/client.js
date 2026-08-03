/**
 * Product Hunt API v2 — server-only, requires PRODUCTHUNT_API_KEY
 * (client id) + PRODUCTHUNT_API_SECRET (client secret). Never import
 * this from a "use client" component; go through /api/tools instead, so
 * the credentials never reach the browser.
 *
 * Different shape from every other provider here on purpose: Product
 * Hunt is GraphQL, not REST, and auth is a real OAuth2 client-credentials
 * exchange (POST client_id/client_secret -> short-lived bearer token),
 * not a static key sent with each request. Confirmed live against the
 * actual endpoints: POST /v2/oauth/token without a body 400s with
 * "Missing required parameter: grant_type", and the GraphQL endpoint
 * 401s on a request with no/invalid bearer token — both consistent with
 * Product Hunt's documented OAuth2 flow.
 */

import { requireProviderApproval, requireProviderKey } from "@/lib/providers/_shared/configuration";

const PRODUCTHUNT_OAUTH_URL = "https://api.producthunt.com/v2/oauth/token";
const PRODUCTHUNT_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql";
const FETCH_TIMEOUT_MS = 10_000;

async function fetchJsonWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = response.ok ? await response.json() : null;
    return { response, data };
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("Product Hunt request timed out.");
      timeoutError.code = "UPSTREAM_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getCredentials() {
  // Product Hunt's API requires separate approval for business/commercial
  // usage. Keep the public proxy inert unless that approval has been
  // recorded explicitly in the deployment configuration.
  requireProviderApproval("ALTFT_TOP10_PRODUCTHUNT_APPROVED", "Product Hunt");
  // Both halves are required, and either one missing is the same
  // not-configured state — reported through the same tagged error so the
  // route degrades to an honest empty list instead of a 502.
  const clientId = requireProviderKey("PRODUCTHUNT_API_KEY", "Product Hunt");
  const clientSecret = requireProviderKey("PRODUCTHUNT_API_SECRET", "Product Hunt");
  return { clientId, clientSecret };
}

export function assertProductHuntConfigured() {
  getCredentials();
}

// Module-level memo — cheap reuse of the access token across requests
// within the same warm server instance; re-fetched once it's expired.
// Serverless-safe: worst case (cold start) is one extra token fetch.
let cachedToken = null;
let pendingToken = null;

async function fetchAccessToken() {
  const { clientId, clientSecret } = getCredentials();

  const { response, data } = await fetchJsonWithTimeout(PRODUCTHUNT_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const error = new Error("Product Hunt authentication failed.");
    error.code = "UPSTREAM_AUTH_ERROR";
    error.status = response.status;
    throw error;
  }

  return {
    token: data.access_token,
    // Refresh a minute early so a near-expiry token is never used mid-request.
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000 - 60_000,
  };
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  if (!pendingToken) {
    pendingToken = fetchAccessToken()
      .then((token) => {
        cachedToken = token;
        return token.token;
      })
      .finally(() => {
        pendingToken = null;
      });
  }
  return pendingToken;
}

/** Runs one GraphQL query against Product Hunt's v2 API, handling the OAuth2 token exchange transparently. */
export async function productHuntQuery(query, variables = {}) {
  const token = await getAccessToken();

  const { response, data: json } = await fetchJsonWithTimeout(PRODUCTHUNT_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const error = new Error("Product Hunt request failed.");
    error.code = "UPSTREAM_RESPONSE_ERROR";
    error.status = response.status;
    throw error;
  }

  if (json.errors?.length) {
    const error = new Error("Product Hunt returned a GraphQL error.");
    error.code = "UPSTREAM_GRAPHQL_ERROR";
    throw error;
  }
  return json.data;
}
