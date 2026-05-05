import { createTtlCache } from "@altftool/core/cache";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const adminAccessCache = createTtlCache({ ttlMs: 5000, maxEntries: 200 });

async function getAdminAccess(uid) {
  return adminAccessCache.getOrSet(`admin-access:${uid}`, async () => {
    const snap = await adminDb.collection("admins").doc(uid).get();
    return {
      data: snap.data(),
      exists: snap.exists,
    };
  }, 5000);
}

export async function verifySuperAdminRequest(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const decoded = await adminAuth.verifyIdToken(header.split("Bearer ")[1]);
  const { data, exists } = await getAdminAccess(decoded.uid);

  if (!exists || data?.roleType !== "superadmin" || data?.isActive === false) {
    throw new Error("Unauthorized");
  }

  return decoded;
}
