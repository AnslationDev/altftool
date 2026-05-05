// api/notifications/save-token/route.js
//
// POST  { token: string }  → appends token to admins/{uid}.fcmTokens (deduped)
// DELETE { token: string } → removes token (call on logout / permission revoke)

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

async function getUid(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
  return decoded.uid;
}

export async function POST(request) {
  try {
    const uid = await getUid(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    // arrayUnion is idempotent — safe to call on every page load
    await adminDb
      .collection("admins")
      .doc(uid)
      .update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[save-token/POST]", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const uid = await getUid(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    await adminDb
      .collection("admins")
      .doc(uid)
      .update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(token),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[save-token/DELETE]", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}