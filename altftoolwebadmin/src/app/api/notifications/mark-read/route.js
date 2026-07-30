import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { enforceRateLimit } from "@altftool/core/http";

/**
 * PATCH /api/notifications/mark-read
 * Body: { notificationId: string }
 *
 * Marks a notification as read. Only the owning user may do this.
 */
export async function PATCH(request) {
  try {
    // Every sibling mutating route in this cluster (broadcast POST/DELETE/PATCH,
    // save-token POST/DELETE) rate-limits itself; this one didn't, so any
    // authenticated admin could hammer it in a loop for unbounded Firestore cost.
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 60,
      scope: "admin:notifications-mark-read",
      windowMs: 60000,
    });
    if (limited) return limited;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json({ error: "notificationId required" }, { status: 400 });
    }

    const ref = adminDb.collection("notifications").doc(notificationId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Security: only the notification owner can mark it read
    if (snap.data().userId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ref.update({ read: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[mark-read]", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}