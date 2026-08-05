/**
 * API: Admin — Listings moderation (full CRUD)
 * GET   /api/altflinking/admin/listings  — all listings (all statuses)
 * PATCH /api/altflinking/admin/listings  — approve / reject / edit / feature
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { initAdmin }  from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue } from "firebase-admin/firestore";
import { validateListingPrices } from "@/app/altflinking/lib/pricing";

async function assertAdmin(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return { user: null, role: null, error: error || "Unauthorized" };
  const role = await getUserRole(user.uid);
  if (!["ADMIN", "SUPERADMIN"].includes(role)) {
    return { user, role, error: "Admin access required" };
  }
  return { user, role, error: null };
}

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "altflinking:admin-listings",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, role, error } = await assertAdmin(request);
  if (error) return err(error, error === "Unauthorized" ? 401 : 403);

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // PENDING_REVIEW | APPROVED | REJECTED | all

    let query = db.collection("listings").orderBy("createdAt", "desc");
    if (statusFilter && statusFilter !== "all") {
      query = db.collection("listings")
        .where("status", "==", statusFilter)
        .orderBy("createdAt", "desc");
    }

    const snap = await query.limit(500).get();
    const listings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return ok(listings);
  } catch (e) {
    console.error("[GET /admin/listings]", e);
    return err("Failed to fetch listings", 500);
  }
}

export async function PATCH(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    scope: "altflinking:admin-listings",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, role, error } = await assertAdmin(request);
  if (error) return err(error, error === "Unauthorized" ? 401 : 403);

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const body = await request.json();
    const { id, action, adminNotes, ...editFields } = body;
    if (!id) return err("Listing id is required", 400);

    const docRef = db.collection("listings").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return err("Listing not found", 404);

    const now = FieldValue.serverTimestamp();
    let update = { updatedAt: now };

    if (action === "approve") {
      update.status      = "APPROVED";
      update.verified    = true;
      update.approvedBy  = user.uid;
      update.approvedAt  = now;
      update.adminNotes  = adminNotes || "";
    } else if (action === "reject") {
      if (!adminNotes) return err("adminNotes (rejection reason) is required", 400);
      update.status     = "REJECTED";
      update.verified   = false;
      update.adminNotes = adminNotes;
    } else if (action === "suspend") {
      update.status     = "SUSPENDED";
      update.adminNotes = adminNotes || "";
    } else if (action === "feature") {
      update.featured = !!body.featured;
    } else if (action === "edit") {
      // Admin can edit any field
      const safeFields = ["name", "niche", "dr", "da", "traffic", "spamScore",
                          "indexRate", "tatDays", "guidelines",
                          "sampleUrls", "language", "country", "featured"];
      for (const f of safeFields) {
        if (editFields[f] !== undefined) update[f] = editFields[f];
      }
      if (editFields.prices !== undefined) {
        const validatedPrices = validateListingPrices(editFields.prices);
        if (validatedPrices.error) return err(validatedPrices.error, 400);
        update.prices = validatedPrices.value;
      }
      if (adminNotes !== undefined) update.adminNotes = adminNotes;
    } else {
      return err(`Unknown action: ${action}. Use: approve | reject | suspend | feature | edit`, 400);
    }

    await docRef.update(update);
    return ok({ id, action, ...update });
  } catch (e) {
    console.error("[PATCH /admin/listings]", e);
    return err("Failed to update listing", 500);
  }
}

export async function DELETE(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    scope: "altflinking:admin-listings",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, role, error } = await assertAdmin(request);
  if (error) return err(error, error === "Unauthorized" ? 401 : 403);
  if (role !== "SUPERADMIN") return err("Only Superadmins can delete listings", 403);

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const { id } = await request.json();
    if (!id) return err("Listing id is required", 400);
    await db.collection("listings").doc(id).delete();
    return ok({ deleted: id });
  } catch (e) {
    console.error("[DELETE /admin/listings]", e);
    return err("Failed to delete listing", 500);
  }
}
