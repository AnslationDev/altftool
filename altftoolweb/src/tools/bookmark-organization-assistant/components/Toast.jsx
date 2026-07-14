"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const ACCENT = {
  success: "text-(--primary)",
  error: "text-rose-500",
  info: "text-(--secondary-foreground)",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, options = {}) => {
      const id =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const type = options.type || "success";
      const duration = options.duration ?? 3500;
      setToasts((prev) => [...prev, { id, message, type, action: options.action }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const Icon = ICONS[item.type] || Info;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-(--border) bg-(--card) px-4 py-3 shadow-lg"
              >
                <Icon className={`h-5 w-5 shrink-0 ${ACCENT[item.type] || ACCENT.info}`} />
                <p className="flex-1 text-sm font-medium text-(--foreground)">{item.message}</p>
                {item.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      item.action.onClick();
                      dismiss(item.id);
                    }}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-(--primary) hover:bg-(--muted)"
                  >
                    {item.action.label}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--muted)"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}
