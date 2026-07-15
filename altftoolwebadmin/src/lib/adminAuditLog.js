// Server-side audit logger (backward-compatible facade).
//
// Historically this appended a flat doc to `admin_audit_logs`. It now DELEGATES
// to the unified writeActivityEvent, which writes the v2 `activity_events`
// envelope + rollups AND mirrors the same legacy `admin_audit_logs` doc — so
// every existing caller and the current audit view keep working unchanged, while
// events gain the full Workspace hierarchy.

import { writeActivityEvent } from "@/lib/activity/writeActivityEvent";

/**
 * @param {object} entry  { action, module, actorUid, actorEmail, targetUid,
 *   targetEmail, status, summary, changes, metadata, context, ip / geo / device,
 *   sessionId, and (optional, new) projectId/application/section/feature/route }
 */
export async function writeAdminAuditLog(entry) {
  const e = entry || {};
  return writeActivityEvent({
    ...e,
    module: e.module ?? "admin-management",
    // metadata.route is honored by the resolver; keep everything else intact.
  });
}
