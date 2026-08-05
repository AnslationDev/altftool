"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { label: "Ranking", href: "#ranking", id: "ranking" },
  { label: "Compare", href: "#compare", id: "compare" },
  { label: "Methodology", href: "#methodology", id: "methodology" },
  { label: "Related", href: "#related", id: "related" },
];

export default function TabsBar() {
  const [active, setActive] = useState(0);

  // Scroll-spy: highlight the tab for the section currently in view, so the
  // bar stays truthful while the reader scrolls instead of only reacting to
  // clicks.
  useEffect(() => {
    const sections = TABS.map((tab) => document.getElementById(tab.id)).filter(Boolean);
    if (!sections.length) return undefined;

    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let current = 0;
      let closestTop = Number.NEGATIVE_INFINITY;
      sections.forEach((section, index) => {
        const top = section.getBoundingClientRect().top;
        if (top <= probe && top > closestTop) {
          closestTop = top;
          current = index;
        }
      });
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (event, index) => {
    const target = document.getElementById(TABS[index].id);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(index);
    }
  };

  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-border sm:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab, index) => (
        <a
          key={tab.label}
          href={tab.href}
          onClick={(event) => scrollTo(event, index)}
          aria-current={active === index ? "location" : undefined}
          className="relative shrink-0 whitespace-nowrap py-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className={active === index ? "text-foreground" : ""}>{tab.label}</span>
          {active === index ? (
            <motion.span
              layoutId="top5-tab-underline"
              className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}
        </a>
      ))}
    </div>
  );
}
