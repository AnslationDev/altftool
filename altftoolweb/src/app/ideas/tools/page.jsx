import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const description =
  "Free tools for evaluating a startup idea — score yours on six signals, or explore the opportunity map. No account, nothing uploaded.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free startup idea tools",
    description,
    path: "/ideas/tools",
    keywords: ["startup idea tools", "free business idea tools", "startup idea scorer"],
  });
}

/* Tools that belong to AltF Ideas, plus the platform tools a founder reaches
   for next. Cross-linking to the wider AltFTool catalogue is the point —
   no other idea site can hand you a working utility at the end. */
const OWN_TOOLS = [
  {
    href: "/ideas/tools/score-my-idea",
    name: "Score my idea",
    blurb: "Rate your own idea on the same six signals and see where it ranks against 117,264 alternatives.",
  },
  {
    href: "/ideas/map",
    name: "Opportunity map",
    blurb: "Effort against reward, plotted. Four quadrants split at the median of what is shown.",
  },
  {
    href: "/ideas/compare",
    name: "Compare ideas",
    blurb: "Up to four side by side — every signal, market figure and cost estimate in one table.",
  },
  {
    href: "/ideas/generate",
    name: "Idea generator",
    blurb: "Pick an industry and a job to replace, and get scored ideas rather than model output.",
  },
];

const PLATFORM_TOOLS = [
  { href: "/products/idea-lab", name: "AltF IdeaLab", blurb: "Evidence check on urgency, willingness to pay, and audience size." },
  { href: "/products/domainops", name: "AltF DomainOps", blurb: "Domain, DNS, email authentication and health in one pass." },
  { href: "/products/flow", name: "AltF Flow", blurb: "Wire intake, notifications and billing before writing product code." },
  { href: "/signals", name: "AltF Signals", blurb: "Trend, demand and competition research feeding into idea discovery." },
  { href: "/tools/business", name: "Business tools", blurb: "Invoicing, planning and startup utilities across the platform." },
];

export default function IdeaToolsPage() {
  return (
    <>
      <JsonLd
        id="altf-ideas-tools"
        data={[
          createCollectionPageJsonLd({ path: "/ideas/tools", name: "Startup idea tools", description }),
          createItemListJsonLd({
            path: "/ideas/tools",
            name: "Free startup idea tools",
            items: OWN_TOOLS.map((t) => ({ name: t.name, path: t.href })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Tools", path: "/ideas/tools" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Tools</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Free tools
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Tools for choosing what to build
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            No account, no credits, nothing uploaded. An idea you cannot act on is entertainment —
            these are the things that turn a shortlist into a decision.
          </p>
        </header>

        <section className="py-8">
          <h2 className="mb-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            AltF Ideas tools
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {OWN_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="afi-card flex min-h-36 flex-col gap-2 rounded-lg border border-card-border bg-card p-5"
              >
                <span className="text-[1.0625rem] font-semibold tracking-tight text-foreground">
                  {tool.name}
                </span>
                <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{tool.blurb}</p>
                <span className="mt-auto font-mono text-xs text-muted-foreground">Open →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-border py-8">
          <h2 className="mb-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            What you reach for next
          </h2>
          <ul className="flex flex-col gap-2">
            {PLATFORM_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-border-strong"
                >
                  <span className="text-[0.9375rem] font-medium text-foreground">{tool.name}</span>
                  <span className="text-[0.8125rem] text-muted-foreground">{tool.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
