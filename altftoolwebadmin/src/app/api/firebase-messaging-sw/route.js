// app/api/firebase-messaging-sw/route.js
//
// Serves the Firebase Messaging service worker with config injected at
// request time. No readFileSync — the SW source is inlined here so it
// works reliably in all Next.js runtimes (Node, Edge, serverless).

import { NextResponse } from "next/server";

export async function GET() {
  // All values come from server-side env (NEXT_PUBLIC_ vars are available
  // server-side too — they're just also exposed to the browser).
  const config = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? "",
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "",
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? "",
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID              ?? "",
  };

  // ─── Service Worker source ────────────────────────────────────────────────
  // IMPORTANT: We send DATA-ONLY messages from the server (no notification
  // field). This means the browser never auto-handles the push — our SW
  // always runs and controls exactly what is shown.
  const swSource = `
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

// Fires when the app is in the background or the tab is closed.
// Because we send data-only messages this handler is always called —
// the browser never auto-shows anything before we get here.
messaging.onBackgroundMessage((payload) => {
  const d = payload.data ?? {};
  const title = d.title || "AltFTools Admin";
  const body  = d.body  || "";

  self.registration.showNotification(title, {
    body,
    icon:      "/icons/icon-192x192.png",
    badge:     "/icons/badge-72x72.png",
    tag:       d.broadcastId ?? d.ticketId ?? "admin-notif",
    renotify:  true,
    data: { actionUrl: d.actionUrl ?? "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const actionUrl = event.notification.data?.actionUrl ?? "/";
  const fullUrl   = new URL(actionUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === fullUrl && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(fullUrl);
      })
  );
});
`;

  return new NextResponse(swSource, {
    status: 200,
    headers: {
      "Content-Type":          "application/javascript",
      "Service-Worker-Allowed": "/",
      // No caching in dev; tune for prod if needed
      "Cache-Control":         "no-store",
    },
  });
}