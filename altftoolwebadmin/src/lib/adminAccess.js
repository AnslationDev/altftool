import { createTtlCache } from "@altftool/core/cache";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const adminAccessCache = createTtlCache({ ttlMs: 5000, maxEntries: 200 });
const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";
const LOCAL_ADMIN_UID = "local-dev-admin";
const LOCAL_ADMIN_EMAIL = "admin@altftool.local";

function getBearerToken(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.split("Bearer ")[1];
}

export function isLocalDevAdminRequest(request) {
  // SECURITY: the local-dev bypass must ONLY be reachable in a development
  // build. The previous implementation also accepted any request whose `Host`
  // header was "localhost" — but that header is client-controlled, so a
  // production deployment could be tricked into granting superadmin via the
  // well-known LOCAL_ADMIN_TOKEN simply by spoofing `Host: localhost`.
  // `process.env.NODE_ENV` is fixed at build/runtime by the server and cannot
  // be spoofed by the client, so we gate exclusively on it.
  if (process.env.NODE_ENV !== "development") return false;
  return getBearerToken(request) === LOCAL_ADMIN_TOKEN;
}

export function createLocalDevAdminActor() {
  return {
    uid: LOCAL_ADMIN_UID,
    email: LOCAL_ADMIN_EMAIL,
    isLocalAdmin: true,
  };
}

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
  if (isLocalDevAdminRequest(request)) {
    return createLocalDevAdminActor();
  }

  const token = getBearerToken(request);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = await adminAuth.verifyIdToken(token);
  const { data, exists } = await getAdminAccess(decoded.uid);

  if (!exists || data?.roleType !== "superadmin" || data?.isActive === false) {
    throw new Error("Unauthorized");
  }

  return decoded;
}
