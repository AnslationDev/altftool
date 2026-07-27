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
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-950/40 dark:hover:border-blue-500/50"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {labelFor(tool.from)}
        </span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          {labelFor(tool.to)}
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
        {tool.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {tool.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100 dark:text-blue-400">
        Open converter <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
