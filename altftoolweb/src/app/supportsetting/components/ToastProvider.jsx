"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Toast, ToastHost } from "@altftool/ui";

const ToastCtx = createContext(null);

let idCounter = 0;

/**
 * Lightweight toast host built on @altftool/ui's Toast/ToastHost. Replaces
 * the page's old blocking `alert()` calls with a non-blocking, dismissable
 * notification — same information, more premium feel.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback(
    (message, { tone = "info", title, duration = 4500 } = {}) => {
      idCounter += 1;
      const id = idCounter;
      setToasts((prev) => [...prev, { id, message, tone, title }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <ToastHost position="top-right">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            tone={toast.tone}
            title={toast.title}
            message={toast.message}
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </ToastHost>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Fail safe rather than crash the page if a component renders outside
    // the provider during future refactors.
    return () => {};
  }
  return ctx;
}
