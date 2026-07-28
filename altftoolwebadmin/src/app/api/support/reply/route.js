// api/support/reply/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { getRbacRootRef } from "@/lib/serverRbac";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { enforceRateLimit } from "@altftool/core/http";

// Superadmin recipients for unassigned-ticket reply notifications. Mirrors
// resolveSuperAdminIds() in support/create/route.js (RBAC store first, legacy
// `admins` second) — duplicated rather than imported since that helper is not
// exported from its module.
async function resolveSuperAdminIds() {
  const ids = new Set();

  try {
    const usersSnap = await getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).get();
    usersSnap.docs.forEach((doc) => {
      const data = doc.data() || {};
      const isSuperAdmin =
        data.isSuperAdmin === true || data.roleType === "superadmin" || data.roleId === "super_admin";
      const status = data.status || (data.isActive === false ? "suspended" : "active");
      if (isSuperAdmin && status === "active") ids.add(data.uid || doc.id);
    });
  } catch (err) {
    console.error("REPLY_RBAC_RECIPIENTS_ERROR:", err);
  }

  try {
    const legacySnap = await adminDb
      .collection("admins")
      .where("roleType", "==", "superadmin")
      .where("isActive", "==", true)
      .get();
    legacySnap.docs.forEach((doc) => ids.add(doc.id));
  } catch (err) {
    console.error("REPLY_LEGACY_RECIPIENTS_ERROR:", err);
  }

  return [...ids].filter(Boolean);
}

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

    // RBAC-aware, isActive-checked admin resolution — a bare `admins/{uid}`
    // existence check ignored RBAC-only admins entirely (blocking replies from
    // anyone created via the current Admins UI) and let a deactivated admin
    // keep replying, since existence alone was never re-checked against status.
    let admin = null;
    try {
      ({ admin } = await verifyActiveAdmin(request));
    } catch {
      admin = null;
    }
    const isAdmin = Boolean(admin);
    const isCreator = ticket.createdBy === decoded.uid;
    // Ticket administration is a superadmin-only module (see adminRoutes.js /
    // update-status/route.js) — "any active admin" let a non-superadmin write
    // into a ticket that is neither theirs nor assigned to them.
    const canManageTicket =
      isAdmin && hasModuleAccess({ adminData: admin, moduleKey: "tickets", action: "write" });

    if (!canManageTicket && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Date.now();

    await ticketRef.collection("messages").add({
      senderId: decoded.uid,
      message: message.trim(),
      createdAt: now,
    });

    await ticketRef.update({ updatedAt: now });

    // Determine who to notify. canManageTicket is equivalent to "is superadmin"
    // (tickets is a superadmin-only module — see hasModuleAccess above), so it
    // doubles as that flag here rather than recomputing it.
    const isSuperAdmin = canManageTicket;
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

      // The reply message and ticket update above have already committed —
      // a failure notifying the other party must not turn a successful reply
      // into a client-visible 500 (and a retry that double-posts the reply).
      try {
        await adminDb.collection("notifications").add(notifPayload);
        sendPushToUsers({
          userIds: [notifyUserId],
          title: notifPayload.title,
          body: notifPayload.body,
          data: { actionUrl: notifActionUrl, ticketId },
        });
      } catch (notifyErr) {
        console.error("REPLY_NOTIFY_ERROR:", notifyErr);
      }
    } else if (isCreator && !ticket.assignedTo) {
      // Unassigned ticket (the default state on creation) — there is no single
      // assignee to notify, so fall back to every active superadmin, same as
      // support/create/route.js does for a brand-new ticket.
      try {
        const superAdminIds = (await resolveSuperAdminIds()).filter((uid) => uid !== decoded.uid);

        if (superAdminIds.length) {
          // /support/{id} is the ticket-creator's own view; superadmins manage
          // tickets from /tickets/{id} (Assign/Update Status controls live
          // there), same as the assigned-recipient branch above.
          const notifActionUrl = `/tickets/${ticketId}`;
          const notifBatch = adminDb.batch();
          superAdminIds.forEach((uid) => {
            const notifRef = adminDb.collection("notifications").doc();
            notifBatch.set(notifRef, {
              userId: uid,
              type: "notice",
              title: "New Reply on Ticket",
              body: `A reply was added to ticket: "${ticket.title}"`,
              actionUrl: notifActionUrl,
              read: false,
              createdAt: now,
            });
          });
          await notifBatch.commit();

          sendPushToUsers({
            userIds: superAdminIds,
            title: "New Reply on Ticket",
            body: `A reply was added to ticket: "${ticket.title}"`,
            data: { actionUrl: notifActionUrl, ticketId },
          });
        }
      } catch (notifyErr) {
        console.error("REPLY_NOTIFY_UNASSIGNED_ERROR:", notifyErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REPLY_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
