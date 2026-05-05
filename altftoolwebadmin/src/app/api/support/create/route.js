// api/support/create/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { enforceRateLimit } from "@altftool/core/http";

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "support:create",
      windowMs: 60000,
    });
    if (limited) return limited;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const { title, description, type, priority } = await request.json();

    if (!title || !description || !type || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = Date.now();
    const ticketRef = adminDb.collection("support_tickets").doc();

    await ticketRef.set({
      title,
      description,
      type,
      priority,
      status: "open",
      createdBy: decoded.uid,
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      autoDeleteAt: null,
      isDeleted: false,
    });

    // Add initial message
    await ticketRef.collection("messages").add({
      senderId: decoded.uid,
      message: description,
      createdAt: now,
    });

    // Fetch superadmins
    const superAdminsSnap = await adminDb
      .collection("admins")
      .where("roleType", "==", "superadmin")
      .where("isActive", "==", true)
      .get();

    const superAdminIds = superAdminsSnap.docs.map((d) => d.id);

    // Write in-app notifications
    const notifBatch = adminDb.batch();
    superAdminIds.forEach((uid) => {
      const notifRef = adminDb.collection("notifications").doc();
      notifBatch.set(notifRef, {
        userId: uid,
        type: "notice",
        title: "New Support Ticket",
        body: `A new ticket was raised: "${title}"`,
        actionUrl: `/tickets/${ticketRef.id}`,
        read: false,
        createdAt: now,
      });
    });
    await notifBatch.commit();

    // Send push notifications (best-effort, non-blocking)
    sendPushToUsers({
      userIds: superAdminIds,
      title: "New Support Ticket",
      body: `A new ticket was raised: "${title}"`,
      data: { actionUrl: `/tickets/${ticketRef.id}`, ticketId: ticketRef.id },
    });

    return NextResponse.json({ ticketId: ticketRef.id }, { status: 201 });
  } catch (err) {
    console.error("SUPPORT_CREATE_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
