"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_COLLECTIONS } from "../data/collections";
import { getAllTools } from "../data/tools";
import { useToolLaunch } from "../providers/ToolLaunchProvider";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ToolLogo from "./ToolLogo";

function resolveCollectionTools(collection, catalog) {
  return collection.toolKeys
    .map(([name, domain]) => catalog.find((item) => item.name === name && item.domain === domain))
    .filter(Boolean);
}

/** Section 5 — persona-based curated tool collections. */
export default function FeaturedCollectionsSection() {
  const catalog = getAllTools();
  const { launchTool } = useToolLaunch();

  return (
    <section id="collections" aria-label="Featured collections" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Curated for you"
            title="Featured collections"
            subtitle="Hand-picked tool stacks for how you actually work."
          />
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_COLLECTIONS.map((collection, index) => {
            const Icon = collection.icon;
            const tools = resolveCollectionTools(collection, catalog);
            return (
              <Reveal key={collection.id} delay={Math.min(index * 0.08, 0.32)}>
                <div className="aib-card flex h-full flex-col rounded-3xl p-6">
                  <motion.span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundImage: `linear-gradient(135deg, ${collection.hue[0]}22, ${collection.hue[1]}14)` }}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: collection.hue[0] }} aria-hidden="true" />
                  </motion.span>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">{collection.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{collection.blurb}</p>

                  <ul className="mt-5 flex-1 space-y-1">
                    {tools.map((tool) => (
                      <li key={`${collection.id}-${tool.domain}`}>
                        <motion.a
                          href={tool.url}
                          onClick={(event) => {
                            event.preventDefault();
                            launchTool(tool);
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-900/[0.03]"
                        >
                          <ToolLogo name={tool.name} domain={tool.domain} hue={collection.hue} size={24} />
                          <span className="flex-1 truncate text-sm font-medium text-slate-700">{tool.name}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-teal-500" aria-hidden="true" />
                        </motion.a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
