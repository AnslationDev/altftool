import { create } from "zustand";

/** Controls the global "opening OpenArt…" countdown overlay. */
export const useRedirect = create((set) => ({
  active: false,
  label: "your prompt",
  start: (label = "your prompt") => set({ active: true, label }),
  stop: () => set({ active: false }),
}));
