import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import {
  authenticate,
  canDelete,
  isReadOnly,
  isValidDocId,
  ownersFor,
  PROJECT_ID,
} from "@/lib/anternetAccess";

/**
 * DELETE a single Anternet content document.
 *
 * This route now enforces exactly the same rules as /api/anternet/save. It
 * previously accepted a request with NO Authorization header at all whenever
 * NODE_ENV !== "production", and took the collection name straight from the
 * request body with no whitelist — so any caller reaching a dev server could
 * destroy arbitrary documents under projects/anternet, and any authenticated
 * admin of any project could do the same in production.
 */
export async function POST(request) {
  const actor = await authenticate(request);
  if (!actor.ok) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { collection: colName, id } = body || {};
  if (typeof colName !== "string" || !isValidDocId(id)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const moduleKeys = ownersFor(colName, id);
  if (!moduleKeys) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 400 });
  }

  if (!canDelete(actor, moduleKeys)) {
    return NextResponse.json(
      {
        error: isReadOnly(actor, moduleKeys)
          ? "Your access to this module is read-only."
          : "Not authorized",
      },
      { status: 403 },
    );
  }

  try {
    await adminDb
      .collection("projects")
      .doc(PROJECT_ID)
      .collection(colName)
      .doc(id)
      .delete();

    try {
      await writeAdminAuditLog({
        action: "anternet.content.delete",
        module: moduleKeys[0],
        projectId: PROJECT_ID,
        actorUid: actor.uid,
        actorEmail: actor.email,
        status: "success",
        summary: `Deleted ${colName}/${id}`,
        metadata: {
          collection: colName,
          docId: id,
          route: "/api/anternet/delete",
        },
      });
    } catch (auditErr) {
      // Auditing must never fail the delete it is recording.
      console.error("ANTERNET_DELETE_AUDIT_ERROR:", auditErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never echo the raw Firestore message (it can carry index URLs and
    // internal collection paths).
    console.error("ANTERNET_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
