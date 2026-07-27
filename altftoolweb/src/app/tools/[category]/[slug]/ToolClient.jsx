"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, createElement, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Home,
  RefreshCcw,
  Search,
  Wrench,
} from "lucide-react";
import { loadToolModule } from "../../toolLoaderResolver";
import ToolDetailChrome from "./ToolDetailChrome";
import { ToolModuleSkeleton } from "./ToolDetailSkeleton";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import Icon from "@/shared/ui/Icon";
import { safeCopyText } from "@/shared/utils/clipboard";
import { formatCategoryLabel, getToolCategories } from "../../toolRouteUtils";

function getRecoveryRelatedTools(slug, limit = 4) {
  const tool = toolMetaMap[slug];
  if (!tool) return [];

  const currentCategories = getToolCategories(tool).map((item) => String(item).toLowerCase());
  const currentWords = new Set(
    `${slug} ${tool.name || ""} ${tool.description || ""}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2),
  );

  return Object.entries(toolMetaMap)
    .filter(([candidateSlug]) => candidateSlug !== slug)
    .map(([candidateSlug, candidate]) => {
      const candidateCategories = getToolCategories(candidate).map((item) => String(item).toLowerCase());
      const categoryScore = candidateCategories.filter((item) => currentCategories.includes(item)).length * 12;
      const wordScore = `${candidateSlug} ${candidate.name || ""} ${candidate.description || ""}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
        .reduce((score, word) => score + (currentWords.has(word) ? 2 : 0), 0);

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

function getErrorMessage(error) {
  if (!error) return "Unknown runtime error";
  return String(error.message || error.name || error).replace(/\s+/g, " ").slice(0, 220);
}

function canRunCrashProbe() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function shouldCrashForLocalQa() {
  if (!canRunCrashProbe()) return false;
  return new URLSearchParams(window.location.search).get("altftool_crash") === "1";
}

function LocalCrashProbe({ slug }) {
  if (shouldCrashForLocalQa()) {
    throw new Error(`Local QA crash probe for ${slug}`);
  }

  return null;
}

function ToolRecoveryAction({ children, icon: IconComponent, onClick, href, copied = false, variant = "default" }) {
  const classes =
    variant === "primary"
      ? "border-(--primary) bg-(--primary) text-white hover:opacity-90"
      : "border-(--border) bg-(--card) text-(--foreground) hover:border-(--primary) hover:text-(--primary)";

  const content = (
    <>
      {copied ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <IconComponent className="h-4 w-4 shrink-0" />}
      <span className="truncate">{children}</span>
    </>
  );

  const baseClasses =
    "inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[7px] border px-3 text-sm font-semibold transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none motion-reduce:transition-none";

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${classes}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${classes}`}
    >
      {content}
    </button>
  );
}

function ToolRuntimeRecoveryFallback({ slug, category, error, retryCount, onRetry, onCopyDiagnostics, diagnosticsCopied }) {
  const tool = toolMetaMap[slug];
  const toolName = tool?.name || formatCategoryLabel(slug);
  const categoryHref = category === "all" ? "/tools/all" : `/tools/${category}`;
  const relatedTools = getRecoveryRelatedTools(slug);
  const errorMessage = getErrorMessage(error);

  return (
    <section
      role="alert"
      data-testid="tool-runtime-recovery"
      className="mx-auto w-full max-w-5xl rounded-[8px] border border-red-500/20 bg-red-500/10 p-4 text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-red-500/20 bg-(--background) text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">Workspace recovery</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-(--foreground)">
              {toolName} needs a quick reload
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              The route shell is still stable. Retry the workspace, open another nearby tool, or copy a small
              diagnostic summary for debugging.
            </p>
          </div>
        </div>

        <span className="inline-flex h-8 shrink-0 items-center rounded-[7px] border border-red-500/20 bg-(--background) px-2.5 text-xs font-bold text-red-600">
          Attempt {retryCount + 1}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.82fr]">
        <div className="rounded-[8px] border border-(--border) bg-(--background) p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">What failed</p>
          <p className="mt-2 break-words font-mono text-xs leading-5 text-(--foreground)" data-testid="tool-runtime-error-message">
            {errorMessage}
          </p>
        </div>

        <div className="rounded-[8px] border border-(--border) bg-(--background) p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Recovery commands</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            <ToolRecoveryAction icon={RefreshCcw} onClick={onRetry} variant="primary">
              Retry workspace
            </ToolRecoveryAction>
            <ToolRecoveryAction icon={diagnosticsCopied ? CheckCircle2 : Copy} onClick={onCopyDiagnostics} copied={diagnosticsCopied}>
              {diagnosticsCopied ? "Copied" : "Copy details"}
            </ToolRecoveryAction>
            <ToolRecoveryAction icon={Search} href="/tools/all">
              Browse tools
            </ToolRecoveryAction>
            <ToolRecoveryAction icon={Home} href={categoryHref}>
              Open category
            </ToolRecoveryAction>
          </div>
        </div>
      </div>

      {relatedTools.length ? (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Try a nearby tool</p>
              <h3 className="text-sm font-semibold text-(--foreground)">Keep the workflow moving</h3>
            </div>
            <Wrench className="h-4 w-4 shrink-0 text-(--muted-foreground)" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {relatedTools.map(({ slug: relatedSlug, tool: relatedTool }) => (
              <Link
                key={relatedSlug}
                href={`/tools/all/${relatedSlug}`}
                className="group flex min-h-[112px] flex-col justify-between rounded-[8px] border border-(--border) bg-(--background) p-3 transition duration-200 hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-(--muted) transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                    <Icon
                      name={relatedTool.icon ?? "wrench"}
                      className={`h-5 w-5 ${relatedTool.iconColor ?? "text-(--muted-foreground)"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-(--foreground) group-hover:text-(--primary)">
                      {relatedTool.name || formatCategoryLabel(relatedSlug)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
                      {relatedTool.description || "Open a nearby utility for this workflow."}
                    </p>
                  </div>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--muted-foreground) transition-colors duration-150 group-hover:text-(--primary) motion-reduce:transition-none">
                  Open <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

class ToolRuntimeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { diagnosticsCopied: false, error: null, resetKey: 0, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    const digest = {
      message: getErrorMessage(error),
      slug: this.props.slug,
      category: this.props.category,
      componentStack: info?.componentStack?.split("\n").slice(0, 4).join("\n") || "",
    };

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("altftool:tool-runtime-error", { detail: digest }));
    }
  }

  componentDidUpdate(previousProps) {
    if (previousProps.slug !== this.props.slug && this.state.error) {
      this.setState({ diagnosticsCopied: false, error: null, resetKey: 0, retryCount: 0 });
    }
  }

  reset = () => {
    if (canRunCrashProbe() && new URLSearchParams(window.location.search).has("altftool_crash")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("altftool_crash");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    this.setState((state) => ({
      diagnosticsCopied: false,
      error: null,
      resetKey: state.resetKey + 1,
      retryCount: state.retryCount + 1,
    }));
  };

  copyDiagnostics = async () => {
    const diagnostic = {
      category: this.props.category,
      error: getErrorMessage(this.state.error),
      retryCount: this.state.retryCount,
      slug: this.props.slug,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.pathname : "",
    };
    const copied = await safeCopyText(JSON.stringify(diagnostic, null, 2));

    if (copied) {
      this.setState({ diagnosticsCopied: true });
      window.setTimeout(() => this.setState({ diagnosticsCopied: false }), 1400);
    }
  };

  render() {
    if (this.state.error) {
      return (
        <ToolRuntimeRecoveryFallback
          slug={this.props.slug}
          category={this.props.category}
          error={this.state.error}
          retryCount={this.state.retryCount}
          onRetry={this.reset}
          onCopyDiagnostics={this.copyDiagnostics}
          diagnosticsCopied={this.state.diagnosticsCopied}
        />
      );
    }

    return (
      <div key={this.state.resetKey}>
        <LocalCrashProbe slug={this.props.slug} />
        {this.props.children}
      </div>
    );
  }
}

export default function ToolClient({ slug, category = "all", children }) {
  const Tool = useMemo(
    () =>
      dynamic(() => loadToolModule(slug), {
        ssr: false,
        loading: () => <ToolModuleSkeleton />,
      }),
    [slug],
  );

  return (
    <ToolDetailChrome slug={slug} category={category} seoContent={children}>
      <ToolRuntimeBoundary slug={slug} category={category}>
        {createElement(Tool, { category, slug })}
      </ToolRuntimeBoundary>
    </ToolDetailChrome>
  );
}
