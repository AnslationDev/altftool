// api/notifications/broadcast/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";

async function verifySuperAdmin(request) {
  const decoded = await verifySuperAdminRequest(request);
  if (decoded.isLocalAdmin) return decoded;

  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  const data = snap.data();
  if (!snap.exists || data?.roleType !== "superadmin" || !data?.isActive) {
    throw new Error("Unauthorized");
  }
  return decoded;
}

async function resolveTargetUsers(target) {
  if (target.type === "all") {
    const snap = await adminDb.collection("admins").where("isActive", "==", true).get();
    return snap.docs.map((d) => d.id);
  }
  return target.userIds ?? [];
}

/**
 * Write in-app notification documents and fire push notifications.
 * Exported so it can be called from scheduled Cloud Functions too.
 */
export async function deliverBroadcast(broadcastId, broadcastData) {
  const { title, body, type, target, actionUrl = "" } = broadcastData;
  const userIds = await resolveTargetUsers(target);
  const now = Date.now();

  // Write in-app notifications in a single batch
  const batch = adminDb.batch();
  for (const userId of userIds) {
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
  batch.update(adminDb.collection("notification_broadcasts").doc(broadcastId), {
    status: "sent",
    sentAt: now,
  });
  await batch.commit();

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

  return { userIds };
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
    if (target.type === "users" && (!Array.isArray(target.userIds) || !target.userIds.length)) {
      return NextResponse.json({ error: "userIds required when target is 'users'" }, { status: 400 });
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

    if (sendNow) {
      await deliverBroadcast(broadcastRef.id, broadcastData);
    }

    return NextResponse.json({
      success: true,
      broadcastId: broadcastRef.id,
      status: sendNow ? "sent" : "scheduled",
    });
  } catch (err) {
    console.error("[broadcast/POST]", err.message);
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
        createdBy: d.createdBy,
        createdAt: d.createdAt,
      };
    });

    return NextResponse.json({ broadcasts });
  } catch (err) {
    console.error("[broadcast/GET]", err.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("[broadcast/DELETE]", err.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request) {
  try {
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[broadcast/PATCH]", err.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
