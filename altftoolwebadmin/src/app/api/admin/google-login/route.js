import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";

/**
 * POST /api/admin/google-login
 *
 * Called after a successful Google sign-in on the client.
 *
 * Outcomes:
 *  1. Email matches an existing ACTIVE admin doc  → { status: "admin" }
 *  2. Email matches an INACTIVE admin doc         → 403
 *  3. No admin doc found:
 *       a. Has a pending request                  → { status: "pending" }
 *       b. Had a rejected request (or none)       → create NEW pending request → { status: "pending" }
 */
export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:google-login",
      windowMs: 60000,
    });
    if (limited) return limited;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const { uid, email } = decoded;

    if (!email) {
      return NextResponse.json({ error: "No email on Google account" }, { status: 400 });
    }

    const ALLOWED_DOMAIN = "anslation.com";

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
  return NextResponse.json(
    { error: "Only Anslation accounts are allowed" },
    { status: 403 }
  );
}

    /* ── 1. Check admin doc by UID ── */
    const byUid = await adminDb.collection("admins").doc(uid).get();
    if (byUid.exists) {
      if (!byUid.data()?.isActive) {
        return NextResponse.json(
          { error: "Your account has been deactivated. Contact a super admin." },
          { status: 403 }
        );
      }
      return NextResponse.json({ status: "admin" });
    }

    /* ── 2. Check admin doc by email (covers password→Google UID mismatch) ── */
    const byEmail = await adminDb
      .collection("admins")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!byEmail.empty) {
      const data = byEmail.docs[0].data();
      if (!data.isActive) {
        return NextResponse.json(
          { error: "Your account has been deactivated. Contact a super admin." },
          { status: 403 }
        );
      }
      return NextResponse.json({ status: "admin" });
    }

    /* ── 3. Not an admin — check for any existing request for this user ── */
    const existingRequests = await adminDb
      .collection("accessRequests")
      .where("uid", "==", uid)
      .where("type", "==", "new")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (!existingRequests.empty) {
      const latestRequest = existingRequests.docs[0].data();

      if (latestRequest.status === "pending") {
        // Already waiting — just tell the client
        return NextResponse.json({ status: "pending" });
      }

      if (latestRequest.status === "approved") {
        // Request was approved but admin doc doesn't exist yet (race condition / manual deletion)
        // Create a new pending request so the super admin can re-approve
        await adminDb.collection("accessRequests").add({
          uid,
          email,
          type: "new",
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ status: "pending" });
      }

      // status === "rejected" → fall through to create a new request below
    }

    /* ── 4. No pending request (or was rejected) → create a fresh one ── */
    await adminDb.collection("accessRequests").add({
      uid,
      email,
      type: "new",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ status: "pending" });
  } catch (err) {
    console.error("GOOGLE_LOGIN_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
