import { getAdminIdToken } from "@/lib/adminIdToken";

/**
 * Client-side helper: logs audit events via the server endpoint.
 * Never throws (audit should not block core CRUD flows).
 *
 * The current pathname is attached as `route` (when the caller didn't set one)
 * so the server-side Workspace resolver can classify the event into
 * project / application / module — turning "Blogs Updated" into
 * "AltFTool → Admin Panel → Blogs". Existing callers are otherwise unchanged.
 */
export async function logAuditEvent(event) {
  try {
    // getAdminIdToken() (not a forced getIdToken(true)) — this function is
    // called from essentially every save/update/delete flow in the app
    // (100+ call sites), so a forced refresh added an extra Firebase Auth
    // round trip to nearly every write. It also works under a local-admin
    // dev session, which getAuth().currentUser is always null for.
    const token = await getAdminIdToken();
    if (!token) return;

    const payload = { ...(event || {}) };
    if (!payload.route && typeof window !== "undefined" && window.location?.pathname) {
      payload.route = window.location.pathname;
    }

    await fetch("/api/audit/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // intentionally ignore
  }
}

