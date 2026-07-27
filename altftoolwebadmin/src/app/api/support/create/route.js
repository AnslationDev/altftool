// api/support/create/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { getRbacRootRef } from "@/lib/serverRbac";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { enforceRateLimit } from "@altftool/core/http";

const VALID_TYPES = ["query", "bug", "feature"];
const VALID_PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 20000;

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

/**
 * Superadmin recipients for new-ticket notifications.
 * RBAC store first (where admins are created today), legacy `admins` second so
 * seeded/legacy superadmins keep receiving notifications during the migration.
 */
async function resolveSuperAdminIds() {
  const ids = new Set();

  try {
    // Read admin_users once and filter on the raw document data. The
    // listRbacAdminProfiles() helper additionally loads every NON-superadmin's
    // project_access subcollections (one extra read per admin) — work that is
    // thrown away by the superadmin filter below. Role/status semantics here
    // mirror serverRbac.js (isSuperRole + normalizeStatus) exactly.
    const usersSnap = await getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).get();
    usersSnap.docs.forEach((doc) => {
      const data = doc.data() || {};
      const isSuperAdmin =
        data.isSuperAdmin === true || data.roleType === "superadmin" || data.roleId === "super_admin";
      const status = data.status || (data.isActive === false ? "suspended" : "active");
      if (isSuperAdmin && status === "active") ids.add(data.uid || doc.id);
    });
  } catch (err) {
    console.error("SUPPORT_CREATE_RBAC_RECIPIENTS_ERROR:", err);
  }

  try {
    const legacySnap = await adminDb
      .collection("admins")
      .where("roleType", "==", "superadmin")
      .where("isActive", "==", true)
      .get();
    legacySnap.docs.forEach((doc) => ids.add(doc.id));
  } catch (err) {
    console.error("SUPPORT_CREATE_LEGACY_RECIPIENTS_ERROR:", err);
  }

  return [...ids].filter(Boolean);
}

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "support:create",
      windowMs: 60000,
    });
    if (limited) return limited;

    // A verified Firebase token is not enough: the admin app shares its Firebase
    // project with the public site, so require an actual admin record (RBAC
    // store first, legacy `admins` as fallback).
    let decoded;
    try {
      ({ decoded } = await verifyActiveAdmin(request));
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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { title, description, type, priority } = body ?? {};

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !description.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Distinct, actionable messages — the generic "too long" told the operator
    // nothing about which field or by how much.
    if (title.trim().length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be ${MAX_TITLE_LENGTH} characters or less.` },
        { status: 400 },
      );
    }

    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.` },
        { status: 400 },
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    const safeTitle = title.trim();
    const safeDescription = description.trim();

    const now = Date.now();
    const ticketRef = adminDb.collection("support_tickets").doc();

    await ticketRef.set({
      title: safeTitle,
      description: safeDescription,
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
      message: safeDescription,
      createdAt: now,
    });

    // The ticket + initial message above have already committed — a failure
    // notifying superadmins must not turn a successful ticket creation into a
    // client-visible 500 (and a retry that creates a duplicate ticket).
    try {
      const superAdminIds = await resolveSuperAdminIds();

      if (!superAdminIds.length) {
        console.warn(
          `SUPPORT_CREATE_NO_RECIPIENTS: ticket ${ticketRef.id} created but no active superadmin was found to notify.`,
        );
      } else {
        // Write in-app notifications
        const notifBatch = adminDb.batch();
        superAdminIds.forEach((uid) => {
          const notifRef = adminDb.collection("notifications").doc();
          notifBatch.set(notifRef, {
            userId: uid,
            type: "notice",
            title: "New Support Ticket",
            body: `A new ticket was raised: "${safeTitle}"`,
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
          body: `A new ticket was raised: "${safeTitle}"`,
          data: { actionUrl: `/tickets/${ticketRef.id}`, ticketId: ticketRef.id },
        });
      }
    } catch (notifyErr) {
      console.error("SUPPORT_CREATE_NOTIFY_ERROR:", notifyErr);
    }

    return NextResponse.json({ ticketId: ticketRef.id }, { status: 201 });
  } catch (err) {
    console.error("SUPPORT_CREATE_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
