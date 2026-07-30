/**
 * API: Public Listings (GET) + Publisher Submit (POST)
 * GET  /api/altflinking/listings    — public, APPROVED only
 * POST /api/altflinking/listings    — publisher, creates PENDING_REVIEW
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import dns from "node:dns/promises";
import { initAdmin }    from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue }   from "firebase-admin/firestore";

// Re-checks the TXT record server-side rather than trusting a client-supplied
// "verified" flag — the publisher dashboard's own DNS check is only a
// convenience preview, not a security boundary.
async function checkDnsVerification(domain, token) {
  if (!token) return false;
  try {
    const records = await dns.resolveTxt(domain);
    return records.map((chunks) => chunks.join("")).some((rec) => rec.includes(token));
  } catch {
    return false;
  }
}

// GET — public endpoint, returns only APPROVED listings
export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "altflinking:listings",
    windowMs: 60000,
  });
  if (limited) return limited;

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
    let requesterUid = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { user } = await verifyToken(request);
      if (user) {
        requesterUid = user.uid;
        requesterRole = await getUserRole(user.uid);
      }
    }

    const isAdmin = requesterRole === "ADMIN" || requesterRole === "SUPERADMIN";

    let query = db.collection("listings");

    // Non-admin public: only APPROVED
    if (!includeAll || !isAdmin) {
      if (publisherId && (isAdmin || requesterUid === publisherId)) {
        // Publisher sees their own listings (all statuses)
        query = query.where("publisherId", "==", publisherId);
      } else if (publisherId) {
        // Unauthenticated/non-owner caller asking for one publisher's
        // listings — still scope to that publisher, just public-visible ones.
        query = query.where("publisherId", "==", publisherId).where("status", "==", "APPROVED");
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
    return err("Failed to fetch listings", 500);
  }
}

// POST — publisher submits a new website listing (enters PENDING_REVIEW)
export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 20,
    scope: "altflinking:listings",
    windowMs: 60000,
  });
  if (limited) return limited;

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

    const dnsVerified = await checkDnsVerification(body.domain.toLowerCase().trim(), body.verificationToken);

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
      verified:       dnsVerified,
      adminNotes:     dnsVerified ? "" : "DNS TXT record not detected at submission time — admin should verify domain ownership manually before approving.",
      approvedBy:     null,
      approvedAt:     null,
      createdAt:      now,
      updatedAt:      now,
    };

    const docRef = await db.collection("listings").add(listingData);
    return ok({ id: docRef.id, ...listingData, status: "PENDING_REVIEW" }, 201);
  } catch (e) {
    console.error("[POST /listings]", e);
    return err("Failed to submit listing", 500);
  }
}
