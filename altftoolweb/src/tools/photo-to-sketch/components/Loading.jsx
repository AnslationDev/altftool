"use client";
import { Loader2 } from "lucide-react";

export default function Loading({ label = "Sketching your photo…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-(--primary)" aria-hidden="true" />
      <p className="text-sm font-medium text-(--muted-foreground)">{label}</p>
    </div>
  );
}
