"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronRight, Copy, RotateCcw, Share2, ShieldCheck } from "lucide-react";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { formatCategoryLabel, getToolCategories } from "../../toolRouteUtils";
import { useToolAds } from "@/ads/AdsProvider";
import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";
import Icon from "@/shared/ui/Icon";
import { buildToolSeoContent } from "../../toolSeoContent";
import { rememberRecentTool } from "../../toolStorage";
import { safeCopyText } from "@/shared/utils/clipboard";

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

function RelatedTools({ slug, tool }) {
  const relatedTools = getRelatedTools(slug, tool);
  if (!relatedTools.length) return null;

  return (
    <section className="mx-auto mt-8 w-full max-w-6xl">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--primary)">Continue faster</p>
          <h2 className="text-lg font-semibold text-(--foreground)">Related tools</h2>
        </div>
        <Link href="/tools/all" className="text-sm font-semibold text-(--muted-foreground) hover:text-(--primary)">
          Explore all tools
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {relatedTools.map(({ slug: relatedSlug, tool: relatedTool }) => (
          <Link
            key={relatedSlug}
            href={`/tools/all/${relatedSlug}`}
            className="group flex min-h-[112px] flex-col justify-between rounded-[8px] border border-(--border) bg-(--background) p-3 transition hover:border-(--primary) hover:shadow-sm"
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-(--muted)">
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
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--muted-foreground) group-hover:text-(--primary)">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ToolSeoContent({ slug, tool }) {
  if (!tool) return null;

  const seoContent = buildToolSeoContent(slug, tool);

  return (
    <section className="mx-auto mt-8 w-full max-w-6xl border-y border-(--border) py-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--primary)">Workflow guide</p>
          <h2 className="mt-1 text-xl font-semibold text-(--foreground)">{seoContent.heading}</h2>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">{seoContent.summary}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">Use cases</h3>
            <div className="mt-3 space-y-3">
              {seoContent.examples.map((example) => (
                <div key={example.title} className="border-l border-(--border) pl-3">
                  <p className="text-sm font-semibold text-(--foreground)">{example.title}</p>
                  <p className="mt-1 text-xs leading-5 text-(--muted-foreground)">{example.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">Quick workflow</h3>
            <ol className="mt-3 space-y-3">
              {seoContent.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-xs leading-5 text-(--muted-foreground)">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-[11px] font-bold text-(--foreground)">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">FAQ</h3>
            <div className="mt-3 space-y-3">
              {seoContent.faqs.map((faq) => (
                <div key={faq.question}>
                  <p className="text-xs font-semibold leading-5 text-(--foreground)">{faq.question}</p>
                  <p className="mt-1 text-xs leading-5 text-(--muted-foreground)">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolActionButton({ children, icon: IconComponent, onClick, title, tone = "default", ...props }) {
  const tones = {
    default:
      "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary) hover:text-(--primary)",
    primary:
      "border-(--primary) bg-(--primary) text-white hover:border-(--primary) hover:opacity-90",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[7px] border px-3 text-sm font-semibold transition ${tones[tone] || tones.default}`}
      {...props}
    >
      <IconComponent className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

function ToolActionBar({ slug, tool, toolName, toolCategories, onResetWorkspace }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const isPriorityTool = TOP_PRIORITY_TOOL_SLUGS.includes(slug);
  const primaryCategory = toolCategories[0] || "Tool";
  const canonicalPath = `/tools/all/${slug}`;
  const actionSummary = useMemo(() => {
    const label = tool?.description || `${toolName} on AltFTool`;
    return String(label).replace(/\s+/g, " ").trim();
  }, [tool?.description, toolName]);

  useEffect(() => {
    setCopied(false);
    setShared(false);
  }, [slug]);

  async function handleCopyLink() {
    const href = new URL(canonicalPath, window.location.origin).toString();
    const ok = await safeCopyText(href);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1400);
  }

  async function handleShare() {
    const href = new URL(canonicalPath, window.location.origin).toString();

    if (navigator?.share) {
      try {
        await navigator.share({
          title: toolName,
          text: actionSummary,
          url: href,
        });
        setShared(true);
        window.setTimeout(() => setShared(false), 1400);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    const ok = await safeCopyText(href);
    setShared(ok);
    if (ok) window.setTimeout(() => setShared(false), 1400);
  }

  return (
    <section
      aria-label="Tool actions"
      data-testid="tool-action-bar"
      className="mx-auto mb-4 w-full max-w-5xl rounded-[8px] border border-(--border) bg-(--card) px-3 py-3 shadow-[var(--anslation-ds-shadow-sm)]"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {isPriorityTool && (
            <span
              data-testid="priority-tool-badge"
              className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Top 40 verified
            </span>
          )}
          <span className="inline-flex h-8 items-center rounded-[7px] border border-(--border) bg-(--background) px-2.5 text-xs font-semibold text-(--muted-foreground)">
            {primaryCategory}
          </span>
          <span className="hidden min-w-0 truncate text-xs font-medium text-(--muted-foreground) lg:block">
            {canonicalPath}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <ToolActionButton
            icon={copied ? Check : Copy}
            onClick={handleCopyLink}
            title="Copy tool link"
            data-testid="copy-tool-link"
          >
            {copied ? "Copied" : "Copy link"}
          </ToolActionButton>
          <ToolActionButton
            icon={shared ? Check : Share2}
            onClick={handleShare}
            title="Share tool"
            data-testid="share-tool-link"
          >
            {shared ? "Shared" : "Share"}
          </ToolActionButton>
          <ToolActionButton
            icon={RotateCcw}
            onClick={onResetWorkspace}
            title="Reset workspace"
            data-testid="reset-tool-workspace"
            tone="primary"
          >
            Reset
          </ToolActionButton>
        </div>
      </div>
    </section>
  );
}

export default function ToolDetailChrome({ slug, category = "all", children }) {
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const tool = toolMetaMap[slug];
  const toolCategories = getToolCategories(tool);
  const categoryLabel = formatCategoryLabel(category);
  const categoryHref = category === "all" ? "/tools/all" : `/tools/${category}`;
  const toolName = tool?.name || formatCategoryLabel(slug);

  const leftAd = useToolAds({
    placement: "tool_detail_left",
    toolSlug: slug,
    toolCategories,
  })[0];

  const rightAd = useToolAds({
    placement: "tool_detail_right",
    toolSlug: slug,
    toolCategories,
  })[0];

  const bottomAd = useToolAds({
    placement: "tool_detail_bottom",
    toolSlug: slug,
    toolCategories,
  })[0];

  useEffect(() => {
    rememberRecentTool(slug, toolMetaMap);
  }, [slug]);

  useEffect(() => {
    setWorkspaceKey(0);
  }, [slug]);

  function handleResetWorkspace() {
    setWorkspaceKey((key) => key + 1);
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full gap-6 lg:gap-8">
        <div className="sticky top-24 hidden h-fit w-[250px] shrink-0 xl:flex">
          <AdSidebar ad={leftAd?.content} />
        </div>

        <main className="min-w-0 flex-1">
          <nav
            aria-label="Tool route"
            className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center gap-2 text-xs font-medium text-(--muted-foreground)"
          >
            <Link href="/tools/all" className="hover:text-(--primary)">
              Tools
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={categoryHref} className="hover:text-(--primary)">
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-(--foreground)">{toolName}</span>
          </nav>

          <ToolActionBar
            slug={slug}
            tool={tool}
            toolName={toolName}
            toolCategories={toolCategories}
            onResetWorkspace={handleResetWorkspace}
          />

          <div className="mx-auto w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain" key={workspaceKey}>
            {children}
          </div>

          <ToolSeoContent slug={slug} tool={tool} />

          <RelatedTools slug={slug} tool={tool} />

          {bottomAd?.content && (
            <div className="mt-8">
              <AdBottomBanner ad={bottomAd.content} />
            </div>
          )}
        </main>

        <div className="sticky top-24 hidden h-fit w-[250px] shrink-0 xl:flex">
          <AdSidebar ad={rightAd?.content} />
        </div>
      </div>
    </div>
  );
}
