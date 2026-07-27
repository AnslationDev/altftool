/**
 * API Middleware: Auth verification + RBAC for ALTFLinking API routes
 * Location: src/lib/altflinking/authMiddleware.js
 */

import { initAdmin } from "./firebaseAdmin";
import { NextResponse } from "next/server";

// Verify Firebase ID token from Authorization header, return decoded user
export async function verifyToken(request) {
  const header = request.headers.get("authorization") || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { user: null, error: "Missing Authorization header" };

  const { auth, ready } = initAdmin();
  if (!ready) return { user: null, error: "Server not configured" };

  try {
    const decoded = await auth.verifyIdToken(token);
    return { user: decoded, error: null };
  } catch (e) {
    return { user: null, error: "Invalid or expired token: " + e.message };
  }
}

// Fetch the user's role from Firestore (single source of truth for RBAC)
export async function getUserRole(uid) {
  const { db, ready } = initAdmin();
  if (!ready) return null;
  try {
    const snap = await db.collection("users").doc(uid).get();
    return snap.exists ? snap.data().role : "BUYER";
  } catch {
    return null;
  }
}

// Middleware factory — wraps a route handler with auth + optional role check
export function withAuth(handler, { requiredRole } = {}) {
  return async (request, context) => {
    const { user, error } = await verifyToken(request);
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(user.uid);
    if (!role) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // RBAC check
    if (requiredRole) {
      const hierarchy = { BUYER: 1, PUBLISHER: 2, ADMIN: 3, SUPERADMIN: 4 };
      if ((hierarchy[role] || 0) < (hierarchy[requiredRole] || 99)) {
        return NextResponse.json(
          { error: `Requires ${requiredRole} role. You are: ${role}` },
          { status: 403 }
        );
      }
    }

    // Attach enriched user to request for handler use
    request.altfUser = { ...user, role };
    return handler(request, context);
  };
}

// Convenience wrappers
export const withAdmin     = (h) => withAuth(h, { requiredRole: "ADMIN" });
export const withPublisher = (h) => withAuth(h, { requiredRole: "PUBLISHER" });
export const withBuyer     = (h) => withAuth(h, { requiredRole: "BUYER" });

// Standard error responses
export const err = (msg, status = 400) =>
  NextResponse.json({ error: msg }, { status });

export const ok = (data, status = 200) =>
  NextResponse.json({ data, success: true }, { status });
