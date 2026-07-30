/**
 * Centralized API Client for ALTFLinking Marketplace
 * Location: src/app/altflinking/services/apiClient.js
 *
 * Attaches Firebase Auth ID tokens to all backend requests.
 * Handles API errors and standardizes network communications.
 */

import { auth } from "./firebase";

async function getAuthToken() {
  if (!auth || !auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (e) {
    console.warn("Failed to get ID token:", e);
    return null;
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data.data !== undefined ? data.data : data;
}

// ---------------------------------------------------------------------------
// PUBLIC / MARKETPLACE APIs
// ---------------------------------------------------------------------------

export async function fetchMarketplaceListings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.niche && filters.niche !== "All") params.set("niche", filters.niche);
  if (filters.minDr) params.set("minDr", filters.minDr);
  if (filters.minTraffic) params.set("minTraffic", filters.minTraffic);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.search) params.set("search", filters.search);
  if (filters.publisherId) params.set("publisherId", filters.publisherId);

  return apiFetch(`/api/altflinking/listings?${params.toString()}`);
}

export async function submitWebsiteListing(payload) {
  return apiFetch("/api/altflinking/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyDnsRecord(domain, token) {
  return apiFetch("/api/altflinking/verify-dns", {
    method: "POST",
    body: JSON.stringify({ domain, token }),
  });
}

export async function updateListing(id, payload) {
  return apiFetch(`/api/altflinking/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// ORDERS APIs
// ---------------------------------------------------------------------------

export async function fetchUserOrders() {
  return apiFetch("/api/altflinking/orders");
}

export async function placeOrder(payload) {
  return apiFetch("/api/altflinking/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(orderId, status, extraData = {}) {
  return apiFetch(`/api/altflinking/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...extraData }),
  });
}

// ---------------------------------------------------------------------------
// LINK INSPECTOR API
// ---------------------------------------------------------------------------

export async function inspectBacklink(url, targetAnchor = "") {
  return apiFetch("/api/altflinking/inspect-backlink", {
    method: "POST",
    body: JSON.stringify({ url, targetAnchor }),
  });
}

// ---------------------------------------------------------------------------
// ADMIN APIs
// ---------------------------------------------------------------------------

export async function fetchAdminListings(status = "all") {
  const params = new URLSearchParams({ status });
  return apiFetch(`/api/altflinking/admin/listings?${params.toString()}`);
}

export async function moderateListing(id, action, extra = {}) {
  return apiFetch("/api/altflinking/admin/listings", {
    method: "PATCH",
    body: JSON.stringify({ id, action, ...extra }),
  });
}

// ---------------------------------------------------------------------------
// WITHDRAWALS APIs
// ---------------------------------------------------------------------------

export async function fetchWithdrawals() {
  return apiFetch("/api/altflinking/withdrawals");
}

export async function requestWithdrawal(payload) {
  return apiFetch("/api/altflinking/withdrawals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// CAMPAIGNS APIs
// ---------------------------------------------------------------------------

export async function fetchUserCampaigns() {
  return apiFetch("/api/altflinking/campaigns");
}

export async function createCampaign(payload) {
  return apiFetch("/api/altflinking/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
