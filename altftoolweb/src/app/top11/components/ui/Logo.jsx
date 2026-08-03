"use client";

export default function Logo({ inverse = false }) {
  return (
    <span
      className={`inline-flex items-baseline text-xl font-extrabold tracking-[-0.065em] ${inverse ? "text-white" : "text-slate-950"}`}
    >
      TOP<span className="ml-0.5 text-blue-500">11</span>
    </span>
  );
}
