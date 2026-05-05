"use client";

// components/ui/PushToastHost.jsx
//
// Mount this once inside RootLayout (or AdminLayout) alongside GlobalAlertHost.
// It listens for foreground push messages and renders custom toast cards.
//
// <PushToastHost />

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { subscribePushToast } from "@/lib/pushToastBus";
import { Bell, X, ExternalLink, AlertTriangle, Megaphone, Info } from "lucide-react";

// ── Design tokens per notification type ──────────────────────────────────────

const TYPE_CONFIG = {
  notice: {
    icon: Bell,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "bg-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "bg-amber-500",
  },
  announcement: {
    icon: Megaphone,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accent: "bg-violet-500",
  },
  default: {
    icon: Info,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    accent: "bg-gray-500",
  },
};

const AUTO_DISMISS_MS = 6000;
const MAX_VISIBLE     = 4;

// ── Single toast card ─────────────────────────────────────────────────────────

function ToastCard({ toast, onDismiss }) {
  const router        = useRouter();
  const progressRef   = useRef(null);
  const timerRef      = useRef(null);
  const [visible, setVisible] = useState(false); // controls CSS enter animation
  const [leaving, setLeaving] = useState(false); // controls CSS exit animation

  const cfg  = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.default;
  const Icon = cfg.icon;

  // ── Mount: trigger enter animation ───────────────────────────────────────
  useEffect(() => {
    // Small delay so the enter transition actually plays
    const id = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(id);
  }, []);

  // ── Auto-dismiss countdown ────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300); // wait for exit animation
  }, [toast.id, onDismiss]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [dismiss]);

  // Pause auto-dismiss on hover
  const pauseTimer  = () => clearTimeout(timerRef.current);
  const resumeTimer = () => { timerRef.current = setTimeout(dismiss, 2000); };

  const handleClick = () => {
    if (toast.actionUrl) {
      router.push(toast.actionUrl);
    }
    dismiss();
  };

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      style={{
        transform:  leaving  ? "translateX(110%)"
                  : visible  ? "translateX(0)"
                  :            "translateX(110%)",
        opacity:    leaving  ? 0
                  : visible  ? 1
                  :            0,
        transition: "transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease",
      }}
      className="relative w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Accent bar — left edge coloured strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.accent}`} />

      {/* Progress bar — shrinks over AUTO_DISMISS_MS */}
      <div className="absolute bottom-0 left-1 right-0 h-0.5 bg-gray-100">
        <div
          ref={progressRef}
          className="h-full bg-gray-300 origin-left"
          style={{
            animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards`,
          }}
        />
      </div>

      <div className="pl-4 pr-3 py-3.5 flex items-start gap-3">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug truncate">
            {toast.title}
          </p>
          {toast.body && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {toast.body}
            </p>
          )}
          {toast.actionUrl && (
            <button
              onClick={handleClick}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Keyframe for progress bar — injected inline so no extra CSS file needed */}
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

// ── Host — renders the toast stack ────────────────────────────────────────────

export default function PushToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribePushToast((toast) => {
      setToasts((prev) => {
        // Cap visible toasts; drop oldest if over limit
        const next = [
          { ...toast, id: toast.id ?? `${Date.now()}-${Math.random()}` },
          ...prev,
        ];
        return next.slice(0, MAX_VISIBLE);
      });
    });
    return unsub;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    // Stack anchored to bottom-right, above everything
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}