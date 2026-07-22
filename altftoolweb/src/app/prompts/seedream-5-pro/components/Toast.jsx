"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, X } from "lucide-react";

const ToastContext = createContext(null);

/**
 * Lightweight, self-contained toast system scoped to the Prompts UI.
 * Avoids adding a global <Toaster/> to the app shell while giving us full
 * control over the "Copied" confirmation styling seen on Toolify.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message, { type = "success", duration = 2200 } = {}) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-2), { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <style>{`
        @keyframes sd-toast-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  // Plain positioning container — each toast is its own live region, so we
  // avoid nesting live regions (which double-announces on some screen readers).
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const isError = toast.type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-sm animate-[sd-toast-in_180ms_ease-out] ${
        isError
          ? "border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)"
          : "border-(--color-success) bg-(--color-success-soft) text-(--color-success)"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          isError ? "bg-(--color-danger)" : "bg-(--color-success)"
        } text-white`}
      >
        {isError ? <X size={13} strokeWidth={3} /> : <Check size={13} strokeWidth={3} />}
      </span>
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="ml-1 opacity-50 transition-opacity hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail soft: outside a provider, no-op so a stray copy never crashes.
    return { toast: () => {}, dismiss: () => {} };
  }
  return ctx;
}
