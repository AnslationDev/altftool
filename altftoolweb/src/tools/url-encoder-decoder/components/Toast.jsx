"use client";

import { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

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
      "
    >
      {message}
    </div>
  );
}
