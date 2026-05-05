// api/support/update-status/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { enforceRateLimit } from "@altftool/core/http";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

export async function PATCH(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 30,
      scope: "support:update-status",
      windowMs: 60000,
    });
    if (limited) return limited;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get();
    if (!adminSnap.exists) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ticketId, status, assignedTo } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ticketRef = adminDb.collection("support_tickets").doc(ticketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketSnap.data();
    const now = Date.now();
    const previousAssignedTo = ticket.assignedTo ?? null;

    const updates = { updatedAt: now };

    if (status) {
      updates.status = status;
      if (status === "closed") {
        updates.closedAt = now;
        updates.autoDeleteAt = now + 24 * 60 * 60 * 1000;
      }
    }

    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo || null;
    }

    await ticketRef.update(updates);

    // ── Notifications ────────────────────────────────────────────────────────

    // 1. Resolved → notify ticket creator
    if (status === "resolved") {
      const notifPayload = {
        userId: ticket.createdBy,
        type: "notice",
        title: "Ticket Resolved",
        body: `Your ticket "${ticket.title}" has been marked as resolved.`,
        actionUrl: `/support/${ticketId}`,
        read: false,
        createdAt: now,
      };
      await adminDb.collection("notifications").add(notifPayload);

      sendPushToUsers({
        userIds: [ticket.createdBy],
        title: notifPayload.title,
        body: notifPayload.body,
        data: { actionUrl: notifPayload.actionUrl, ticketId },
      });
    }

    // 2. New assignment → notify the newly assigned admin
    const isNewAssignment =
      assignedTo &&
      assignedTo !== previousAssignedTo &&
      assignedTo !== decoded.uid;

    if (isNewAssignment) {
      const notifPayload = {
        userId: assignedTo,
        type: "notice",
        title: "New Ticket Assigned",
        body: `You have been assigned a ticket: "${ticket.title}"`,
        actionUrl: `/tickets/${ticketId}`,
        read: false,
        createdAt: now,
      };
      await adminDb.collection("notifications").add(notifPayload);

      sendPushToUsers({
        userIds: [assignedTo],
        title: notifPayload.title,
        body: notifPayload.body,
        data: { actionUrl: notifPayload.actionUrl, ticketId },
      });
    }

    // 3. Reassignment → notify the previously assigned admin (if different)
    const isReassignment =
      previousAssignedTo &&
      assignedTo &&
      previousAssignedTo !== assignedTo &&
      previousAssignedTo !== decoded.uid;

    if (isReassignment) {
      const notifPayload = {
        userId: previousAssignedTo,
        type: "notice",
        title: "Ticket Reassigned",
        body: `Ticket "${ticket.title}" has been reassigned to someone else.`,
        actionUrl: `/tickets/${ticketId}`,
        read: false,
        createdAt: now,
      };
      await adminDb.collection("notifications").add(notifPayload);

      sendPushToUsers({
        userIds: [previousAssignedTo],
        title: notifPayload.title,
        body: notifPayload.body,
        data: { actionUrl: notifPayload.actionUrl, ticketId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("UPDATE_STATUS_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
