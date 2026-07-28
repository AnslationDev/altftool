import { ArrowRight, BookOpenText, ListChecks, MessageCircleQuestion, Wrench } from "lucide-react";

function getFlowItems({ hasTools, hasFaqs, hasRelatedPosts }) {
  return [
    {
      href: "#article-overview",
      label: "Summary",
      detail: "Start with the key points",
      icon: ListChecks,
    },
    {
      href: "#article-body",
      label: "Read",
      detail: "Follow the full guide",
      icon: BookOpenText,
    },
    {
      href: hasTools ? "#related-tools" : hasFaqs ? "#faq" : "#article-body",
      label: hasTools ? "Use tools" : hasFaqs ? "Check FAQ" : "Review",
      detail: hasTools ? "Open matched microtools" : hasFaqs ? "Jump to quick answers" : "Scan guide details",
      icon: hasTools ? Wrench : hasFaqs ? MessageCircleQuestion : BookOpenText,
    },
    {
      href: hasRelatedPosts ? "#related-posts" : "/blogs",
      label: "Continue",
      detail: hasRelatedPosts ? "Read the next guide" : "Browse more guides",
      icon: ArrowRight,
    },
  ];
}

export default function BlogFlowNav({
  relatedTools = [],
  faqItems = [],
  relatedPosts = [],
}) {
  const items = getFlowItems({
    hasTools: relatedTools.length > 0,
    hasFaqs: faqItems.length > 0,
    hasRelatedPosts: relatedPosts.length > 0,
  });

  return (
    <nav
      aria-label="Article reading flow"
      className="mt-4 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-2 shadow-[var(--anslation-ds-shadow-sm)] sm:mt-5"
    >
      <div className="-mx-2 flex snap-x gap-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className="group flex min-h-[68px] w-[78%] shrink-0 snap-start items-center gap-3 rounded-[6px] px-3 py-2 transition hover:bg-(--muted) min-[460px]:w-[44%] sm:w-auto sm:shrink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary) transition group-hover:bg-(--primary) group-hover:text-(--primary-foreground)">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold text-(--foreground) group-hover:text-(--primary)">
                  <span className="text-[11px] font-bold text-(--muted-foreground)">
                    {index + 1}
                  </span>
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-(--muted-foreground)">
                  {item.detail}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
