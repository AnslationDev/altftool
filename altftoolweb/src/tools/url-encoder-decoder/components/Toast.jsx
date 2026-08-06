"use client";

import { useEffect, useRef } from "react";

export default function Toast({ message, onClose }) {
  // Keep the latest onClose without making the dismiss timer depend on its
  // identity — the caller passes a new arrow function on every render (e.g.
  // every keystroke elsewhere on the page), which would otherwise restart
  // the 2s timer indefinitely instead of dismissing the toast.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 2000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      className="
        fixed bottom-5 right-5 z-50
        bg-(--primary)
        text-(--primary-foreground)
        px-5 py-3
        rounded-xl
        shadow-xl
        text-sm font-medium
        animate-fade-in
        motion-reduce:animate-none
      "
      role="status"
    >
      {message}
    </div>
  );
}
