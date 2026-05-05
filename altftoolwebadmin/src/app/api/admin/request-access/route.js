import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";

/**
 * POST /api/admin/request-access
 *
 * Body: { type: "new" | "module", projectId?, moduleKey? }
 *
 * Rules:
 *  - type "new"    → only if the user has no admin doc at all
 *  - type "module" → only if no pending request for same user+project+module exists
 */
export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 10,
      scope: "admin:request-access",
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

    const body = await req.json();
    const { type, projectId, moduleKey } = body;

    if (!["new", "module"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (type === "module" && (!projectId || !moduleKey)) {
      return NextResponse.json({ error: "projectId and moduleKey required for module requests" }, { status: 400 });
    }

    /* ── Deduplication ── */
    let dupQuery = adminDb
      .collection("accessRequests")
      .where("uid", "==", uid)
      .where("type", "==", type)
      .where("status", "==", "pending");

    if (type === "module") {
      dupQuery = dupQuery
        .where("projectId", "==", projectId)
        .where("moduleKey", "==", moduleKey);
    }

    const dupSnap = await dupQuery.limit(1).get();
    if (!dupSnap.empty) {
      return NextResponse.json(
        { error: "A pending request already exists for this module." },
        { status: 409 }
      );
    }

    /* ── Create request ── */
    const docData = {
      uid,
      email: email ?? null,
      type,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (type === "module") {
      docData.projectId = projectId;
      docData.moduleKey = moduleKey;
    }

    const ref = await adminDb.collection("accessRequests").add(docData);

    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("REQUEST_ACCESS_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
