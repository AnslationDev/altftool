import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function verifySuperAdminRequest(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const decoded = await adminAuth.verifyIdToken(header.split("Bearer ")[1]);
  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  const data = snap.data();

  if (!snap.exists || data?.roleType !== "superadmin" || data?.isActive === false) {
    throw new Error("Unauthorized");
  }

  return decoded;
}
