"use client";

// Live tool runtime for /alternatives/[incumbent].
//
// Modelled on src/app/embed/widget/[slug]/EmbedToolClient.jsx, with one
// deliberate difference: the tool is rendered as a React component in the host
// document rather than inside an iframe. An iframe's contents are a separate
// document and are not indexed as part of this page, which would defeat the
// point of putting a working tool on a comparison page.

import dynamic from "next/dynamic";
import { Component, createElement, useMemo } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { loadToolModule } from "@/app/tools/toolLoaderResolver";
import { ToolModuleSkeleton } from "@/app/tools/[category]/[slug]/ToolDetailSkeleton";

class AlternativeToolErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--foreground)"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-(--warning)"
            aria-hidden="true"
          />
          <p>
            {`This tool didn't load here. `}
            <Link
              href={this.props.fallbackHref}
              className="font-semibold text-(--primary-text) underline underline-offset-2"
            >
              {`Open ${this.props.toolName} on its own page`}
            </Link>
            {` — same tool, same browser-side processing.`}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * @param {object} props
 * @param {string} props.slug        Tool slug, verified against toolRuntimeMap.
 * @param {string} props.toolName    Human name, used in the fallback copy.
 * @param {string} props.fallbackHref Canonical /tools/all/{slug} page.
 */
export default function AlternativeToolEmbed({ slug, toolName, fallbackHref }) {
  const Tool = useMemo(
    () =>
      dynamic(() => loadToolModule(slug), {
        ssr: false,
        loading: () => <ToolModuleSkeleton />,
      }),
    [slug],
  );

  return (
    <AlternativeToolErrorBoundary fallbackHref={fallbackHref} toolName={toolName}>
      {createElement(Tool)}
    </AlternativeToolErrorBoundary>
  );
}
