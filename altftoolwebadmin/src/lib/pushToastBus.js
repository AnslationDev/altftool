// lib/pushToastBus.js
//
// Tiny event bus — same pattern as your existing alertBus.
// usePushNotifications emits here instead of calling new Notification().
// PushToastHost listens and renders the custom card.

const listeners = new Set();

export function emitPushToast(toast) {
  listeners.forEach((fn) => fn(toast));
}

export function subscribePushToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}