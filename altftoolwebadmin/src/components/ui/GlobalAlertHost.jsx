"use client";

import { useEffect, useRef, useState } from "react";
import { Toast, ToastHost } from "@altftool/ui";
import { subscribeAlert } from "@/lib/alertBus";

const TONE_BY_TYPE = {
  success: "success",
  error: "danger",
  danger: "danger",
  warning: "warning",
  info: "info",
};

const AUTO_DISMISS_MS = 4000;

export default function GlobalAlertHost() {
  const [alert, setAlert] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeAlert((data) => {
      clearTimeout(timerRef.current);
      clearTimeout(leaveTimerRef.current);
      setLeaving(false);
      setAlert({ ...data, id: `${Date.now()}-${Math.random()}` });
      timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    });

    return () => {
      unsub();
      clearTimeout(timerRef.current);
      clearTimeout(leaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setLeaving(true);
    leaveTimerRef.current = setTimeout(() => {
      setAlert(null);
      setLeaving(false);
    }, 220);
  }

  if (!alert) return null;

  const tone = TONE_BY_TYPE[alert.type] ?? "info";

  return (
    <ToastHost position="top-right">
      <Toast
        key={alert.id}
        tone={tone}
        title={alert.title}
        message={alert.message}
        leaving={leaving}
        onClose={dismiss}
      />
    </ToastHost>
  );
}
