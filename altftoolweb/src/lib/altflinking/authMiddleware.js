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
    // checkRevoked: true — this module gates real financial/marketplace
    // orders, so a token that survives past an admin revoking/disabling the
    // account must not keep working for the rest of its natural lifetime.
    // The extra Firestore lookup this incurs is an acceptable cost here.
    const decoded = await auth.verifyIdToken(token, true);
    return { user: decoded, error: null };
  } catch (e) {
    console.error("[altflinking/authMiddleware] verifyIdToken failed", e);
    return { user: null, error: "Invalid or expired token" };
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

// True for the two roles allowed unrestricted (fail-open) access to orders
export function isAdminRole(role) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

// Fields that are internal/admin-only and must never be exposed to the
// BUYER or PUBLISHER on their own orders (e.g. dispute/fraud notes).
const ADMIN_ONLY_ORDER_FIELDS = ["adminNotes", "adminApprovedBy", "adminApprovedAt"];

// Strip admin-only fields from an order before it's returned to a
// non-admin caller. Admins get the document unchanged.
export function sanitizeOrder(order, role) {
  if (isAdminRole(role)) return order;
  const sanitized = { ...order };
  for (const field of ADMIN_ONLY_ORDER_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

// Standard error responses
export const err = (msg, status = 400) =>
  NextResponse.json({ error: msg }, { status });

export const ok = (data, status = 200) =>
  NextResponse.json({ data, success: true }, { status });
