// api/support/reply/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { enforceRateLimit } from "@altftool/core/http";

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 30,
      scope: "support:reply",
      windowMs: 60000,
    });
    if (limited) return limited;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const { ticketId, message } = await request.json();

    if (!ticketId || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticketRef = adminDb.collection("support_tickets").doc(ticketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketSnap.data();

    const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get();
    const isAdmin = adminSnap.exists;
    const isCreator = ticket.createdBy === decoded.uid;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Date.now();

    await ticketRef.collection("messages").add({
      senderId: decoded.uid,
      message: message.trim(),
      createdAt: now,
    });

    await ticketRef.update({ updatedAt: now });

    // Determine who to notify
    const isSuperAdmin = isAdmin && adminSnap.data()?.roleType === "superadmin";
    let notifyUserId = null;

    if (isSuperAdmin) {
      notifyUserId = ticket.createdBy;
    } else if (isCreator && ticket.assignedTo) {
      notifyUserId = ticket.assignedTo;
    }

    if (notifyUserId && notifyUserId !== decoded.uid) {
      const notifActionUrl = isSuperAdmin
        ? `/support/${ticketId}`
        : `/tickets/${ticketId}`;

      const notifPayload = {
        userId: notifyUserId,
        type: "notice",
        title: "New Reply on Ticket",
        body: `A reply was added to ticket: "${ticket.title}"`,
        actionUrl: notifActionUrl,
        read: false,
        createdAt: now,
      };

      // Write in-app notification
      await adminDb.collection("notifications").add(notifPayload);

      // Send push notification (best-effort, non-blocking)
      sendPushToUsers({
        userIds: [notifyUserId],
        title: notifPayload.title,
        body: notifPayload.body,
        data: { actionUrl: notifActionUrl, ticketId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REPLY_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
