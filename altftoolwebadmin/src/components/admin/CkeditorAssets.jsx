"use client";

import { useEffect, useState } from "react";

const CKEDITOR_READY_EVENT = "altftool:ckeditor-ready";
const CKEDITOR_ERROR_EVENT = "altftool:ckeditor-error";

const PRECONNECTS = [
  "https://cdn.ckeditor.com",
  "https://cdn.ckbox.io",
];

const STYLESHEETS = [
  "https://cdn.ckeditor.com/ckeditor5/48.0.1/ckeditor5.css",
  "https://cdn.ckeditor.com/ckeditor5-premium-features/48.0.1/ckeditor5-premium-features.css",
];

const SCRIPT_URLS = {
  core: "https://cdn.ckeditor.com/ckeditor5/48.0.1/ckeditor5.umd.js",
  premium: "https://cdn.ckeditor.com/ckeditor5-premium-features/48.0.1/ckeditor5-premium-features.umd.js",
  ckbox: "https://cdn.ckbox.io/ckbox/2.9.2/ckbox.js",
};

function dispatchEditorReady() {
  window.__ALTFT_CKEDITOR_READY__ = Boolean(window.CKEDITOR);
  window.dispatchEvent(new Event(CKEDITOR_READY_EVENT));
}

function ensureLink({ rel, href }) {
  if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;

  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (rel === "preconnect") link.crossOrigin = "";
  document.head.appendChild(link);
}

function loadScript(src) {
  window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__ ||= {};

  if (window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__[src]) {
    return window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__[src];
  }

  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript?.dataset.loaded === "true") {
    window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__[src] = Promise.resolve();
    return window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__[src];
  }

  window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__[src] = new Promise((resolve, reject) => {
    const script = existingScript || document.createElement("script");

    // cdn.ckeditor.com serves CORS headers; loading the bundles as CORS
    // scripts unmasks their runtime errors (otherwise license errors surface
    // as an unusable "Script error." with no error code).
    script.crossOrigin = "anonymous";
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  return window.__ALTFT_CKEDITOR_SCRIPT_PROMISES__[src];
}

async function loadCkeditorAssets() {
  PRECONNECTS.forEach((href) => ensureLink({ rel: "preconnect", href }));
  STYLESHEETS.forEach((href) => ensureLink({ rel: "stylesheet", href }));

  await loadScript(SCRIPT_URLS.core);
  await Promise.allSettled([loadScript(SCRIPT_URLS.premium), loadScript(SCRIPT_URLS.ckbox)]);

  if (!window.CKEDITOR) {
    throw new Error("CKEditor core script loaded but window.CKEDITOR is unavailable.");
  }
}

export function useCkeditorAssetsReady() {
  const [ready, setReady] = useState(() =>
    typeof window !== "undefined" && Boolean(window.__ALTFT_CKEDITOR_READY__ || window.CKEDITOR),
  );

  useEffect(() => {
    const markReady = () => setReady(Boolean(window.CKEDITOR));
    const markErrored = () => setReady(false);

    if (window.CKEDITOR) markReady();

    window.addEventListener(CKEDITOR_READY_EVENT, markReady);
    window.addEventListener(CKEDITOR_ERROR_EVENT, markErrored);

    return () => {
      window.removeEventListener(CKEDITOR_READY_EVENT, markReady);
      window.removeEventListener(CKEDITOR_ERROR_EVENT, markErrored);
    };
  }, []);

  return ready;
}

export default function CkeditorAssets() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY) return undefined;

    let cancelled = false;

    if (window.CKEDITOR) {
      dispatchEditorReady();
      return undefined;
    }

    loadCkeditorAssets()
      .then(() => {
        if (!cancelled) dispatchEditorReady();
      })
      .catch((error) => {
        if (!cancelled) {
          console.info("CKEditor assets could not be loaded.", error);
          window.dispatchEvent(new Event(CKEDITOR_ERROR_EVENT));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
