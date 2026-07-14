"use client";
import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mx-auto mt-4 flex max-w-xl items-start gap-3 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/[0.08] p-4 text-sm text-(--foreground)"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
