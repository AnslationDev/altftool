import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PARAMS } from "../lib/prompt-engine/params";

let counter = 0;
const nextId = () => `h${counter++}-${Math.round(performance.now())}`;

export const useStudio = create()(
  persist(
    (set) => ({
      idea: "",
      modelId: "openart",
      params: { ...DEFAULT_PARAMS },
      mode: "generate",
      result: null,
      generating: false,
      history: [],

      setIdea: (v) => set({ idea: v }),
      setModelId: (v) => set({ modelId: v }),
      setParam: (key, value) => set((s) => ({ params: { ...s.params, [key]: value } })),
      setMode: (m) => set({ mode: m }),
      setResult: (r) => set({ result: r }),
      setGenerating: (b) => set({ generating: b }),
      addHistory: (item) =>
        set((s) => ({
          history: [{ ...item, id: nextId(), at: Date.now() }, ...s.history].slice(0, 100),
        })),
      toggleFavorite: (id) =>
        set((s) => ({
          history: s.history.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h)),
        })),
      removeHistory: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
      resetParams: () => set({ params: { ...DEFAULT_PARAMS } }),
    }),
    {
      name: "imaginnex.studio",
      partialize: (s) => ({
        modelId: s.modelId,
        params: s.params,
        history: s.history,
      }),
    }
  )
);
