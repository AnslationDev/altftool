// public/firebase-messaging-sw.js
//
// This file MUST live at /public/firebase-messaging-sw.js so the browser
// can register it at the root scope (/firebase-messaging-sw.js).
// It must NOT be imported through the Next.js module system.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// ---------------------------------------------------------------------------
// Firebase config — must match NEXT_PUBLIC_FIREBASE_* values exactly.
// These values are intentionally hard-coded here because service workers
// cannot access Next.js environment variables. They are all public-safe keys.
// ---------------------------------------------------------------------------
firebase.initializeApp({
  apiKey: self.__FIREBASE_API_KEY__,
  authDomain: self.__FIREBASE_AUTH_DOMAIN__,
  projectId: self.__FIREBASE_PROJECT_ID__,
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__,
  appId: self.__FIREBASE_APP_ID__,
});

const messaging = firebase.messaging();

// ---------------------------------------------------------------------------
// Background message handler
// Fires when the app is in the background or closed.
// The browser will show a native OS notification automatically if you return
// early — but we override it here to control the title/body/icon/click URL.
// ---------------------------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, badge, data = {} } = payload.notification ?? {};
  const actionUrl = data.actionUrl ?? payload.data?.actionUrl ?? "/";

  self.registration.showNotification(title ?? "AltFTools Admin", {
    body: body ?? "",
    icon: icon ?? "/icons/icon-192x192.png",
    badge: badge ?? "/icons/badge-72x72.png",
    tag: data.broadcastId ?? data.ticketId ?? "admin-notif",   // deduplicates same-topic notifications
    renotify: true,
    data: { actionUrl },
  });
});

// ---------------------------------------------------------------------------
// Notification click handler
// Focuses an existing tab on the action URL, or opens a new one.
// ---------------------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const actionUrl = event.notification.data?.actionUrl ?? "/";
  const fullUrl = new URL(actionUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Try to focus an already open tab on the same URL
        for (const client of windowClients) {
          if (client.url === fullUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});