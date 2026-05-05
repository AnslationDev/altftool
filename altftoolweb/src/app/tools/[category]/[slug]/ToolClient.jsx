"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { loadToolModule } from "../../toolLoaderResolver";
import ToolDetailChrome from "./ToolDetailChrome";
import { ToolModuleSkeleton } from "./ToolDetailSkeleton";

export default function ToolClient({ slug, category = "all" }) {
  const Tool = useMemo(
    () =>
      dynamic(() => loadToolModule(slug), {
        ssr: false,
        loading: () => <ToolModuleSkeleton />,
      }),
    [slug],
  );

  return (
    <ToolDetailChrome slug={slug} category={category}>
      <Tool />
    </ToolDetailChrome>
  );
}
