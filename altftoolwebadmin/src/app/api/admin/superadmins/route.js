import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";

export async function GET(request) {
  try {
    await verifyActiveAdmin(request);

    const snapshot = await adminDb
      .collection("admins")
      .where("roleType", "==", "superadmin")
      .where("isActive", "==", true)
      .get();

    const superadmins = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email ?? null,
        fullName: data.fullName ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        photoURL: data.photoURL ?? null,
        team: data.team ?? null,
        designation: data.designation ?? null,
      };
    });

    return NextResponse.json({ superadmins });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Inactive admin" ? 401 : 500 },
    );
  }
}
