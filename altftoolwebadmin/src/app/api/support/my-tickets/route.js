// /api/support/my-tickets/route.js

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

    const snap = await adminDb
      .collection("support_tickets")
      .where("createdBy", "==", decoded.uid)
      .where("isDeleted", "!=", true)
      .orderBy("isDeleted")
      .orderBy("createdAt", "desc")
      .get();

    const tickets = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("MY_TICKETS_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}