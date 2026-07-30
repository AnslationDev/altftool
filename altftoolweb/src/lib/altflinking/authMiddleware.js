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

// Standard error responses
export const err = (msg, status = 400) =>
  NextResponse.json({ error: msg }, { status });

export const ok = (data, status = 200) =>
  NextResponse.json({ data, success: true }, { status });
