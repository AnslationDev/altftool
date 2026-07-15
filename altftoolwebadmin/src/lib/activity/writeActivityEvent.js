// Unified Activity Event writer (server / Admin SDK).
//
// One entry point for every workspace event. For each event it:
//   1. resolves the hierarchy node via the Workspace resolver (Phase 2),
//   2. writes a v2 envelope to `activity_events`,
//   3. increments `activity_rollups` for the node AND each ancestor prefix,
//   4. mirrors a v1-shaped doc into `admin_audit_logs` (so the existing audit
//      table/APIs keep working unchanged — zero-downtime, backward compatible).
//
// It never throws: auditing must never break a CRUD flow.

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { buildWorkspaceContext } from "@/lib/workspace";
import { actionKindFor } from "./actionKinds";

export const ACTIVITY_EVENTS_COLLECTION = "activity_events";
export const ACTIVITY_ROLLUPS_COLLECTION = "activity_rollups";
export const LEGACY_AUDIT_COLLECTION = "admin_audit_logs";
const ACTIVITY_SCHEMA_VERSION = 2;

// "/" is the Firestore path separator, so a hierarchyPath can't be a doc id.
function rollupDocId(hierarchyPath) {
  return String(hierarchyPath || "unclassified").replace(/\//g, "~");
}

// ["altftool","altftool/admin-panel","altftool/admin-panel/blogs", …]
function ancestorPaths(hierarchyPath) {
  const segs = String(hierarchyPath || "").split("/").filter(Boolean);
  const out = [];
  let acc = "";
  for (const seg of segs) {
    acc = acc ? `${acc}/${seg}` : seg;
    out.push(acc);
  }
  return out.length ? out : ["unclassified"];
}

// Build the v2 event envelope (no I/O). Exposed for testing/consumers.
export function buildActivityEvent(entry = {}, nowMs = null) {
  const ctx = buildWorkspaceContext(
    {
      project: entry.projectId || entry.project || null,
      application: entry.application || null,
      module: entry.moduleKey || entry.module || null,
      section: entry.section || null,
      feature: entry.feature || null,
      route: entry.route || entry.metadata?.route || null,
    },
    {
      actor: { uid: entry.actorUid, email: entry.actorEmail, role: entry.actorRole || entry.role },
      device: entry.context || null,
    },
  );
  const node = ctx.node;
  const c = entry.context || {};
  const createdAtMs = typeof nowMs === "number" ? nowMs : null;

  return {
    // hierarchy (denormalized, join-free)
    workspace: node.workspace,
    projectId: node.projectId,
    projectName: node.projectName,
    application: node.application,
    applicationName: node.applicationName,
    moduleKey: node.moduleKey,
    moduleName: node.moduleName,
    section: node.section,
    sectionName: node.sectionName,
    feature: node.feature,
    featureName: node.featureName,
    hierarchyPath: node.hierarchyPath,
    // Every ancestor path (incl. self). Enables time-ordered SUBTREE feeds:
    // where("pathAncestors","array-contains", <node>).orderBy("createdAtMs","desc").
    pathAncestors: ancestorPaths(node.hierarchyPath),
    resolvedBy: node.source,
    // event
    consumer: entry.consumer || "audit",
    action: entry.action || null,
    actionKind: actionKindFor(entry.action),
    entityType: entry.entityType ?? entry.metadata?.entityType ?? null,
    entityId: entry.entityId ?? entry.metadata?.entityId ?? null,
    entityName: entry.entityName ?? null,
    summary: entry.summary ?? null,
    changes: entry.changes ?? null,
    status: entry.status ?? "success",
    // actor
    actorUid: ctx.actor.uid,
    actorEmail: ctx.actor.email,
    actorRole: ctx.actor.role,
    // context
    route: entry.route ?? entry.metadata?.route ?? null,
    ipMasked: entry.ipMasked ?? c?.ip?.masked ?? null,
    ipEncrypted: entry.ipEncrypted ?? c?.ip?.encrypted ?? null,
    country: entry.country ?? c?.geo?.country ?? null,
    region: entry.region ?? c?.geo?.region ?? null,
    city: entry.city ?? c?.geo?.city ?? null,
    deviceLabel: entry.deviceLabel ?? c?.deviceLabel ?? null,
    browser: entry.browser ?? c?.ua?.browser ?? null,
    os: entry.os ?? c?.ua?.os ?? null,
    deviceId: entry.deviceId ?? c?.deviceId ?? null,
    sessionId: entry.sessionId ?? null,
    // time
    createdAtMs,
    schemaVersion: ACTIVITY_SCHEMA_VERSION,
  };
}

// v1-shaped doc so the existing audit table / /api/admin/audit/list keep working.
function buildLegacyMirror(event) {
  return {
    action: event.action,
    module: event.moduleKey || null,
    actorUid: event.actorUid ?? null,
    actorEmail: event.actorEmail ?? null,
    targetUid: event.targetUid ?? null,
    targetEmail: event.targetEmail ?? null,
    status: event.status ?? "success",
    summary: event.summary ?? null,
    changes: event.changes ?? null,
    metadata: {
      entityType: event.entityType ?? null,
      entityId: event.entityId ?? null,
      route: event.route ?? null,
      // new hierarchy context, surfaced to legacy consumers that look for it
      projectId: event.projectId,
      application: event.application,
      hierarchyPath: event.hierarchyPath,
    },
    ipMasked: event.ipMasked ?? null,
    ipEncrypted: event.ipEncrypted ?? null,
    country: event.country ?? null,
    region: event.region ?? null,
    city: event.city ?? null,
    deviceLabel: event.deviceLabel ?? null,
    browser: event.browser ?? null,
    os: event.os ?? null,
    deviceId: event.deviceId ?? null,
    sessionId: event.sessionId ?? null,
  };
}

/**
 * Write one activity event (v2 + rollups + legacy mirror). Never throws.
 * @param {object} entry
 */
export async function writeActivityEvent(entry = {}) {
  try {
    if (!entry.action) return; // an event without an action is a no-op (parity with old logger)

    const nowMs = Date.now();
    const event = buildActivityEvent(entry, nowMs);
    const serverTs = FieldValue.serverTimestamp();

    const batch = adminDb.batch();

    // 1. the event
    const eventRef = adminDb.collection(ACTIVITY_EVENTS_COLLECTION).doc();
    batch.set(eventRef, { ...event, createdAt: serverTs });

    // 2. rollups for the node + every ancestor prefix
    const kind = event.actionKind;
    const actorKey = event.actorUid && /^[A-Za-z0-9_-]+$/.test(event.actorUid) ? event.actorUid : null;
    for (const path of ancestorPaths(event.hierarchyPath)) {
      const ref = adminDb.collection(ACTIVITY_ROLLUPS_COLLECTION).doc(rollupDocId(path));
      const rollup = {
        hierarchyPath: path,
        count: FieldValue.increment(1),
        byAction: { [kind]: FieldValue.increment(1) },
        lastAtMs: nowMs,
        lastAction: event.action,
        updatedAt: serverTs,
      };
      if (actorKey) rollup.byActor = { [actorKey]: FieldValue.increment(1) };
      batch.set(ref, rollup, { merge: true });
    }

    // 3. legacy mirror (keeps the current audit view working)
    const legacyRef = adminDb.collection(LEGACY_AUDIT_COLLECTION).doc();
    batch.set(legacyRef, {
      ...buildLegacyMirror(event),
      targetUid: entry.targetUid ?? null,
      targetEmail: entry.targetEmail ?? null,
      createdAtMs: nowMs,
      createdAt: serverTs,
    });

    await batch.commit();
    return eventRef.id;
  } catch (error) {
    // Never let auditing break a CRUD flow.
    console.warn("[activity] writeActivityEvent failed:", error?.message || error);
    return null;
  }
}
