"use client";

// lib/usePushNotifications.js
//
// Foreground messages now emit to PushToastHost (custom card) instead of
// calling new Notification() (native OS popup).
// Background/closed tab behaviour is unchanged — the SW shows the OS popup.

import { useEffect, useRef } from "react";
import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { emitPushToast } from "@/lib/pushToastBus";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ── Helpers ────────────────────────────────────────────────────────────────

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(
      "/api/firebase-messaging-sw",
      { scope: "/" }
    );
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.warn("[push] SW registration failed:", err.message);
    return null;
  }
}

async function requestPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") {
    console.warn("[push] notification permission denied");
    return false;
  }
  const result = await Notification.requestPermission();
  return result === "granted";
}

async function getFcmToken(messaging, swRegistration) {
  const { getToken } = await import("firebase/messaging");
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });
    if (!token) {
      console.warn("[push] getToken returned empty — check VAPID key and SW");
    }
    return token;
  } catch (err) {
    console.warn("[push] getToken failed:", err.message);
    return null;
  }
}

async function saveToken(token, getIdToken) {
  try {
    const idToken = await getIdToken();
    const res = await fetch("/api/notifications/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      console.warn("[push] save-token responded:", res.status);
    }
  } catch (err) {
    console.warn("[push] saveToken failed:", err.message);
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function usePushNotifications(user) {
  const initialised = useRef(false);

  useEffect(() => {
    if (user?.isLocalAdmin) return;
    if (!user || initialised.current) return;

    let unsubscribeForeground = null;

    async function setup() {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.warn("[push] FCM not supported in this environment");
        return;
      }

      const swReg = await registerServiceWorker();
      if (!swReg) return;

      const granted = await requestPermission();
      if (!granted) return;

      const token = await getFcmToken(messaging, swReg);
      if (!token) return;

      await saveToken(token, () => user.getIdToken());
      initialised.current = true;

      // ── Foreground: emit to custom toast card ──────────────────────────
      // The SW handles background/closed. When the tab is open we show
      // our own branded card via PushToastHost instead of the OS popup.
      unsubscribeForeground = onMessage(messaging, (payload) => {
        const d = payload.data ?? {};

        emitPushToast({
          id:        `${Date.now()}-${Math.random()}`,
          title:     d.title     ?? "AltFTools Admin",
          body:      d.body      ?? "",
          type:      d.type      ?? "notice",
          actionUrl: d.actionUrl ?? null,
        });
      });
    }

    setup();

    return () => {
      unsubscribeForeground?.();
    };
  }, [user]);
}
