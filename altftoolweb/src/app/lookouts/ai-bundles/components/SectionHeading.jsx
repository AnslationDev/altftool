/** Shared eyebrow/title/subtitle block used by every landing-page section. */
export default function SectionHeading({ eyebrow, title, subtitle, align = "center", className = "" }) {
  const alignment = align === "left" ? "text-left items-start" : "text-center items-center mx-auto";

  return (
    <div className={`flex max-w-2xl flex-col ${alignment} ${className}`}>
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
