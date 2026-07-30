// /api/support/reopen/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { enforceRateLimit } from "@altftool/core/http";

// Distinguishes "the caller's credentials are missing/invalid" (401) from an
// infrastructure fault raised while verifying them — mirrors create/route.js
// and update-status/route.js so an expired/invalid token maps to 401 instead
// of falling into the outer catch as a generic 500.
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
      scope: "support:reopen",
      windowMs: 60000,
    });
    if (limited) return limited;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (authErr) {
      if (isAuthenticationFailure(authErr)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Anything else is a genuine backend fault: rethrow so the outer catch
      // logs it and answers 500 instead of telling the client to re-authenticate.
      throw authErr;
    }

    const { ticketId } = await request.json();

    // Mirrors update-status/route.js: trim once and use the trimmed value
    // everywhere, and reject any ticketId containing '/' so it can't resolve
    // to a nested document path under support_tickets instead of a top-level
    // ticket.
    if (typeof ticketId !== "string" || !ticketId.trim() || ticketId.includes("/")) {
      return NextResponse.json({ error: "Missing or invalid ticketId" }, { status: 400 });
    }

    const safeTicketId = ticketId.trim();

    const ticketRef = adminDb.collection("support_tickets").doc(safeTicketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketSnap.data();

    // Only the creator or an admin with ticket-management access can reopen.
    // `isAdmin` alone (any active admin, regardless of role) let ANY admin
    // reopen ANY other admin's ticket — reply/route.js already gates on
    // hasModuleAccess(tickets, write) for the identical reason; this route
    // was the one place that check was missing.
    let admin = null;
    try {
      ({ admin } = await verifyActiveAdmin(request));
    } catch {
      admin = null;
    }
    const isCreator = ticket.createdBy === decoded.uid;
    const canManageTicket =
      Boolean(admin) && hasModuleAccess({ adminData: admin, moduleKey: "tickets", action: "write" });

    if (!canManageTicket && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ticketRef.update({
      status: "open",
      closedAt: null,
      autoDeleteAt: null,
      isDeleted: false,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REOPEN_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}