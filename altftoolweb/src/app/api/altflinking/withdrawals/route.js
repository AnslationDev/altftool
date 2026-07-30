/**
 * API: Publisher payout withdrawals
 * GET  /api/altflinking/withdrawals  — publisher sees their own, admin sees all
 * POST /api/altflinking/withdrawals  — publisher requests a payout
 */

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { initAdmin }    from "@/lib/altflinking/firebaseAdmin";
import { verifyToken, getUserRole, ok, err } from "@/lib/altflinking/authMiddleware";
import { FieldValue }   from "firebase-admin/firestore";

const VALID_METHODS = ["bank", "paypal", "stripe", "crypto"];

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "altflinking:withdrawals",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    let query = db.collection("withdrawals");
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      query = query.where("publisherId", "==", user.uid);
    }

    const snap = await query.orderBy("requestedAt", "desc").limit(200).get();
    const withdrawals = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return ok(withdrawals);
  } catch (e) {
    console.error("[GET /withdrawals]", e);
    return err("Failed to fetch withdrawals", 500);
  }
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 10,
    scope: "altflinking:withdrawals",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { user, error } = await verifyToken(request);
  if (error || !user) return err(error || "Unauthorized", 401);

  const role = await getUserRole(user.uid);
  if (!["PUBLISHER", "ADMIN", "SUPERADMIN"].includes(role)) {
    return err("Only Publishers can request a payout", 403);
  }

  const { db, ready } = initAdmin();
  if (!ready) return err("Service temporarily unavailable", 503);

  try {
    const body = await request.json();

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 50) {
      return err("Withdrawal amount must be a number of at least $50", 400);
    }
    if (!VALID_METHODS.includes(body.method)) {
      return err(`method must be one of: ${VALID_METHODS.join(", ")}`, 400);
    }
    const accountDetails = (body.accountDetails || "").toString().trim();
    if (!accountDetails) {
      return err("accountDetails is required", 400);
    }

    // Confirm the requested amount doesn't exceed the publisher's actual
    // wallet balance instead of trusting whatever the client sends.
    const publisherOrders = await db
      .collection("orders")
      .where("publisherId", "==", user.uid)
      .where("status", "==", "VERIFIED_LIVE")
      .get();
    const availableBalance = publisherOrders.docs.reduce(
      (sum, doc) => sum + (Number(doc.data().price) || 0),
      0,
    );
    const priorWithdrawals = await db
      .collection("withdrawals")
      .where("publisherId", "==", user.uid)
      .where("status", "in", ["PENDING", "PAID"])
      .get();
    const alreadyWithdrawn = priorWithdrawals.docs.reduce(
      (sum, doc) => sum + (Number(doc.data().amount) || 0),
      0,
    );
    const remainingBalance = availableBalance - alreadyWithdrawn;
    if (amount > remainingBalance) {
      return err(`Requested amount exceeds your available balance of $${remainingBalance.toFixed(2)}`, 400);
    }

    const now = FieldValue.serverTimestamp();
    const withdrawalData = {
      publisherId:     user.uid,
      publisherEmail:  user.email,
      amount,
      method:          body.method,
      accountDetails,
      status:          "PENDING",
      requestedAt:     now,
      updatedAt:       now,
    };

    const docRef = await db.collection("withdrawals").add(withdrawalData);

    return ok({ id: docRef.id, ...withdrawalData, status: "PENDING" }, 201);
  } catch (e) {
    console.error("[POST /withdrawals]", e);
    return err("Failed to submit withdrawal", 500);
  }
}
