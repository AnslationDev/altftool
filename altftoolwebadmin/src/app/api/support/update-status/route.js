// api/support/update-status/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { enforceRateLimit } from "@altftool/core/http";

const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

// Distinguishes "the caller's credentials are missing/invalid" (401) from an
// infrastructure fault raised while checking them. verifyActiveAdmin also reads
// Firestore, so a transient UNAVAILABLE/DEADLINE_EXCEEDED must not be reported
// to the client as an authentication failure.
function isAuthenticationFailure(error) {
  // Thrown by getBearerToken() when the Authorization header is missing/malformed.
  if (error?.message === "Unauthorized") return true;
  // firebase-admin auth errors: auth/id-token-expired, auth/argument-error, ...
  const code = error?.code || error?.errorInfo?.code || "";
  return typeof code === "string" && code.startsWith("auth/");
}

export async function PATCH(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 30,
      scope: "support:update-status",
      windowMs: 60000,
    });
    if (limited) return limited;

    // Authorize against the RBAC store first, falling back to the legacy
    // `admins` collection (verifyActiveAdmin does both) so admins created
    // through the current flow are not locked out of the ticket workflow.
    let decoded;
    let admin;
    try {
      ({ decoded, admin } = await verifyActiveAdmin(request));
    } catch (authErr) {
      // "Forbidden"/"Inactive admin" = authenticated but not an eligible admin.
      if (authErr?.message === "Forbidden" || authErr?.message === "Inactive admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Missing/expired/invalid credentials = authentication issue.
      if (isAuthenticationFailure(authErr)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Anything else is a genuine backend fault: rethrow so the outer catch logs
      // it and answers 500 instead of telling the client to re-authenticate.
      throw authErr;
    }

    // Ticket administration is a superadmin-only module (see adminRoutes.js);
    // `exists` alone is not authorization.
    if (!hasModuleAccess({ adminData: admin, moduleKey: "tickets", action: "write" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { ticketId, status, assignedTo } = body ?? {};

    if (typeof ticketId !== "string" || !ticketId.trim() || ticketId.includes("/")) {
      return NextResponse.json({ error: "Missing or invalid ticketId" }, { status: 400 });
    }

    // Trim once and use the trimmed value everywhere: validating `.trim()` but
    // looking up the raw value resolved a padded id to a different document.
    const safeTicketId = ticketId.trim();

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (
      assignedTo !== undefined &&
      assignedTo !== null &&
      assignedTo !== "" &&
      typeof assignedTo !== "string"
    ) {
      return NextResponse.json({ error: "Invalid assignedTo" }, { status: 400 });
    }

    const ticketRef = adminDb.collection("support_tickets").doc(safeTicketId);
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
    // The status/assignment update above has already committed — a failure in
    // any one of these must not turn a successful update into a client-visible
    // 500, and must not stop the other two from being attempted.

    // 1. Resolved → notify ticket creator
    if (status === "resolved") {
      try {
        const notifPayload = {
          userId: ticket.createdBy,
          type: "notice",
          title: "Ticket Resolved",
          body: `Your ticket "${ticket.title}" has been marked as resolved.`,
          actionUrl: `/support/${safeTicketId}`,
          read: false,
          createdAt: now,
        };
        await adminDb.collection("notifications").add(notifPayload);

        sendPushToUsers({
          userIds: [ticket.createdBy],
          title: notifPayload.title,
          body: notifPayload.body,
          data: { actionUrl: notifPayload.actionUrl, ticketId: safeTicketId },
        });
      } catch (notifyErr) {
        console.error("UPDATE_STATUS_NOTIFY_RESOLVED_ERROR:", notifyErr);
      }
    }

    // 2. New assignment → notify the newly assigned admin
    const isNewAssignment =
      assignedTo &&
      assignedTo !== previousAssignedTo &&
      assignedTo !== decoded.uid;

    if (isNewAssignment) {
      try {
        const notifPayload = {
          userId: assignedTo,
          type: "notice",
          title: "New Ticket Assigned",
          body: `You have been assigned a ticket: "${ticket.title}"`,
          actionUrl: `/tickets/${safeTicketId}`,
          read: false,
          createdAt: now,
        };
        await adminDb.collection("notifications").add(notifPayload);

        sendPushToUsers({
          userIds: [assignedTo],
          title: notifPayload.title,
          body: notifPayload.body,
          data: { actionUrl: notifPayload.actionUrl, ticketId: safeTicketId },
        });
      } catch (notifyErr) {
        console.error("UPDATE_STATUS_NOTIFY_ASSIGN_ERROR:", notifyErr);
      }
    }

    // 3. Reassignment → notify the previously assigned admin (if different)
    const isReassignment =
      previousAssignedTo &&
      assignedTo &&
      previousAssignedTo !== assignedTo &&
      previousAssignedTo !== decoded.uid;

    if (isReassignment) {
      try {
        const notifPayload = {
          userId: previousAssignedTo,
          type: "notice",
          title: "Ticket Reassigned",
          body: `Ticket "${ticket.title}" has been reassigned to someone else.`,
          actionUrl: `/tickets/${safeTicketId}`,
          read: false,
          createdAt: now,
        };
        await adminDb.collection("notifications").add(notifPayload);

        sendPushToUsers({
          userIds: [previousAssignedTo],
          title: notifPayload.title,
          body: notifPayload.body,
          data: { actionUrl: notifPayload.actionUrl, ticketId: safeTicketId },
        });
      } catch (notifyErr) {
        console.error("UPDATE_STATUS_NOTIFY_REASSIGN_ERROR:", notifyErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("UPDATE_STATUS_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
