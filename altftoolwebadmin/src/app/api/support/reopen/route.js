// /api/support/reopen/route.js

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function PATCH(request) {
  try {
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

    // Only the creator or an admin can reopen
    const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get();
    const isAdmin = adminSnap.exists;
    const isCreator = ticket.createdBy === decoded.uid;

    if (!isAdmin && !isCreator) {
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