import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { enforceRateLimit } from "@altftool/core/http";

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 60,
      scope: "audit:log",
      windowMs: 60000,
    });
    if (limited) return limited;

    // Was a private, legacy-`admins`-only check with no RBAC-store fallback —
    // every RBAC-era admin (created through the current Admins UI) got
    // "Forbidden" here regardless of a valid session. verifyActiveAdmin
    // covers RBAC + legacy + the local-dev bypass, matching every other
    // admin route.
    const { admin } = await verifyActiveAdmin(request);
    const actor = { uid: admin.uid, email: admin.email, roleType: admin.roleType };
    const body = await request.json();

    // `module` shadows the reserved CommonJS `module` binding.
    const moduleName = body?.module;
    const action = body?.action;
    if (!moduleName || !action) {
      return NextResponse.json({ error: "module and action are required" }, { status: 400 });
    }

    // This endpoint is a general-purpose activity sink for 100+ call sites
    // (src/lib/auditClient.js), so any active admin — any role — may log an
    // entry about their OWN activity. But actorUid/actorEmail/actorRole above
    // are already server-derived and cannot be spoofed by the client; the gap
    // was targetUid/targetEmail, taken verbatim from the request body with no
    // check at all. Without this, a low-privilege admin could submit a
    // fabricated entry naming a *different* admin as the target (e.g. a fake
    // "ADMIN_STATUS_TOGGLE" against a colleague), and it would render on the
    // Full Audit Log page indistinguishable from a genuine, server-verified
    // entry. None of the real call sites pass targetUid/targetEmail today —
    // only the admin-management CRUD routes do, and those write their audit
    // entries server-side (bypassing this endpoint entirely) — so requiring
    // an elevated role to name someone else as the target does not break any
    // existing legitimate caller.
    const targetUid = body?.targetUid ?? null;
    const targetEmail = body?.targetEmail ?? null;
    const sameEmail = (a, b) => Boolean(a) && Boolean(b) && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    const targetsSelf =
      (!targetUid || targetUid === actor.uid) &&
      (!targetEmail || sameEmail(targetEmail, actor.email));
    if (!targetsSelf && actor.roleType !== "superadmin") {
      return NextResponse.json(
        { error: "Only a super admin can log an audit entry that names a different admin as the target" },
        { status: 403 },
      );
    }

    await writeAdminAuditLog({
      action,
      module: moduleName,
      actorUid: actor.uid,
      actorEmail: actor.email,
      actorRole: actor.roleType ?? null,
      targetUid,
      targetEmail,
      summary: body?.summary ?? null,
      changes: body?.changes ?? null,
      // Optional explicit Workspace hierarchy hints (highest resolver priority);
      // `route` is the pathname the client attaches for accurate classification.
      projectId: body?.projectId ?? body?.project ?? null,
      application: body?.application ?? null,
      section: body?.section ?? null,
      feature: body?.feature ?? null,
      entityName: body?.entityName ?? null,
      route: body?.route ?? null,
      metadata: {
        entityType: body?.entityType ?? null,
        entityId: body?.entityId ?? null,
        route: body?.route ?? null,
        ...(body?.metadata && typeof body.metadata === "object" ? body.metadata : null),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    // Every error here used to answer a flat 401, which mapped a genuine
    // Firestore/Auth infra fault to "you're not signed in" — same
    // classification as withAdminApi.js's classifyAuthError.
    if (err?.message === "Forbidden" || err?.message === "Inactive admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const code = err?.code || err?.errorInfo?.code || "";
    if (err?.message === "Unauthorized" || (typeof code === "string" && code.startsWith("auth/"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("AUDIT_LOG_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

