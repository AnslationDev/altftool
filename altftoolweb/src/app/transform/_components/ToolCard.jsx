import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { labelFor } from "../_lib/formats";

/**
 * A single converter card on the index grid. Server component (no client JS).
 * @param {{ tool: import("../_lib/manifest.js").ToolMeta }} props
 */
export default function ToolCard({ tool }) {
  return (
    <Link
      href={`/transform/${tool.slug}`}
      className="group flex flex-col rounded-[12px] border border-(--border) bg-(--card) p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
        <span className="rounded-md bg-(--muted) px-2 py-0.5 text-(--foreground)">
          {labelFor(tool.from)}
        </span>
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="rounded-md bg-(--muted) px-2 py-0.5 text-(--primary-text)">
          {labelFor(tool.to)}
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-(--foreground) group-hover:text-(--primary-text)">
        {tool.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-(--muted-foreground)">
        {tool.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-(--primary-text) opacity-0 transition group-hover:opacity-100 motion-reduce:transition-none">
        Open converter <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
