"use client";

import { RotateCcw } from "lucide-react";

export default function ResetButton({ onReset, label = "Reset to Defaults" }) {
  const handleClick = () => {
    if (!confirm("This will reset all data for this section to factory defaults. Are you sure?")) return;
    onReset();
  };

  return (
    <button onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
      <RotateCcw className="h-4 w-4" /> {label}
    </button>
  );
}
