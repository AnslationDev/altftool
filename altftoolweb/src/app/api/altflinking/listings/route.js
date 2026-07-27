/**
 * API: Public Listings (GET) + Publisher Submit (POST)
 * GET  /api/altflinking/listings    — public, APPROVED only
 * POST /api/altflinking/listings    — publisher, creates PENDING_REVIEW
 */

import { NextResponse } from "next/server";
import { initAdmin }    from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue }   from "firebase-admin/firestore";

// GET — public endpoint, returns only APPROVED listings
export async function GET(request) {
  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const { searchParams } = new URL(request.url);
    const niche      = searchParams.get("niche");
    const minDr      = parseInt(searchParams.get("minDr")  || "0");
    const minTraffic = parseInt(searchParams.get("minTraffic") || "0");
    const sortBy     = searchParams.get("sortBy") || "dr_desc";
    const search     = searchParams.get("search") || "";
    const publisherId = searchParams.get("publisherId"); // for publisher's own listings
    const includeAll  = searchParams.get("includeAll"); // admin: show all statuses

    // Check if requester is admin (optional auth)
    let requesterRole = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { user } = await verifyToken(request);
      if (user) requesterRole = await getUserRole(user.uid);
    }

    let query = db.collection("listings");

    // Non-admin public: only APPROVED
    if (!includeAll || requesterRole !== "ADMIN" && requesterRole !== "SUPERADMIN") {
      if (publisherId) {
        // Publisher sees their own listings (all statuses)
        query = query.where("publisherId", "==", publisherId);
      } else {
        query = query.where("status", "==", "APPROVED");
      }
    }

    if (niche && niche !== "All") query = query.where("niche", "==", niche);

    const snap = await query.limit(200).get();
    let listings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Client-side filters (Firestore doesn't support all combos in one query)
    if (minDr > 0)      listings = listings.filter((l) => (l.dr || 0) >= minDr);
    if (minTraffic > 0) listings = listings.filter((l) => (l.traffic || 0) >= minTraffic);
    if (search) {
      const q = search.toLowerCase();
      listings = listings.filter(
        (l) => (l.domain || "").toLowerCase().includes(q) ||
               (l.name   || "").toLowerCase().includes(q) ||
               (l.niche  || "").toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "dr_desc")      listings.sort((a, b) => (b.dr || 0) - (a.dr || 0));
    else if (sortBy === "traffic_desc") listings.sort((a, b) => (b.traffic || 0) - (a.traffic || 0));
    else if (sortBy === "price_asc")    listings.sort((a, b) => (a.prices?.guestPost || 0) - (b.prices?.guestPost || 0));
    else if (sortBy === "tat_asc")      listings.sort((a, b) => (a.tatDays || 99) - (b.tatDays || 99));
    else if (sortBy === "newest")       listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return ok(listings);
  } catch (e) {
    console.error("[GET /listings]", e);
    return err("Failed to fetch listings: " + e.message, 500);
  }
}

// POST — publisher submits a new website listing (enters PENDING_REVIEW)
export async function POST(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  if (role !== "PUBLISHER" && role !== "ADMIN" && role !== "SUPERADMIN") {
    return err("Only Publishers can submit website listings", 403);
  }

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const body = await request.json();

    // Server-side validation
    const required = ["domain", "niche", "prices"];
    for (const f of required) {
      if (!body[f]) return err(`Missing required field: ${f}`, 400);
    }
    if (!body.prices?.guestPost && !body.prices?.linkInsertion) {
      return err("At least one price (guestPost or linkInsertion) is required", 400);
    }
    if (body.domain && !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(body.domain)) {
      return err("Invalid domain format", 400);
    }

    // Check for duplicate domain
    const existing = await db.collection("listings")
      .where("domain", "==", body.domain.toLowerCase())
      .limit(1)
      .get();
    if (!existing.empty) {
      return err("A listing for this domain already exists", 409);
    }

    // Fetch publisher profile for denormalization
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const now = FieldValue.serverTimestamp();
    const listingData = {
      publisherId:    user.uid,
      publisherEmail: user.email,
      publisherName:  userData.displayName || user.email,
      domain:         body.domain.toLowerCase().trim(),
      name:           body.name || body.domain,
      niche:          body.niche,
      language:       body.language || "English",
      country:        body.country || "",
      dr:             Number(body.dr) || 0,
      da:             Number(body.da) || 0,
      traffic:        Number(body.traffic) || 0,
      spamScore:      Number(body.spamScore) || 0,
      indexRate:      Number(body.indexRate) || 0,
      tatDays:        Number(body.tatDays) || 7,
      prices: {
        guestPost:     Number(body.prices?.guestPost)     || 0,
        linkInsertion: Number(body.prices?.linkInsertion) || 0,
      },
      guidelines:     body.guidelines  || "",
      sampleUrls:     Array.isArray(body.sampleUrls) ? body.sampleUrls.filter(Boolean) : [],
      trafficHistory: body.trafficHistory || [],
      // Default state — NEVER published without admin approval
      status:         "PENDING_REVIEW",
      featured:       false,
      rating:         0,
      reviewCount:    0,
      verified:       false,
      adminNotes:     "",
      approvedBy:     null,
      approvedAt:     null,
      createdAt:      now,
      updatedAt:      now,
    };

    const docRef = await db.collection("listings").add(listingData);
    return ok({ id: docRef.id, ...listingData, status: "PENDING_REVIEW" }, 201);
  } catch (e) {
    console.error("[POST /listings]", e);
    return err("Failed to submit listing: " + e.message, 500);
  }
}
