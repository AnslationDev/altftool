"use client";

// PushToastHost
// -------------
// Mounted once in app/layout.jsx alongside GlobalAlertHost.
// Listens for foreground push messages (via pushToastBus) and renders a
// stack of token-driven toast cards using the shared @altftool/ui primitives.

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, ExternalLink, AlertTriangle, Megaphone, Info } from "lucide-react";
import { Toast, ToastHost } from "@altftool/ui";
import { subscribePushToast } from "@/lib/pushToastBus";

const TYPE_CONFIG = {
  notice:       { tone: "info",    Icon: Bell },
  warning:      { tone: "warning", Icon: AlertTriangle },
  announcement: { tone: "info",    Icon: Megaphone },
  default:      { tone: "neutral", Icon: Info },
};

const AUTO_DISMISS_MS = 6000;
const MAX_VISIBLE     = 4;

function PushToastCard({ toast, onDismiss }) {
  const router = useRouter();
  const timerRef = useRef(null);
  const [leaving, setLeaving] = useState(false);

  const cfg = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.default;
  const Icon = cfg.Icon;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 220);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [dismiss]);

  const pauseTimer = () => clearTimeout(timerRef.current);
  const resumeTimer = () => {
    timerRef.current = setTimeout(dismiss, 2000);
  };

  const handleAction = (event) => {
    event.stopPropagation();
    if (toast.actionUrl) router.push(toast.actionUrl);
    dismiss();
  };

  const actionNode = toast.actionUrl ? (
    <button
      type="button"
      onClick={handleAction}
      className="alt-ui-toast-action"
      style={{
        alignItems: "center",
        background: "transparent",
        border: 0,
        color: "var(--anslation-ds-primary)",
        cursor: "pointer",
        display: "inline-flex",
        fontSize: 12,
        fontWeight: 650,
        gap: 4,
        marginTop: 6,
        padding: 0,
      }}
    >
      <ExternalLink style={{ height: 12, width: 12 }} />
      View
    </button>
  ) : null;

  return (
    <div onMouseEnter={pauseTimer} onMouseLeave={resumeTimer}>
      <Toast
        tone={cfg.tone}
        title={toast.title}
        message={
          <>
            {toast.body}
            {actionNode}
          </>
        }
        icon={Icon ? <Icon /> : undefined}
        leaving={leaving}
        onClose={dismiss}
      />
    </div>
  );
}

export default function PushToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribePushToast((toast) => {
      setToasts((prev) => {
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
    <ToastHost position="bottom-right">
      {toasts.map((t) => (
        <PushToastCard key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </ToastHost>
  );
}
