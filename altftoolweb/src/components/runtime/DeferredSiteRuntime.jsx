"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ScrollToTopButton = dynamic(
  () => import("@/platform/navigation/ScrollToTopButton"),
  { ssr: false },
);
const NewsletterSubscribeDialog = dynamic(
  () =>
    import("@/platform/consentalerts/NewsletterSubscribeDialog").then(
      (module) => module.NewsletterSubscribeDialog,
    ),
  { ssr: false },
);
const WebVitalsReporter = dynamic(
  () => import("@/components/WebVitalsReporter"),
  {
    ssr: false,
  },
);

const ACTIVATION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"];

export default function DeferredSiteRuntime({ reportWebVitals = false }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleHandle;
    let timeoutHandle;
    let settled = false;

    const cleanup = () => {
      ACTIVATION_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, activateAndCleanup);
      });
      if (idleHandle && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
    const activateAndCleanup = () => {
      if (settled) return;
      settled = true;
      cleanup();
      setReady(true);
    };

    ACTIVATION_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, activateAndCleanup, {
        passive: true,
        once: true,
      });
    });

    if (window.requestIdleCallback) {
      idleHandle = window.requestIdleCallback(activateAndCleanup, {
        timeout: 3000,
      });
    } else {
      timeoutHandle = window.setTimeout(activateAndCleanup, 1800);
    }

    return cleanup;
  }, []);

  if (!ready) return null;

  return (
    <>
      <ScrollToTopButton />
      <NewsletterSubscribeDialog />
      {reportWebVitals ? <WebVitalsReporter /> : null}
    </>
  );
}
