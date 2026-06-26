import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { withAdminApi } from "@/lib/security/withAdminApi";
import { adminDb } from "@/lib/firebaseAdmin";
import { SECURITY_COLLECTIONS } from "@/lib/security/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cursor-paginated audit logs (ordered by createdAt desc). `cursor` is the
// previous page's last createdAt in ms; pass it back to fetch the next page.
export const GET = withAdminApi(
  async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));
    const cursorMs = Number(searchParams.get("cursor")) || null;

    let query = adminDb
      .collection(SECURITY_COLLECTIONS.audit)
      .orderBy("createdAt", "desc");
    if (cursorMs) query = query.startAfter(Timestamp.fromMillis(cursorMs));

    const snap = await query.limit(limit + 1).get();
    const docs = snap.docs.slice(0, limit);
    const hasMore = snap.docs.length > limit;

    const logs = docs.map((d) => {
      const v = d.data();
      const createdAtMs = v.createdAtMs ?? (v.createdAt?.toMillis ? v.createdAt.toMillis() : null);
      return {
        id: d.id,
        action: v.action,
        module: v.module,
        status: v.status,
        summary: v.summary,
        actorEmail: v.actorEmail,
        actorUid: v.actorUid,
        targetEmail: v.targetEmail,
        ipMasked: v.ipMasked ?? null,
        country: v.country ?? null,
        region: v.region ?? null,
        browser: v.browser ?? null,
        os: v.os ?? null,
        deviceLabel: v.deviceLabel ?? null,
        changes: v.changes ?? null,
        metadata: v.metadata ?? null,
        createdAtMs,
      };
    });

    const nextCursor = hasMore ? logs[logs.length - 1]?.createdAtMs ?? null : null;
    return NextResponse.json({ logs, nextCursor });
  },
  { requireSuperAdmin: true },
);
