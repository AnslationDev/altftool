/**
 * Link Health & Indexation Inspector Service
 * Location: src/app/altflinking/services/linkInspectorService.js
 *
 * Calls a real server-side check (browsers can't fetch arbitrary
 * third-party domains directly due to CORS) — see
 * /api/altflinking/inspect-backlink for the actual crawl.
 */

import * as apiClient from "./apiClient";

export async function inspectBacklink(url, targetAnchor = "") {
  try {
    return await apiClient.inspectBacklink(url, targetAnchor);
  } catch (error) {
    return {
      success: false,
      error: error.message || "Invalid URL provided. Please include protocol (e.g. https://domain.com/article)",
    };
  }
}
