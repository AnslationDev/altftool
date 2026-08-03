"use client";

export default function FilterButton({
  children,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}
    >
      {children}
    </button>
  );
}
