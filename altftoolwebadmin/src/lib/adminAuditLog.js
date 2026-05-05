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
    createdAt: FieldValue.serverTimestamp(),
  });
}
