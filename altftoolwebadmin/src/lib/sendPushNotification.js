// lib/sendPushNotification.js
//
// Server-side helper. Sends FCM web push notifications.
//
// KEY DESIGN DECISION: we send DATA-ONLY messages (no top-level "notification"
// field). This guarantees the service worker's onBackgroundMessage always fires
// and controls what is shown — the browser never intercepts the push first.
// The title/body live inside the "data" payload instead.

import { adminDb, adminMessaging } from "@/lib/firebaseAdmin";

/**
 * Send a push notification to one or more admin users.
 *
 * @param {object}   opts
 * @param {string[]} opts.userIds   - Firestore admin UIDs
 * @param {string}   opts.title     - Notification title
 * @param {string}   opts.body      - Notification body text
 * @param {object}   [opts.data]    - Extra data forwarded to the SW (actionUrl, ticketId, …)
 */
export async function sendPushToUsers({ userIds, title, body, data = {} }) {
  if (!userIds?.length || !title) return;

  try {
    // ── 1. Collect FCM tokens ──────────────────────────────────────────────
    const snapshots = await Promise.all(
      userIds.map((uid) => adminDb.collection("admins").doc(uid).get())
    );

    const tokens = [];
    for (const snap of snapshots) {
      const fcmTokens = snap.data()?.fcmTokens;
      if (Array.isArray(fcmTokens) && fcmTokens.length) {
        tokens.push(...fcmTokens);
      }
    }

    if (tokens.length === 0) {
      return;
    }

    const uniqueTokens = [...new Set(tokens)];

    // ── 2. Build DATA-ONLY payload ─────────────────────────────────────────
    // All values in the data map must be strings (FCM requirement).
    const dataPayload = {
      title,
      body: body ?? "",
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    const CHUNK = 500; // FCM multicast limit

    for (let i = 0; i < uniqueTokens.length; i += CHUNK) {
      const chunk = uniqueTokens.slice(i, i + CHUNK);

      const response = await adminMessaging.sendEachForMulticast({
        tokens: chunk,

        // ── DATA-ONLY — no "notification" key at top level ────────────────
        // This forces all delivery through the SW onBackgroundMessage handler
        // and also allows the foreground onMessage handler to fire in the app.
        data: dataPayload,

        webpush: {
          headers: {
            // TTL: keep the message for 1 hour if the browser is offline
            TTL: "3600",
          },
          // fcmOptions.link pre-fills the click URL shown in some browsers
          fcmOptions: {
            link: data.actionUrl ?? "/",
          },
        },
      });

      // ── 3. Log results & collect stale tokens ─────────────────────────
      const staleTokens = [];
      let successCount = 0;

      response.responses.forEach((resp, idx) => {
        if (resp.success) {
          successCount++;
        } else {
          const code    = resp.error?.code    ?? "unknown";
          const message = resp.error?.message ?? "";
          console.warn(`[push] token[${idx}] failed — ${code}: ${message}`);

          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token"
          ) {
            staleTokens.push(chunk[idx]);
          }
        }
      });

      if (staleTokens.length > 0) {
        await removeStaleTokens(staleTokens);
      }
    }
  } catch (err) {
    // Never throws — push is always best-effort
    console.error("[push] sendPushToUsers error:", err.message, err.code ?? "");
  }
}

// ── Stale token cleanup ────────────────────────────────────────────────────

async function removeStaleTokens(staleTokens) {
  if (!staleTokens.length) return;
  try {
    const staleSet  = new Set(staleTokens);
    const hitDocs   = new Map();

    await Promise.all(
      staleTokens.map(async (token) => {
        const snap = await adminDb
          .collection("admins")
          .where("fcmTokens", "array-contains", token)
          .get();
        snap.docs.forEach((d) => hitDocs.set(d.id, d));
      })
    );

    const batch = adminDb.batch();
    for (const [, doc] of hitDocs) {
      const cleaned = (doc.data().fcmTokens ?? []).filter((t) => !staleSet.has(t));
      batch.update(doc.ref, { fcmTokens: cleaned });
    }
    await batch.commit();
  } catch (err) {
    console.warn("[push] removeStaleTokens error:", err.message);
  }
}
