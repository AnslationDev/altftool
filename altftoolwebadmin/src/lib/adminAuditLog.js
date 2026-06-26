import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

const COLLECTION = "admin_audit_logs";

/**
 * Server-side audit logger for admin-management actions.
 * Writes via Admin SDK (no Firestore rules changes required).
 */
export async function writeAdminAuditLog(entry) {
  const {
    action,
    module = "admin-management",
    actorUid,
    actorEmail,
    targetUid,
    targetEmail,
    status,
    summary,
    changes,
    metadata,
  } = entry || {};

  if (!action) throw new Error("Audit log requires action");

  // Optional security context (device / browser / masked+encrypted IP /
  // approx location / session) — enriches the log when available, but every
  // field is optional so existing callers keep working unchanged.
  const ctx = entry?.context || {};

  await adminDb.collection(COLLECTION).add({
    action,
    module,
    actorUid: actorUid ?? null,
    actorEmail: actorEmail ?? null,
    targetUid: targetUid ?? null,
    targetEmail: targetEmail ?? null,
    status: status ?? "success",
    summary: summary ?? null,
    changes: changes ?? null,
    metadata: metadata ?? null,
    // security context (nullable)
    ipMasked: entry?.ipMasked ?? ctx?.ip?.masked ?? null,
    ipEncrypted: entry?.ipEncrypted ?? ctx?.ip?.encrypted ?? null,
    country: entry?.country ?? ctx?.geo?.country ?? null,
    region: entry?.region ?? ctx?.geo?.region ?? null,
    city: entry?.city ?? ctx?.geo?.city ?? null,
    deviceLabel: entry?.deviceLabel ?? ctx?.deviceLabel ?? null,
    browser: entry?.browser ?? ctx?.ua?.browser ?? null,
    os: entry?.os ?? ctx?.ua?.os ?? null,
    deviceId: entry?.deviceId ?? ctx?.deviceId ?? null,
    sessionId: entry?.sessionId ?? null,
    createdAtMs: Date.now(),
    createdAt: FieldValue.serverTimestamp(),
  });
}
