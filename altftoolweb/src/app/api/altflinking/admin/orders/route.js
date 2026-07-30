/**
 * API: Admin — Orders full management
 * GET   /api/altflinking/admin/orders  — all orders (all statuses)
 * PATCH /api/altflinking/admin/orders  — update any order status
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { initAdmin }  from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue } from "firebase-admin/firestore";

async function assertAdmin(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return { user: null, error: error || "Unauthorized" };
  const role = await getUserRole(user.uid);
  if (!["ADMIN", "SUPERADMIN"].includes(role)) return { user, error: "Admin access required" };
  return { user, role, error: null };
}

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "altflinking:admin-orders",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { error } = await assertAdmin(request);
  if (error) return err(error, error === "Unauthorized" ? 401 : 403);

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const search       = searchParams.get("search") || "";

    let query = db.collection("orders").orderBy("createdAt", "desc");
    if (statusFilter && statusFilter !== "all") {
      query = db.collection("orders")
        .where("status", "==", statusFilter)
        .orderBy("createdAt", "desc");
    }

    const snap = await query.limit(500).get();
    let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter((o) =>
        (o.websiteDomain || "").toLowerCase().includes(q) ||
        (o.buyerEmail    || "").toLowerCase().includes(q) ||
        (o.anchorText    || "").toLowerCase().includes(q) ||
        (o.id            || "").toLowerCase().includes(q)
      );
    }

    return ok(orders);
  } catch (e) {
    console.error("[GET /admin/orders]", e);
    return err("Failed to fetch orders", 500);
  }
}

export async function PATCH(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    scope: "altflinking:admin-orders",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await assertAdmin(request);
  if (error) return err(error, error === "Unauthorized" ? 401 : 403);

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const body = await request.json();
    const { id, status, adminNotes, liveLinkUrl, isDofollow, isIndexed } = body;
    if (!id)     return err("Order id is required", 400);
    if (!status) return err("status is required", 400);

    const VALID_STATUSES = [
      "PENDING_ADMIN_APPROVAL", "ADMIN_APPROVED", "PENDING_ACCEPTANCE",
      "ACCEPTED", "PUBLISHED", "VERIFIED_LIVE", "DISPUTED",
      "CANCELLED", "COMPLETED",
    ];
    if (!VALID_STATUSES.includes(status)) {
      return err(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`, 400);
    }

    const docRef = db.collection("orders").doc(id);
    if (!(await docRef.get()).exists) return err("Order not found", 404);

    const now = FieldValue.serverTimestamp();
    const update = {
      status,
      adminNotes:  adminNotes || "",
      updatedAt:   now,
      statusHistory: FieldValue.arrayUnion({
        status,
        timestamp: new Date().toISOString(),
        by:        user.uid,
        byRole:    "ADMIN",
        note:      adminNotes || `Admin updated to ${status}`,
      }),
    };

    if (status === "ADMIN_APPROVED") {
      update.adminApprovedBy = user.uid;
      update.adminApprovedAt = now;
    }
    if (liveLinkUrl) update.liveLinkUrl = liveLinkUrl;
    if (status === "VERIFIED_LIVE") {
      update.isDofollow = isDofollow ?? true;
      update.isIndexed  = isIndexed  ?? true;
      update.crawledAt  = now;
    }

    await docRef.update(update);
    return ok({ id, status, adminNotes });
  } catch (e) {
    console.error("[PATCH /admin/orders]", e);
    return err("Failed to update order", 500);
  }
}
