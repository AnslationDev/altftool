"use client";

import dynamic from "next/dynamic";
import { createElement, useMemo } from "react";
import { loadToolModule } from "@/app/tools/toolLoaderResolver";
import { ToolModuleSkeleton } from "@/app/tools/[category]/[slug]/ToolDetailSkeleton";

/**
 * Chrome-free tool runtime for /embed/widget/[slug] iframes.
 *
 * Only this family needs a client loader: a /tools/all tool is resolved by slug
 * at runtime, so the module cannot be imported statically. /transform and
 * /exam-photo mount their one known component from the server instead.
 *
 * Render errors are caught by WidgetShell's EmbedErrorBoundary, which wraps
 * every widget family the same way.
 */
export default function EmbedToolClient({ slug }) {
  const Tool = useMemo(
    () =>
      dynamic(() => loadToolModule(slug), {
        ssr: false,
        loading: () => <ToolModuleSkeleton />,
      }),
    [slug],
  );

  return createElement(Tool);
}
