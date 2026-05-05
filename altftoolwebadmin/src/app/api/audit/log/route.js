import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";

async function verifyActiveAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const token = authHeader.split("Bearer ")[1];
  const decoded = await adminAuth.verifyIdToken(token);

  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!snap.exists) throw new Error("Forbidden");
  const data = snap.data();
  if (!data?.isActive) throw new Error("Inactive admin");

  return {
    uid: decoded.uid,
    email: data.email ?? decoded.email ?? null,
    roleType: data.roleType ?? "admin",
  };
}

export async function POST(request) {
  try {
    const actor = await verifyActiveAdmin(request);
    const body = await request.json();

    const module = body?.module;
    const action = body?.action;
    if (!module || !action) {
      return NextResponse.json({ error: "module and action are required" }, { status: 400 });
    }

    await writeAdminAuditLog({
      action,
      module,
      actorUid: actor.uid,
      actorEmail: actor.email,
      targetUid: body?.targetUid ?? null,
      targetEmail: body?.targetEmail ?? null,
      summary: body?.summary ?? null,
      changes: body?.changes ?? null,
      metadata: {
        entityType: body?.entityType ?? null,
        entityId: body?.entityId ?? null,
        route: body?.route ?? null,
        ...(body?.metadata && typeof body.metadata === "object" ? body.metadata : null),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

