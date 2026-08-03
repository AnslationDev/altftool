"use client";

export default function SectionHeading({
  eyebrow,
  title,
  copy,
  inverse = false,
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <p
          className={`mb-4 text-xs font-bold uppercase tracking-[0.2em] ${inverse ? "text-blue-300" : "text-blue-600"}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`text-balance text-4xl font-semibold tracking-[-0.045em] md:text-6xl ${inverse ? "text-white" : "text-slate-950"}`}
        >
          {title}
        </h2>
      </div>
      {copy && (
        <p
          className={`max-w-sm text-sm leading-6 ${inverse ? "text-slate-400" : "text-slate-500"}`}
        >
          {copy}
        </p>
      )}
    </div>
  );
}
