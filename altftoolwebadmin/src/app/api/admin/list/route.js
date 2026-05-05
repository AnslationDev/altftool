import admin from "firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await admin
      .firestore()
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
      { error: err.message },
      { status: 500 }
    );
  }
}
