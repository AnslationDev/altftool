import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { SECTION, TOOLS, getToolsByCategory, getToolCount } from "./_lib/manifest";
import { buildTransformHubContent } from "./_lib/transformSeoContent";
import ToolCard from "./_components/ToolCard";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";

const TRANSFORM_OG_IMAGE = "/assets/og-default.png";

export const metadata = {
  title: SECTION.title,
  description: SECTION.description,
  alternates: { canonical: "/transform" },
  openGraph: {
    title: SECTION.title,
    description: SECTION.description,
    url: "/transform",
    type: "website",
    images: [
      {
        url: TRANSFORM_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "AltFTool transform converters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SECTION.title,
    description: SECTION.description,
    images: [TRANSFORM_OG_IMAGE],
  },
};

export default function TransformIndexPage() {
  const groups = getToolsByCategory();
  const total = getToolCount();
  // Counts come from the manifest, never from a literal, so the copy and the
  // schema cannot drift as converters are added.
  const browserCount = TOOLS.filter((tool) => tool.engine === "browser").length;
  const hub = buildTransformHubContent({
    total,
    categoryCount: groups.length,
    browserCount,
  });

  return (
    <div className="[font-family:var(--font-ibm-plex-sans,inherit)]">
      <JsonLd
        id="transform-hub-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/transform",
            name: SECTION.title,
            description: hub.answer,
          }),
          createItemListJsonLd({
            path: "/transform",
            name: `${total} format and code converters on AltFTool`,
            items: TOOLS.map((tool) => ({
              name: tool.title,
              path: `/transform/${tool.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Transform", path: "/transform" },
          ]),
        ]}
      />

      {/* hero */}
      <header className="rounded-[28px] border border-(--border) bg-(--card) p-6 shadow-sm sm:p-9">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--primary-text)">
          <Wand2 className="h-4 w-4" /> Transform
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
          Format &amp; code converters
        </h1>
        {/* Answer-first: this paragraph is a correct, standalone statement
            about the section even when lifted away from the heading. */}
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-(--muted-foreground)">
          {hub.answer}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">{hub.detail}</p>
        <nav aria-label="Converter categories" className="mt-5 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.name}
              href={`#${slugifyCategory(group.name)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 motion-reduce:transition-none"
            >
              {group.name}
              <span className="rounded-full bg-(--muted) px-1.5 text-[10px] text-(--foreground)">
                {group.count}
              </span>
            </a>
          ))}
        </nav>
      </header>

      {/* category sections */}
      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <section
            key={group.name}
            id={slugifyCategory(group.name)}
            aria-labelledby={`${slugifyCategory(group.name)}-heading`}
            className="scroll-mt-24"
          >
            <div className="flex items-baseline justify-between">
              <h2
                id={`${slugifyCategory(group.name)}-heading`}
                className="text-xl font-bold text-(--foreground)"
              >
                {group.name} converters
              </h2>
              <span className="text-sm font-medium text-(--muted-foreground)">
                {group.count} {group.count === 1 ? "tool" : "tools"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 flex items-center justify-center gap-2 text-sm text-(--muted-foreground)">
        <Link
          href="/tools/all"
          className="inline-flex items-center gap-1 rounded-[6px] font-semibold text-(--primary-text) hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
        >
          Explore all AltFTool tools <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </div>
  );
}

function slugifyCategory(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
