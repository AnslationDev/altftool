// /api/support/reopen/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { enforceRateLimit } from "@altftool/core/http";

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
    const decoded = await adminAuth.verifyIdToken(token);

    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const ticketRef = adminDb.collection("support_tickets").doc(ticketId);
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