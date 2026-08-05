"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "../../data/categories";
import { NAV_ITEMS_BY_SLUG, studioHref } from "../../data/navigation";
import { useAuth } from "../../providers/auth-provider";
import { SectionHeader } from "../shared/section-header";
import { Button } from "../ui/button";

/** Route a category tile into its matching Studio tool, or fall back to
 *  the Prompt Generator for categories that don't have a dedicated tool
 *  page. Either way the destination Workspace reads the category (from
 *  its own tool definition, or from ?category= here) and fetches a fresh
 *  AI-generated idea for it — see workspace.jsx. */
function studioTargetFor(category) {
  if (NAV_ITEMS_BY_SLUG[category.slug]) return studioHref(category.slug);
  return `/imgprompt/studio/prompt-generator?category=${encodeURIComponent(category.slug)}`;
}

export function CategoriesSection() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const list = CATEGORIES.slice(0, 18);

  const goTo = (href) => (e) => {
    e.preventDefault();
    requireAuth(() => router.push(href));
  };

  return (
    <section id="imgprompt-categories" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="Prompt Categories"
            title={`${CATEGORIES.length} ways to start creating`}
            subtitle="Browse the available categories, choose a starting point and adapt the generated prompt to your project."
          />
          <Button variant="outline" className="shrink-0" onClick={goTo("/imgprompt/studio")}>
            Browse all <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {list.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
            >
              <a
                href={studioTargetFor(c)}
                onClick={goTo(studioTargetFor(c))}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/40 p-4 card-hover"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                />
                <div className="text-3xl">{c.emoji}</div>
                <div className="mt-6">
                  <div className="font-display text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
                    {c.name}
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
