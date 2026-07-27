import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import {
  authenticate,
  canWrite,
  isPlainObject,
  isReadOnly,
  isValidDocId,
  ownersFor,
  PROJECT_ID,
} from "@/lib/anternetAccess";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";

/**
 * Drag-and-drop reorder writes one document per row (`reorderDocs` in
 * src/projects/anternet/lib/firebase.js), so reordering N cards would otherwise
 * emit N `anternet.content.update` audit entries — each of which also fans out
 * an activity event plus a rollup increment per ancestor path — and bury the
 * real editorial changes in the audit feed. An order-only write carries no
 * content change, so it is not audited; every other save still is.
 */
function isOrderOnlyWrite(data, isNew) {
  if (isNew) return false;
  const keys = Object.keys(data);
  return keys.length === 1 && keys[0] === "order";
}

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

  const { collection: colName, id, data, isNew } = body || {};
  if (typeof colName !== "string" || !isValidDocId(id) || !isPlainObject(data)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const owners = ownersFor(colName, id);
  if (!owners) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 400 });
  }

  if (!canWrite(actor, owners)) {
    const readOnly = isReadOnly(actor, owners);
    return NextResponse.json(
      {
        error: readOnly
          ? "Your access to this module is read-only."
          : "Not authorized",
        code: readOnly ? "read_only" : "forbidden",
      },
      { status: 403 },
    );
  }

  try {
    const ref = adminDb.collection("projects").doc(PROJECT_ID).collection(colName).doc(id);
    const payload = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.email,
      ...(isNew ? { createdAt: FieldValue.serverTimestamp() } : {}),
    };
    await ref.set(payload, { merge: true });

    if (isOrderOnlyWrite(data, isNew)) {
      return NextResponse.json({ ok: true, id });
    }

    try {
      await writeAdminAuditLog({
        action: isNew ? "anternet.content.create" : "anternet.content.update",
        module: owners[0],
        projectId: PROJECT_ID,
        actorUid: actor.uid,
        actorEmail: actor.email,
        status: "success",
        summary: `${isNew ? "Created" : "Updated"} ${colName}/${id}`,
        metadata: {
          collection: colName,
          docId: id,
          isNew: Boolean(isNew),
          route: "/api/anternet/save",
        },
      });
    } catch (auditErr) {
      console.error("ANTERNET_SAVE_AUDIT_ERROR:", auditErr);
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("ANTERNET_SAVE_ERROR:", err);
    // Never echo the raw Firebase/internal message to the client.
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
