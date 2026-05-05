import { getAuth } from "firebase/auth";

/**
 * Client-side helper: logs audit events via server endpoint.
 * Never throws (audit should not block core CRUD flows).
 */
export async function logAuditEvent(event) {
  try {
    const user = getAuth().currentUser;
    if (!user) return;
    const token = await user.getIdToken(true);

    await fetch("/api/audit/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event || {}),
    });
  } catch {
    // intentionally ignore
  }
}

