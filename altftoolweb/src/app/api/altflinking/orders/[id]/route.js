/**
 * API: Order status update — accept, publish, verify, dispute
 * PATCH /api/altflinking/orders/[id]
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { initAdmin }  from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue } from "firebase-admin/firestore";

// Valid status transitions by role
const ALLOWED_TRANSITIONS = {
  PUBLISHER: {
    ADMIN_APPROVED:    ["PENDING_ACCEPTANCE"],
    PENDING_ACCEPTANCE: ["ACCEPTED", "CANCELLED"],
    ACCEPTED:          ["PUBLISHED"],
  },
  BUYER: {
    PUBLISHED:         ["DISPUTED"],
  },
  ADMIN: {
    // Admin can move to any status
    "*": ["PENDING_ADMIN_APPROVAL", "ADMIN_APPROVED", "PENDING_ACCEPTANCE",
          "ACCEPTED", "PUBLISHED", "VERIFIED_LIVE", "DISPUTED", "CANCELLED", "COMPLETED"],
  },
  SUPERADMIN: { "*": ["*"] },
};

export async function PATCH(request, { params }) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    scope: "altflinking:orders-id",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus, liveLinkUrl, adminNotes, note } = body;

    if (!newStatus) return err("Missing status field", 400);

    const docRef = db.collection("orders").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return err("Order not found", 404);

    const order = snap.data();
    const currentStatus = order.status;

    // RBAC: Publisher can only update their own orders
    if (role === "PUBLISHER" && order.publisherId !== user.uid) {
      return err("You can only update orders on your listings", 403);
    }
    // Buyer can only update their own orders
    if (role === "BUYER" && order.buyerId !== user.uid) {
      return err("You can only update your own orders", 403);
    }

    // Validate transition — unknown/missing role is denied, not skipped
    const roleTransitions = ALLOWED_TRANSITIONS[role];
    if (!roleTransitions) {
      return err("Forbidden", 403);
    }
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      const allowed = roleTransitions[currentStatus] || roleTransitions["*"] || [];
      if (!allowed.includes(newStatus)) {
        return err(
          `Transition ${currentStatus} → ${newStatus} not allowed for role ${role}`,
          403
        );
      }
    }

    const now = FieldValue.serverTimestamp();
    const update = {
      status:    newStatus,
      updatedAt: now,
      statusHistory: FieldValue.arrayUnion({
        status:    newStatus,
        timestamp: new Date().toISOString(),
        by:        user.uid,
        byRole:    role,
        note:      note || `Status updated to ${newStatus}`,
      }),
    };

    if (liveLinkUrl) update.liveLinkUrl = liveLinkUrl;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    if (newStatus === "ADMIN_APPROVED") {
      update.adminApprovedBy = user.uid;
      update.adminApprovedAt = now;
    }
    if (newStatus === "VERIFIED_LIVE") {
      update.isDofollow = body.isDofollow ?? true;
      update.isIndexed  = body.isIndexed  ?? true;
      update.crawledAt  = now;
    }

    await docRef.update(update);
    return ok({ id, ...order, ...update, status: newStatus });
  } catch (e) {
    console.error("[PATCH /orders/:id]", e);
    return err("Failed to update order", 500);
  }
}

export async function GET(request, { params }) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "altflinking:orders-id",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const { id } = await params;
    const snap = await db.collection("orders").doc(id).get();
    if (!snap.exists) return err("Order not found", 404);

    const order = { id: snap.id, ...snap.data() };

    // RBAC: only involved parties or admin
    if (role === "BUYER"     && order.buyerId     !== user.uid) return err("Forbidden", 403);
    if (role === "PUBLISHER" && order.publisherId !== user.uid) return err("Forbidden", 403);

    return ok(order);
  } catch (e) {
    console.error("[GET /orders/:id]", e);
    return err("Failed to fetch order", 500);
  }
}
