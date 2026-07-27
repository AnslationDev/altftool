/**
 * API: Orders — Buyer creates + role-filtered list
 * GET  /api/altflinking/orders  — filtered by role
 * POST /api/altflinking/orders  — buyer places an order (PENDING_ADMIN_APPROVAL)
 */

import { NextResponse } from "next/server";
import { initAdmin }    from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue }   from "firebase-admin/firestore";

export async function GET(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    let query = db.collection("orders");

    // RBAC: buyers see their own, publishers see orders on their listings, admins see all
    if (role === "BUYER") {
      query = query.where("buyerId", "==", user.uid);
    } else if (role === "PUBLISHER") {
      query = query.where("publisherId", "==", user.uid);
    }
    // ADMIN / SUPERADMIN — no filter, see all

    const snap = await query.orderBy("createdAt", "desc").limit(200).get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return ok(orders);
  } catch (e) {
    console.error("[GET /orders]", e);
    return err("Failed to fetch orders: " + e.message, 500);
  }
}

export async function POST(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  if (!["BUYER", "ADMIN", "SUPERADMIN"].includes(role)) {
    return err("Only Buyers can place orders", 403);
  }

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const body = await request.json();

    // Validate required fields
    const required = ["listingId", "type", "targetUrl", "anchorText"];
    for (const f of required) {
      if (!body[f]) return err(`Missing required field: ${f}`, 400);
    }
    if (!["GUEST_POST", "LINK_INSERTION"].includes(body.type)) {
      return err("Invalid order type. Must be GUEST_POST or LINK_INSERTION", 400);
    }
    if (!/^https?:\/\/.+/.test(body.targetUrl)) {
      return err("targetUrl must be a valid URL starting with http:// or https://", 400);
    }

    // Fetch the listing to validate it exists and is APPROVED
    const listingSnap = await db.collection("listings").doc(body.listingId).get();
    if (!listingSnap.exists) return err("Listing not found", 404);
    const listing = listingSnap.data();
    if (listing.status !== "APPROVED") {
      return err("This listing is not available for orders", 400);
    }

    // Fetch buyer profile
    const buyerSnap = await db.collection("users").doc(user.uid).get();
    const buyerData = buyerSnap.exists ? buyerSnap.data() : {};

    // Resolve campaign (optional)
    let campaignName = body.campaignName || "Default Campaign";
    if (body.campaignId) {
      const campSnap = await db.collection("campaigns").doc(body.campaignId).get();
      if (campSnap.exists) campaignName = campSnap.data().name;
    }

    const price = body.type === "GUEST_POST"
      ? listing.prices?.guestPost || 0
      : listing.prices?.linkInsertion || 0;

    const now = FieldValue.serverTimestamp();
    const orderData = {
      // Buyer info (denormalized)
      buyerId:       user.uid,
      buyerEmail:    user.email,
      buyerName:     buyerData.displayName || user.email,
      // Publisher info (denormalized from listing)
      publisherId:   listing.publisherId,
      publisherEmail: listing.publisherEmail,
      publisherName: listing.publisherName,
      // Listing info
      listingId:     body.listingId,
      websiteDomain: listing.domain,
      websiteName:   listing.name,
      // Order details
      type:          body.type,
      targetUrl:     body.targetUrl.trim(),
      anchorText:    body.anchorText.trim(),
      articleContent: body.articleContent || "",
      articleDocUrl:  body.articleDocUrl  || "",
      campaignId:    body.campaignId  || null,
      campaignName,
      price,
      // Workflow state — all orders start at PENDING_ADMIN_APPROVAL
      status:          "PENDING_ADMIN_APPROVAL",
      statusHistory: [{
        status:    "PENDING_ADMIN_APPROVAL",
        timestamp: new Date().toISOString(),
        by:        user.uid,
        note:      "Order placed by buyer",
      }],
      // Fulfillment fields (populated later)
      liveLinkUrl:    null,
      isDofollow:     null,
      isIndexed:      null,
      crawledAt:      null,
      // Admin fields
      adminNotes:      "",
      adminApprovedBy: null,
      adminApprovedAt: null,
      createdAt:       now,
      updatedAt:       now,
    };

    const docRef = await db.collection("orders").add(orderData);

    // If order belongs to a campaign, add orderId to campaign.orderIds
    if (body.campaignId) {
      await db.collection("campaigns").doc(body.campaignId).update({
        orderIds: FieldValue.arrayUnion(docRef.id),
        updatedAt: now,
      });
    }

    return ok({ id: docRef.id, ...orderData, status: "PENDING_ADMIN_APPROVAL" }, 201);
  } catch (e) {
    console.error("[POST /orders]", e);
    return err("Failed to place order: " + e.message, 500);
  }
}
