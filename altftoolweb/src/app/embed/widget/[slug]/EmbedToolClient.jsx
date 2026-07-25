"use client";

import dynamic from "next/dynamic";
import { Component, createElement, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { loadToolModule } from "@/app/tools/toolLoaderResolver";
import { ToolModuleSkeleton } from "@/app/tools/[category]/[slug]/ToolDetailSkeleton";

class EmbedErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="m-4 flex items-center gap-3 rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm text-(--foreground)"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-(--warning)" aria-hidden="true" />
          <p>
            This widget hit a snag.{" "}
            <a
              href={this.props.fallbackHref}
              target="_top"
              className="font-semibold text-(--primary-text) underline underline-offset-2"
            >
              Open the full tool on AltFTool
            </a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Chrome-free tool runtime for /embed/[slug] iframes. */
export default function EmbedToolClient({ slug, fallbackHref }) {
  const Tool = useMemo(
    () =>
      dynamic(() => loadToolModule(slug), {
        ssr: false,
        loading: () => <ToolModuleSkeleton />,
      }),
    [slug],
  );

  return (
    <EmbedErrorBoundary fallbackHref={fallbackHref}>
      {createElement(Tool)}
    </EmbedErrorBoundary>
  );
}
