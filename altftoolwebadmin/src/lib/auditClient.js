import { getAuth } from "firebase/auth";

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
    const user = getAuth().currentUser;
    if (!user) return;
    const token = await user.getIdToken(true);

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

