"use client";

export default function RankMetric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
