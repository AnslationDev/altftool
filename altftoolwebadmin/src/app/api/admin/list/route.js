import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);

    const snapshot = await adminDb
      .collection("admins")
      .get();

    const admins = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis?.() || null, // ✅ FIX
      };
    });

    return NextResponse.json({ admins });

  } catch (err) {
    console.error("ADMIN LIST ERROR:", err);

    return NextResponse.json(
      { error: err.message === "Unauthorized" ? "Unauthorized" : err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
