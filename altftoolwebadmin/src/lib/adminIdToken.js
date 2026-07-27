"use client";

import { auth } from "@/lib/firebaseAuth";
import { createLocalAdminUser, hasLocalAdminSession } from "@/lib/localAdminSession";

/**
 * Bearer token for admin API calls, valid in BOTH auth modes.
 *
 * Screens that read `getAuth().currentUser?.getIdToken()` directly break under a
 * local-admin session, because that mode has no Firebase user at all. The
 * failure is inconsistent and hard to spot: pages that guard with
 * `if (!token) return;` silently render zeroes, while pages that throw show a
 * dead-end "your session is not ready" error that refreshing cannot fix.
 *
 * The server already accepts the local-dev token (see lib/adminAccess.js, gated
 * on NODE_ENV === "development"), so the only missing piece was a client that
 * actually sends it.
 *
 * @param {boolean} forceRefresh Force a Firebase token refresh. Ignored for the
 *   local-admin session, whose token is a fixed well-known string.
 * @returns {Promise<string|null>} the token, or null when nobody is signed in.
 */
export async function getAdminIdToken(forceRefresh = false) {
  if (hasLocalAdminSession()) {
    return createLocalAdminUser().getIdToken();
  }

  const current = auth.currentUser;
  if (!current) return null;

  return current.getIdToken(forceRefresh);
}
