import { Check, FileCode2, FileText, Rocket, Sparkle } from "lucide-react";

export default function CtaBanner({ hasSpec, onExport, onPublish, published }) {
  const buttonClass =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-5 mb-2">
      <div className="rounded-2xl bg-gradient-to-r from-[var(--primary)]/10 via-[var(--card)] to-[var(--card)] border border-[var(--border)] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex items-start gap-3 flex-1">
          <span className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shrink-0">
            <Sparkle size={18} className="text-white" />
          </span>
          <div>
            <h2 className="font-bold text-[var(--foreground)]">
              Ready to build amazing API documentation?
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {hasSpec
                ? "Export your generated docs or publish a shareable link."
                : "Generate your docs above, then export or publish them from here."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            disabled={!hasSpec}
            onClick={() => onExport("markdown")}
            className={buttonClass}
          >
            <FileText size={15} /> Export as Markdown
          </button>
          <button disabled={!hasSpec} onClick={() => onExport("html")} className={buttonClass}>
            <FileCode2 size={15} /> Export as HTML
          </button>
          <button disabled={!hasSpec} onClick={() => onExport("pdf")} className={buttonClass}>
            <FileText size={15} /> Export as PDF
          </button>
          <button
            disabled={!hasSpec}
            onClick={onPublish}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {published ? <Check size={15} /> : <Rocket size={15} />}
            {published ? "Link Copied!" : "Publish Docs"}
          </button>
        </div>
      </div>
    </section>
  );
}
