import Link from "next/link";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { getToolCategories, slugifyRouteSegment } from "./toolRouteUtils";

/**
 * Server-rendered directory of tool links for the hub pages (/tools, /tools/all,
 * /tools/<category>). The tool grid (ToolsClient / MicrotoolClient) is a client
 * component, so this guarantees crawlable <a href="/tools/all/<slug>"> links exist
 * in the raw HTML before hydration — closing the main crawl-discovery path to tools.
 */
export default function ToolHubLinks({ category = "all" }) {
  const wantCategory = slugifyRouteSegment(category);

  const tools = Object.entries(toolMetaMap)
    .filter(([, tool]) => {
      if (!wantCategory || wantCategory === "all") return true;
      return getToolCategories(tool)
        .map(slugifyRouteSegment)
        .includes(wantCategory);
    })
    .map(([slug, tool]) => ({ slug, name: tool.name || slug }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (tools.length === 0) return null;

  const heading =
    !wantCategory || wantCategory === "all"
      ? "All tools (A–Z)"
      : "Tools in this category";

  return (
    <nav
      aria-label="Tool directory"
      className="mx-auto w-full max-w-6xl px-4 py-10 text-(--foreground)"
    >
      <h2 className="text-lg font-semibold">{heading}</h2>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/tools/all/${tool.slug}`}
              className="text-sm text-(--muted-foreground) hover:text-(--foreground) hover:underline"
            >
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
