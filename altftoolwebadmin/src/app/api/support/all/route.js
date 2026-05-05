// /api/support/all/route.js
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Verify superadmin
    const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get();
    const adminData = adminSnap.data();
    if (!adminData || adminData.roleType !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const priorityFilter = searchParams.get("priority");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    let query = adminDb.collection("support_tickets");

    if (!includeDeleted) {
      query = query.where("isDeleted", "!=", true).orderBy("isDeleted");
    }

    if (statusFilter) {
      query = query.where("status", "==", statusFilter);
    }

    if (priorityFilter) {
      query = query.where("priority", "==", priorityFilter);
    }

    query = query.orderBy("createdAt", "desc");

    const snap = await query.get();
    const tickets = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("ALL_TICKETS_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}