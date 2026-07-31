/**
 * API: Public Listings (GET) + Publisher Submit (POST)
 * GET  /api/altflinking/listings    — public, APPROVED only
 * POST /api/altflinking/listings    — publisher, creates PENDING_REVIEW
 */

import { NextResponse } from "next/server";
import { enforceRateLimit, requireHttpUrl } from "@altftool/core/http";
import dns from "node:dns/promises";
import { initAdmin }    from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue }   from "firebase-admin/firestore";

// A listing price must be a finite, non-negative number when provided —
// downstream (orders route) trusts a listing's stored price verbatim as the
// buyer's charge amount, with no re-validation at order time.
function isValidPrice(value) {
  if (value === undefined || value === null || value === "") return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

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
    if (!isValidPrice(body.prices?.guestPost) || !isValidPrice(body.prices?.linkInsertion)) {
      return err("Prices must be non-negative numbers", 400);
    }
    // Anchored at both ends so the whole string must be a bare domain — the
    // previous unanchored regex only validated a PREFIX, letting trailing
    // content (paths, scripts, stray whitespace) ride along as a "valid"
    // domain, and only ever matched a single label + TLD, so any real
    // multi-level domain (e.g. "sub.example.co.uk") only ever "passed" by
    // accident (matching just its own prefix). This is the same RFC
    // 1035-based pattern documented as the reference domain validator in
    // src/tools/regex-library-urls/lib.js — per-label 1–63 chars, no
    // leading/trailing hyphen, overall length capped at 253.
    if (body.domain && !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(body.domain)) {
      return err("Invalid domain format", 400);
    }

    // Validate every sample URL is an actual http(s) link before it can be
    // stored and later rendered as a raw href on the marketplace preview.
    let sampleUrls = [];
    if (Array.isArray(body.sampleUrls)) {
      for (const raw of body.sampleUrls.filter(Boolean)) {
        try {
          sampleUrls.push(requireHttpUrl(raw, "Each sample URL must be a valid http(s) URL"));
        } catch {
          return err("Each sample URL must be a valid http(s) URL", 400);
        }
      }
    }

    const normalizedDomain = body.domain.toLowerCase().trim();

    // Fetch publisher profile for denormalization
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const dnsVerified = await checkDnsVerification(normalizedDomain, body.verificationToken);

    const now = FieldValue.serverTimestamp();

    // The duplicate-domain check and the listing write MUST happen
    // atomically — a plain read-then-write lets two concurrent POSTs for
    // the same brand-new domain both observe "no existing listing" and
    // both create one. Wrapping both in a transaction (same pattern as the
    // balance check in withdrawals/route.js) makes Firestore retry this
    // block if a concurrent transaction commits a conflicting listing
    // first, so the re-read always sees the latest state.
    const listingsCollection = db.collection("listings");
    let duplicateDomain = false;
    let listingData = null;
    let newDocRef = null;

    await db.runTransaction(async (tx) => {
      const dupSnap = await tx.get(
        listingsCollection.where("domain", "==", normalizedDomain).limit(1)
      );
      if (!dupSnap.empty) {
        duplicateDomain = true;
        return;
      }

      listingData = {
        publisherId:    user.uid,
        publisherEmail: user.email,
        publisherName:  userData.displayName || user.email,
        domain:         normalizedDomain,
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
        sampleUrls,
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
      newDocRef = listingsCollection.doc();
      tx.set(newDocRef, listingData);
    });

    if (duplicateDomain) {
      return err("A listing for this domain already exists", 409);
    }

    return ok({ id: newDocRef.id, ...listingData, status: "PENDING_REVIEW" }, 201);
  } catch (e) {
    console.error("[POST /listings]", e);
    return err("Failed to submit listing", 500);
  }
}
