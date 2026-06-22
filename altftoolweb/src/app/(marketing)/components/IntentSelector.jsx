"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Bot,
  FileUp,
  GraduationCap,
  WandSparkles,
} from "lucide-react";

const workflows = [
  {
    icon: WandSparkles,
    title: "Create",
    description: "Generate assets, documents, captions, and everyday outputs.",
    href: "/tools/all",
    size: "lg:col-span-2",
    stats: ["AI prompts", "Templates", "Exports"],
    tone: "home-icon-violet",
  },
  {
    icon: FileUp,
    title: "Convert",
    description: "Switch PDFs, images, text, code, and files into the format you need.",
    href: "/tools/all",
    stats: ["PDF", "Images", "Text"],
    tone: "home-icon-cyan",
  },
  {
    icon: BarChart3,
    title: "Analyze",
    description: "Review content, data, links, rankings, and quality signals faster.",
    href: "/tools/all",
    stats: ["Signals", "Scores", "Reports"],
    tone: "home-icon-emerald",
  },
  {
    icon: Bot,
    title: "Automate",
    description: "Use utilities and extensions to reduce repetitive browser work.",
    href: "/extensions",
    stats: ["Extensions", "Rules", "Shortcuts"],
    tone: "home-icon-indigo",
  },
  {
    icon: BadgePercent,
    title: "Discover Deals",
    description: "Find useful offers, store pages, and buying signals in one place.",
    href: "/exclusivedeals",
    stats: ["Offers", "Stores", "Ratings"],
    tone: "home-icon-rose",
  },
  {
    icon: GraduationCap,
    title: "Learn",
    description: "Explore academy guides, blogs, news, and brand research.",
    href: "/academy",
    stats: ["Guides", "News", "Academy"],
    size: "lg:col-span-3",
    tone: "home-icon-amber",
  },
];

export default function IntentSelector() {
  return (
    <section className="section">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="home-kicker">Workflows</p>
          <h2 className="section-title text-left">
            Start With The Workflow You Need
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)] md:text-right">
          AltFTool groups daily work into practical routes so you can move from
          search to result without hunting through menus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.map(({ icon: Icon, title, description, href, size = "", stats, tone }) => (
          <Link
            key={title}
            href={href}
            className={`group relative overflow-hidden rounded-2xl border border-[var(--home-border)] bg-white p-5 shadow-[var(--home-shadow-sm)] transition hover:-translate-y-1.5 hover:border-[var(--primary)] hover:bg-[var(--home-hover)] hover:shadow-[var(--home-shadow-md)] ${size}`}
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--home-primary-soft)] transition group-hover:scale-125" />
            <div className="relative z-10 flex items-start gap-4">
              <span className={`home-premium-icon ${tone} grid h-14 w-14 shrink-0 place-items-center rounded-xl`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
                  {title}
                  <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                  {description}
                </span>
              </span>
            </div>
            <div className="relative z-10 mt-5 rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface)] p-3">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span className="h-2 w-2 rounded-full bg-[#D8CFFF]" />
              </div>
              <div className="grid gap-2">
                {stats.map((item, index) => (
                  <span
                    key={item}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-bold text-[var(--foreground)] shadow-sm"
                  >
                    {item}
                    <span
                      className={`h-1.5 rounded-full ${
                        index === 1 ? "w-16 bg-[var(--accent)]" : "w-10 bg-[var(--primary)]"
                      }`}
                    />
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
