import { create } from "zustand";

/** Controls the global "opening OpenArt…" countdown overlay. */
export const useRedirect = create((set, get) => ({
  active: false,
  label: "your prompt",
  timerId: null,
  start: (label = "your prompt", timerId = null) => set({ active: true, label, timerId }),
  // Dismissing the overlay must cancel the pending navigation, not just hide
  // the UI — otherwise the user still gets force-redirected after dismissing.
  stop: () => {
    const { timerId } = get();
    if (timerId) window.clearTimeout(timerId);
    set({ active: false, timerId: null });
  },
}));
