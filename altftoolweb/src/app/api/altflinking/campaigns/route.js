/**
 * API: Campaigns — buyer creates + lists their campaigns
 * GET  /api/altflinking/campaigns
 * POST /api/altflinking/campaigns
 */

import { initAdmin }  from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    let query = db.collection("campaigns");
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      query = query.where("ownerId", "==", user.uid);
    }
    const snap = await query.orderBy("createdAt", "desc").limit(100).get();
    const campaigns = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return ok(campaigns);
  } catch (e) {
    return err("Failed to fetch campaigns: " + e.message, 500);
  }
}

export async function POST(request) {
  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  if (!["BUYER", "ADMIN", "SUPERADMIN"].includes(role)) {
    return err("Only Buyers can create campaigns", 403);
  }

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const body = await request.json();
    if (!body.name) return err("Campaign name is required", 400);
    if (!body.targetDomain) return err("Target domain is required", 400);

    const now = FieldValue.serverTimestamp();
    const data = {
      ownerId:      user.uid,
      ownerEmail:   user.email,
      name:         body.name.trim(),
      targetDomain: body.targetDomain.trim(),
      budget:       Number(body.budget) || 0,
      spent:        0,
      totalLinks:   0,
      avgDr:        0,
      orderIds:     [],
      status:       "ACTIVE",
      createdAt:    now,
      updatedAt:    now,
    };

    const docRef = await db.collection("campaigns").add(data);
    return ok({ id: docRef.id, ...data }, 201);
  } catch (e) {
    return err("Failed to create campaign: " + e.message, 500);
  }
}
