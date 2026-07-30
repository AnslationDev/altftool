import { create } from "zustand";
import { OPENART_URL } from "../lib/site";

/**
 * Copy that promises "OpenArt" (button labels, the redirect countdown) must
 * stay true even if the Firestore-managed link is repointed to a different
 * URL — otherwise a same-tab auto-navigation would tell users they're going
 * one place while actually sending them somewhere else. Derive the label
 * from the real destination instead of hardcoding it.
 */
function labelFor(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "openart.ai" ? "OpenArt" : host;
  } catch {
    return "OpenArt";
  }
}

/**
 * The "copy prompt" destination, fetched from /imgprompt/api/config instead
 * of a hardcoded constant so it can be swapped from server-side config
 * (an admin panel, eventually) without a rebuild. Starts with the static
 * OpenArt fallback so the UI never shows a blank/broken link while the
 * fetch is in flight.
 */
export const useRedirectConfig = create((set, get) => ({
  redirectUrl: OPENART_URL,
  redirectLabel: labelFor(OPENART_URL),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/imgprompt/api/config", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.redirectUrl) {
          set({ redirectUrl: data.redirectUrl, redirectLabel: labelFor(data.redirectUrl), loaded: true });
          return;
        }
      }
    } catch {
      /* keep the static fallback */
    }
    set({ loaded: true });
  },
}));
