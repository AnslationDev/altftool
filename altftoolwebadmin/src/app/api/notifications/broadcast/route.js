// api/notifications/broadcast/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { getRbacRootRef } from "@/lib/serverRbac";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";

// Firestore rejects a WriteBatch with more than 500 operations.
const NOTIFICATION_BATCH_LIMIT = 450;
// Upper bound on an explicit recipient list, so a malformed client cannot ask
// us to fan out an unbounded number of writes.
const MAX_EXPLICIT_RECIPIENTS = 5000;
// Stored on the broadcast doc and shown to the operator. Deliberately generic:
// the raw exception (Firestore paths, index URLs, stack text) stays in the log.
const DELIVERY_FAILURE_LABEL =
  "Delivery failed. Some recipients may already have been notified — check before resending.";

/**
 * verifySuperAdmin() throws Error("Unauthorized") for authz denials, while
 * adminAuth.verifyIdToken() throws Firebase `auth/*` errors for malformed,
 * expired or revoked tokens. Both are caller problems (401). Anything else is a
 * genuine server fault and must be reported as 500 without leaking its message.
 */
function isAuthFailure(err) {
  if (err?.message === "Unauthorized") return true;
  return typeof err?.code === "string" && err.code.startsWith("auth/");
}

function failureResponse(err) {
  return isAuthFailure(err)
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

async function verifySuperAdmin(request) {
  // verifySuperAdminRequest() is already RBAC-first with a legacy `admins`
  // fallback (lib/adminAccess.js). The extra legacy lookup that used to live
  // here ANDed the two stores together, so every superadmin created through
  // the Admins UI (RBAC-only, no legacy doc) was rejected with "Unauthorized".
  return verifySuperAdminRequest(request);
}

/**
 * Active admin uids from the RBAC store, in ONE query.
 *
 * listRbacAdminProfiles() would do the same job, but it also fans out a
 * project_access read (plus a modules read per project) for every non-super
 * admin — O(admins x projects x modules) reads purely to compute the two
 * fields we need here. The status logic below mirrors normalizeStatus() +
 * `isActive: status === "active"` in lib/serverRbac.js exactly.
 */
async function listActiveRbacAdminIds() {
  const snap = await getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).get();
  const ids = [];
  for (const doc of snap.docs) {
    const data = doc.data() || {};
    const status = data.status || (data.isActive === false ? "suspended" : "active");
    if (status === "active") ids.push(data.uid || doc.id);
  }
  return ids;
}

async function resolveTargetUsers(target) {
  if (target?.type === "all") {
    const userIds = new Set();

    // RBAC store — the source of truth for admins created via the Admins UI.
    for (const uid of await listActiveRbacAdminIds()) userIds.add(uid);

    // Legacy `admins` collection — still populated by scripts/seed-superadmin.
    const legacySnap = await adminDb.collection("admins").where("isActive", "==", true).get();
    for (const doc of legacySnap.docs) userIds.add(doc.id);

    return [...userIds];
  }
  return Array.isArray(target?.userIds) ? target.userIds : [];
}

/**
 * Write in-app notification documents and fire push notifications.
 * Exported so it can be called from scheduled Cloud Functions too.
 */
export async function deliverBroadcast(broadcastId, broadcastData) {
  const { title, body, type, target, actionUrl = "" } = broadcastData;
  const broadcastRef = adminDb.collection("notification_broadcasts").doc(broadcastId);

  try {
    const userIds = await resolveTargetUsers(target);
    const now = Date.now();

    // Write in-app notifications in chunked batches — a single batch would blow
    // the 500-operation Firestore limit and roll back the whole delivery.
    for (let i = 0; i < userIds.length; i += NOTIFICATION_BATCH_LIMIT) {
      const batch = adminDb.batch();
      for (const userId of userIds.slice(i, i + NOTIFICATION_BATCH_LIMIT)) {
        const ref = adminDb.collection("notifications").doc();
        batch.set(ref, {
          broadcastId,
          title,
          body,
          type,
          userId,
          read: false,
          actionUrl: actionUrl || "",
          createdAt: now,
        });
      }
      await batch.commit();
    }

    await broadcastRef.update({
      status: "sent",
      sentAt: now,
      recipientCount: userIds.length,
      // Clear any failure left over from an earlier attempt, so a successful
      // resend does not keep rendering the old error.
      failedAt: null,
      error: null,
    });

    // Fire push notifications via the shared helper (best-effort)
    await sendPushToUsers({
      userIds,
      title,
      body,
      data: {
        broadcastId,
        actionUrl: actionUrl || "/",
        type,
      },
    });

    return { userIds, recipientCount: userIds.length };
  } catch (err) {
    // Never leave the broadcast stuck in "draft"/"scheduled" with no error
    // state — the scheduler would retry it forever and the list would show no
    // reason for the failure. The operator recovers via PATCH ?action=resend.
    console.error("[broadcast/deliver] delivery failed:", err?.message || err);
    await broadcastRef
      .update({
        status: "failed",
        failedAt: Date.now(),
        error: DELIVERY_FAILURE_LABEL,
      })
      .catch((updateErr) => {
        console.error(
          "[broadcast/deliver] could not mark broadcast failed:",
          updateErr?.message || updateErr,
        );
      });
    throw err;
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 10,
      scope: "admin:broadcast-create",
      windowMs: 60000,
    });
    if (limited) return limited;

    const decoded = await verifySuperAdmin(request);
    const payload = await request.json();
    const { title, body, type, target, actionUrl = "", sendNow, scheduledAt } = payload;

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }
    if (!["announcement", "warning", "notice"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!target?.type || !["all", "users"].includes(target.type)) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
    if (target.type === "users") {
      if (!Array.isArray(target.userIds) || !target.userIds.length) {
        return NextResponse.json({ error: "userIds required when target is 'users'" }, { status: 400 });
      }
      if (!target.userIds.every((id) => typeof id === "string" && id.trim())) {
        return NextResponse.json({ error: "userIds must be non-empty strings" }, { status: 400 });
      }
      if (target.userIds.length > MAX_EXPLICIT_RECIPIENTS) {
        return NextResponse.json(
          { error: `userIds cannot exceed ${MAX_EXPLICIT_RECIPIENTS} recipients` },
          { status: 400 },
        );
      }
    }
    if (!sendNow && !scheduledAt) {
      return NextResponse.json({ error: "scheduledAt required for scheduled broadcasts" }, { status: 400 });
    }

    if (decoded.isLocalAdmin) {
      return NextResponse.json({
        success: true,
        broadcastId: "local-dev-broadcast",
        status: sendNow ? "sent" : "scheduled",
      });
    }

    const now = Date.now();
    const broadcastRef = adminDb.collection("notification_broadcasts").doc();
    const broadcastData = {
      title: title.trim(),
      body: body.trim(),
      type,
      target,
      actionUrl: actionUrl?.trim() || "",
      status: sendNow ? "draft" : "scheduled",
      scheduledAt: sendNow ? null : scheduledAt,
      sentAt: null,
      createdBy: decoded.uid,
      createdAt: now,
    };

    await broadcastRef.set(broadcastData);

    let recipientCount = null;
    if (sendNow) {
      const result = await deliverBroadcast(broadcastRef.id, broadcastData);
      recipientCount = result.recipientCount;
    }

    return NextResponse.json({
      success: true,
      broadcastId: broadcastRef.id,
      status: sendNow ? "sent" : "scheduled",
      recipientCount,
    });
  } catch (err) {
    console.error("[broadcast/POST]", err?.message || err);
    return failureResponse(err);
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 120,
      scope: "admin:broadcast-list",
      windowMs: 60000,
    });
    if (limited) return limited;

    const decoded = await verifySuperAdmin(request);

    if (decoded.isLocalAdmin) {
      return NextResponse.json({ broadcasts: [] });
    }

    const snap = await adminDb
      .collection("notification_broadcasts")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const broadcasts = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title,
        body: d.body,
        type: d.type,
        target: d.target,
        status: d.status,
        actionUrl: d.actionUrl ?? "",
        scheduledAt: d.scheduledAt ?? null,
        sentAt: d.sentAt ?? null,
        recipientCount: d.recipientCount ?? null,
        error: d.error ?? null,
        createdBy: d.createdBy,
        createdAt: d.createdAt,
      };
    });

    return NextResponse.json({ broadcasts });
  } catch (err) {
    // A missing index or a Firestore outage is NOT an authorization problem —
    // reporting it as 401 told a legitimate super admin they were unauthorized.
    console.error("[broadcast/GET]", err?.message || err);
    return failureResponse(err);
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "admin:broadcast-delete",
      windowMs: 60000,
    });
    if (limited) return limited;

    const decoded = await verifySuperAdmin(request);
    if (decoded.isLocalAdmin) {
      return NextResponse.json({ success: true });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await adminDb.collection("notification_broadcasts").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[broadcast/DELETE]", err?.message || err);
    return failureResponse(err);
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request) {
  try {
    // ?action=resend fans out writes + push, so this handler needs the same
    // protection as the other mutating endpoints.
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "admin:broadcast-update",
      windowMs: 60000,
    });
    if (limited) return limited;

    const decoded = await verifySuperAdmin(request);
    if (decoded.isLocalAdmin) {
      return NextResponse.json({ success: true });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    if (action === "cancel") {
      await adminDb.collection("notification_broadcasts").doc(id).update({
        status: "draft",
        scheduledAt: null,
      });
      return NextResponse.json({ success: true });
    }

    // Recovery path for a broadcast that failed mid-delivery, and the only way
    // to send a draft (a cancelled schedule) — without it a single transient
    // Firestore blip left the send permanently dead with no way back.
    if (action === "resend") {
      const ref = adminDb.collection("notification_broadcasts").doc(id);

      // The check (status !== "sent"/"scheduled") and the act (deliverBroadcast)
      // were two separate steps, so two concurrent resend calls (or an
      // overlapping scheduler run) could both read a resendable status and both
      // fan out the full delivery — a transaction makes the claim atomic.
      let data;
      try {
        data = await adminDb.runTransaction(async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists) {
            throw Object.assign(new Error("Broadcast not found"), { code: "not-found" });
          }
          const current = snap.data() || {};
          if (current.status === "sent") {
            throw Object.assign(new Error("This broadcast has already been sent."), { code: "already-sent" });
          }
          if (current.status === "scheduled") {
            throw Object.assign(
              new Error("Cancel the schedule before sending this broadcast manually."),
              { code: "scheduled" },
            );
          }
          if (current.status === "sending") {
            throw Object.assign(new Error("This broadcast is already being sent."), { code: "in-flight" });
          }
          tx.update(ref, { status: "sending" });
          return current;
        });
      } catch (claimErr) {
        if (claimErr?.code === "not-found") {
          return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
        }
        if (["already-sent", "scheduled", "in-flight"].includes(claimErr?.code)) {
          return NextResponse.json({ error: claimErr.message }, { status: 400 });
        }
        throw claimErr;
      }

      try {
        const result = await deliverBroadcast(id, data);
        return NextResponse.json({ success: true, recipientCount: result.recipientCount });
      } catch {
        // deliverBroadcast() has already logged the raw error and re-marked the
        // broadcast as failed; the client only gets a safe summary.
        return NextResponse.json(
          { error: "Delivery failed. The broadcast is still marked failed — try again." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[broadcast/PATCH]", err?.message || err);
    return failureResponse(err);
  }
}
