import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef } from "@/lib/serverRbac";

function toMillis(value) {
  return value?.toMillis?.() || (value instanceof Date ? value.getTime() : value || null);
}

function normalizeRequest(doc, source) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    source,
    ...data,
    createdAt: toMillis(data.createdAt),
    approvedAt: toMillis(data.approvedAt),
    rejectedAt: toMillis(data.rejectedAt),
  };
}

async function readRequests(collectionRef, statusFilter, source) {
  let query = collectionRef.orderBy("createdAt", "desc");
  if (statusFilter) {
    query = query.where("status", "==", statusFilter);
  }
  const snap = await query.get().catch(async () => {
    const fallback = await collectionRef.get();
    return {
      docs: fallback.docs
        .filter((doc) => !statusFilter || doc.data()?.status === statusFilter)
        .sort((a, b) => toMillis(b.data()?.createdAt) - toMillis(a.data()?.createdAt)),
    };
  });
  return snap.docs.map((doc) => normalizeRequest(doc, source));
}

export async function GET(req) {
  try {
    await verifySuperAdminRequest(req);

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const [legacyRequests, rbacRequests] = await Promise.all([
      readRequests(adminDb.collection("accessRequests"), statusFilter, "legacy").catch(() => []),
      readRequests(getRbacRootRef().collection(RBAC_COLLECTIONS.accessRequests), statusFilter, "rbac").catch(() => []),
    ]);

    const merged = new Map();
    legacyRequests.forEach((request) => merged.set(request.id, request));
    rbacRequests.forEach((request) => {
      const existing = merged.get(request.id) || {};
      merged.set(request.id, { ...existing, ...request });
    });

    const requests = Array.from(merged.values()).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    );

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("ACCESS_REQUESTS_LIST_ERROR:", err);
    return NextResponse.json({ error: "Unauthorized or failed to list requests" }, { status: 401 });
  }
}
