/**
 * API: Publisher-owned Listing Update
 * PATCH /api/altflinking/listings/[id] — publisher edits their own listing's
 * pricing/guidelines. Status, verification, and metrics stay admin/DNS-owned
 * and are not editable here.
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { initAdmin } from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue } from "firebase-admin/firestore";
import { validateListingPrices } from "@/app/altflinking/lib/pricing";

export async function PATCH(request, { params }) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 30,
    scope: "altflinking:listings-id",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { id } = await params;
  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const docRef = db.collection("listings").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return err("Listing not found", 404);

    const listing = snap.data();
    const role = await getUserRole(user.uid);
    const isOwner = listing.publisherId === user.uid;
    const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
    if (!isOwner && !isAdmin) return err("Forbidden", 403);

    const body = await request.json();
    const updates = { updatedAt: FieldValue.serverTimestamp() };

    if (body.guestPostPrice !== undefined || body.linkInsertionPrice !== undefined) {
      const validatedPrices = validateListingPrices({
        guestPost: body.guestPostPrice !== undefined
          ? body.guestPostPrice
          : listing.prices?.guestPost,
        linkInsertion: body.linkInsertionPrice !== undefined
          ? body.linkInsertionPrice
          : listing.prices?.linkInsertion,
      });
      if (validatedPrices.error) return err(validatedPrices.error, 400);
      updates.prices = validatedPrices.value;
    }
    if (body.tatDays !== undefined) updates.tatDays = Number(body.tatDays) || listing.tatDays || 7;
    if (body.guidelines !== undefined) updates.guidelines = String(body.guidelines).slice(0, 2000);

    if (Object.keys(updates).length === 1) return err("No editable fields provided", 400);

    await docRef.update(updates);
    const updatedAtIso = new Date().toISOString();
    return ok({ id, ...listing, ...updates, updatedAt: updatedAtIso });
  } catch (e) {
    console.error("[PATCH /listings/:id]", e);
    return err("Failed to update listing", 500);
  }
}
