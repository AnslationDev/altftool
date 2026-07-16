export default function Header() {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--border) bg-(--card) text-xs font-semibold tracking-wide mb-3">
        PRO TOOL
      </div>
      <h1 className="heading flex justify-center gap-2 animate-fade-up">
        Subtitle Timing Adjuster
      </h1>
      <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-4">
        Precision timing correction for professional SRT workflows
      </p>
    </div>
  );
}
