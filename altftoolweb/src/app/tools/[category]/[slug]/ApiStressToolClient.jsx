"use client";

import dynamic from "next/dynamic";
import ToolDetailChrome from "./ToolDetailChrome";

const ApiStressTool = dynamic(() => import("@/tools/api-stress-estimator/entry"), {
  loading: () => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      Loading API stress estimator...
    </div>
  ),
  ssr: false,
});

// `seoContent` mirrors ToolClient: it lets the caller pass the SEO section in
// so ToolDetailChrome renders it inside <main>, rather than leaving it a
// sibling outside the landmark that answer-engine fetchers read first.
export default function ApiStressToolClient({ category = "all", children }) {
  return (
    <ToolDetailChrome
      slug="api-stress-estimator"
      category={category}
      seoContent={children}
    >
      <ApiStressTool />
    </ToolDetailChrome>
  );
}
