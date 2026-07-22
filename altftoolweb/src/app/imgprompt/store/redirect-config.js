import { create } from "zustand";
import { OPENART_URL } from "../lib/site";

/**
 * The "copy prompt" destination, fetched from /imgprompt/api/config instead
 * of a hardcoded constant so it can be swapped from server-side config
 * (an admin panel, eventually) without a rebuild. Starts with the static
 * OpenArt fallback so the UI never shows a blank/broken link while the
 * fetch is in flight.
 */
export const useRedirectConfig = create((set, get) => ({
  redirectUrl: OPENART_URL,
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/imgprompt/api/config", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.redirectUrl) {
          set({ redirectUrl: data.redirectUrl, loaded: true });
          return;
        }
      }
    } catch {
      /* keep the static fallback */
    }
    set({ loaded: true });
  },
}));
