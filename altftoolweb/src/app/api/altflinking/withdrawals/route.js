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
    //
    // The balance check (read orders + prior withdrawals) and the balance
    // deduction (creating the new withdrawal doc) MUST happen atomically —
    // otherwise two concurrent requests can both read the same starting
    // balance, both pass the check, and both get processed, letting a
    // publisher withdraw more than they actually have. Firestore has no
    // dedicated balance field/ledger for this module; the balance is
    // derived on read from `orders` (VERIFIED_LIVE) minus `withdrawals`
    // (PENDING/PAID), so the whole read-check-write sequence is wrapped in
    // a single transaction. Firestore tracks the query result sets read
    // inside a transaction: if a concurrent transaction commits a change
    // that would affect those results (e.g. another PENDING withdrawal)
    // before this one commits, this transaction is retried automatically,
    // re-reading the now-updated totals and re-evaluating the check.
    const withdrawalsCollection = db.collection("withdrawals");
    const now = FieldValue.serverTimestamp();
    let remainingBalance = 0;
    let insufficientBalance = false;
    let withdrawalData = null;
    let newDocRef = null;

    await db.runTransaction(async (tx) => {
      const publisherOrders = await tx.get(
        db
          .collection("orders")
          .where("publisherId", "==", user.uid)
          .where("status", "==", "VERIFIED_LIVE"),
      );
      const availableBalance = publisherOrders.docs.reduce(
        (sum, doc) => sum + (Number(doc.data().price) || 0),
        0,
      );
      const priorWithdrawals = await tx.get(
        withdrawalsCollection
          .where("publisherId", "==", user.uid)
          .where("status", "in", ["PENDING", "PAID"]),
      );
      const alreadyWithdrawn = priorWithdrawals.docs.reduce(
        (sum, doc) => sum + (Number(doc.data().amount) || 0),
        0,
      );
      remainingBalance = availableBalance - alreadyWithdrawn;

      if (amount > remainingBalance) {
        insufficientBalance = true;
        return;
      }

      withdrawalData = {
        publisherId:     user.uid,
        publisherEmail:  user.email,
        amount,
        method:          body.method,
        accountDetails,
        status:          "PENDING",
        requestedAt:     now,
        updatedAt:       now,
      };
      newDocRef = withdrawalsCollection.doc();
      tx.set(newDocRef, withdrawalData);
    });

    if (insufficientBalance) {
      return err(`Requested amount exceeds your available balance of $${remainingBalance.toFixed(2)}`, 400);
    }

    return ok({ id: newDocRef.id, ...withdrawalData, status: "PENDING" }, 201);
  } catch (e) {
    console.error("[POST /withdrawals]", e);
    return err("Failed to submit withdrawal", 500);
  }
}
