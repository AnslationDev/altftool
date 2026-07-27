import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { SECTION, getToolsByCategory, getToolCount } from "./_lib/manifest";
import ToolCard from "./_components/ToolCard";

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

  return (
    <div className="[font-family:var(--font-ibm-plex-sans,inherit)]">
      {/* hero */}
      <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          <Wand2 className="h-4 w-4" /> Transform
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Format &amp; code converters
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
          {SECTION.description} {total} converters across {groups.length} categories — most run entirely in your
          browser.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.name}
              href={`#${slugifyCategory(group.name)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-blue-500/50"
            >
              {group.name}
              <span className="rounded-full bg-slate-200 px-1.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {group.count}
              </span>
            </a>
          ))}
        </div>
      </header>

      {/* category sections */}
      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <section key={group.name} id={slugifyCategory(group.name)} className="scroll-mt-24">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{group.name}</h2>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
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

      <footer className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-400 dark:text-slate-500">
        <Link href="/tools/all" className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400">
          Explore all AltFTool tools <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </div>
  );
}

function slugifyCategory(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
