// app/api/notifications/test-push/route.js
//
// DEV-ONLY endpoint. Remove or gate behind NODE_ENV check before deploying.
//
// POST with Bearer token → sends a test push to the calling user immediately.
// Use this to verify the full pipeline without triggering real app events.
//
// curl -X POST http://localhost:3000/api/notifications/test-push \
//   -H "Authorization: Bearer YOUR_ID_TOKEN"

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendPushToUsers } from "@/lib/sendPushNotification";

export async function POST(request) {
  // Optional: remove this guard if you want it available in production too
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token   = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Check user has tokens saved
    const snap      = await adminDb.collection("admins").doc(decoded.uid).get();
    const fcmTokens = snap.data()?.fcmTokens ?? [];

    if (fcmTokens.length === 0) {
      return NextResponse.json({
        error: "No FCM tokens found for this user. Make sure the hook ran and saved a token.",
      }, { status: 400 });
    }

    await sendPushToUsers({
      userIds:  [decoded.uid],
      title:    "🔔 Push is working!",
      body:     "This is a test notification from AltFTools Admin.",
      data:     { actionUrl: "/support", ticketId: "test-123" },
    });

    return NextResponse.json({
      success:    true,
      uid:        decoded.uid,
      tokenCount: fcmTokens.length,
      message:    "Push sent. Check your browser / OS notification area.",
    });
  } catch (err) {
    console.error("[test-push]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
