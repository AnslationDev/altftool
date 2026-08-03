"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

export default function SaveButton({ label = "Save" }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={(event) => {
        event.stopPropagation();
        setSaved((value) => !value);
      }}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold transition ${saved ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white/95 text-slate-700 hover:border-slate-400"}`}
    >
      <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />{" "}
      {saved ? "Saved" : label}
    </button>
  );
}
