import Link from "next/link";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import Icon from "@/shared/ui/Icon";
import { buildToolSeoContent } from "./toolSeoContent";
import { formatCategoryLabel, getToolCategories } from "./toolRouteUtils";

function getRelatedTools(slug, tool, limit = 6) {
  if (!tool) return [];

  const currentCategories = getToolCategories(tool).map((item) => String(item).toLowerCase());
  const currentWords = new Set(
    `${slug} ${tool.name || ""} ${tool.description || ""}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2)
  );

  return Object.entries(toolMetaMap)
    .filter(([candidateSlug]) => candidateSlug !== slug)
    .map(([candidateSlug, candidate]) => {
      const candidateCategories = getToolCategories(candidate).map((item) => String(item).toLowerCase());
      const categoryScore = candidateCategories.filter((item) => currentCategories.includes(item)).length * 12;
      const candidateWords = `${candidateSlug} ${candidate.name || ""} ${candidate.description || ""}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2);
      const wordScore = candidateWords.reduce((score, word) => score + (currentWords.has(word) ? 2 : 0), 0);

      return {
        slug: candidateSlug,
        tool: candidate,
        score: categoryScore + wordScore,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || String(a.tool.name || a.slug).localeCompare(String(b.tool.name || b.slug)))
    .slice(0, limit);
}

export function ToolSeoContentServer({ slug, tool }) {
  const seoContent = tool ? buildToolSeoContent(slug, tool) : null;
  if (!seoContent) return null;

  return (
    <section className="mx-auto mt-8 w-full max-w-6xl border-y border-(--border) py-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-(--primary)">Workflow Guide</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-(--foreground) md:text-3xl">
            {seoContent.name} Online Workspace
          </h1>
          <p className="text-sm leading-relaxed text-(--muted-foreground)">{seoContent.summary}</p>
          
          {seoContent.benefits && seoContent.benefits.length > 0 && (
            <div className="pt-4 border-t border-(--border)">
              <h3 className="text-sm font-semibold text-(--foreground) mb-2">Key Benefits</h3>
              <ul className="space-y-2">
                {seoContent.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs leading-5 text-(--muted-foreground)">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary)" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">Use Cases</h3>
            <div className="mt-3 space-y-4">
              {seoContent.examples.map((example) => (
                <div key={example.title} className="border-l-2 border-(--primary) pl-3">
                  <h4 className="text-xs font-bold text-(--foreground)">{example.title}</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-(--muted-foreground)">{example.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">How To Use</h3>
            <ol className="mt-3 space-y-3">
              {seoContent.steps.map((step, index) => (
                <li key={step} className="flex gap-2.5 text-xs leading-relaxed text-(--muted-foreground)">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-[11px] font-bold text-(--foreground)">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">Frequently Asked Questions</h3>
            <div className="mt-3 space-y-4">
              {seoContent.faqs.map((faq) => (
                <div key={faq.question} className="space-y-1">
                  <h4 className="text-xs font-bold leading-normal text-(--foreground)">{faq.question}</h4>
                  <p className="text-[11px] leading-relaxed text-(--muted-foreground)">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RelatedToolsServer({ slug, tool }) {
  const relatedTools = getRelatedTools(slug, tool);
  if (!relatedTools.length) return null;

  return (
    <section className="mx-auto mt-8 w-full max-w-6xl">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--primary)">Explore More</p>
          <h2 className="text-lg font-semibold text-(--foreground)">Related Tools & Utilities</h2>
        </div>
        <Link href="/tools/all" className="rounded-[6px] text-sm font-semibold text-(--muted-foreground) transition-colors duration-150 hover:text-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35">
          Explore all tools
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {relatedTools.map(({ slug: relatedSlug, tool: relatedTool }) => (
          <Link
            key={relatedSlug}
            href={`/tools/all/${relatedSlug}`}
            className="group flex min-h-[112px] flex-col justify-between rounded-[8px] border border-(--border) bg-(--background) p-3 transition duration-200 hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-md motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-(--muted) transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none">
                <Icon
                  name={relatedTool.icon ?? "wrench"}
                  className={`h-5 w-5 ${relatedTool.iconColor ?? "text-(--muted-foreground)"}`}
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-(--foreground) group-hover:text-(--primary)">
                  {relatedTool.name || formatCategoryLabel(relatedSlug)}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
                  {relatedTool.description || "Open a nearby utility for this workflow."}
                </p>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--muted-foreground) transition-colors duration-150 group-hover:text-(--primary)">
              Open <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
