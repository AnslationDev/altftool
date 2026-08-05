"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import { ArrowUpRight, Eye, Clock3 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal, StaggerGroup, StaggerItem, EASE } from "./motion";

/**
 * Featured collection card — shared by the tall lead and the two stacked
 * tiles. Premium treatment: glass number + category chips, meta row and
 * CTA that unfold on hover, shine sweep across the photo, inner hairline
 * frame, and the site-wide spotlight rule (hovered card sharpens, the
 * others dim).
 */
function FeatureCard({ item, index, tall, dimmed, onHover }) {
  return (
    <motion.div
      onMouseEnter={() => onHover(item.slug)}
      onMouseLeave={() => onHover(null)}
      animate={{
        opacity: dimmed ? 0.55 : 1,
        scale: dimmed ? 0.985 : 1,
        filter: dimmed ? "saturate(0.55)" : "saturate(1)",
      }}
      transition={{ duration: 0.4, ease: EASE }}
      whileHover="hover"
      className={`group relative block overflow-hidden rounded-2xl sm:rounded-3xl bg-footer shadow-md transition-shadow duration-500 hover:shadow-lg ${
        tall
          ? "min-h-[260px] sm:min-h-[320px] lg:min-h-[520px] lg:h-full"
          : "min-h-[200px] sm:min-h-[240px]"
      }`}
    >
      <Link
        href={`/top5/item/${item.slug}`}
        aria-label={item.title}
        className="absolute inset-0 z-20"
      />

      {/* Photo with hover zoom + slow settle. */}
      <motion.div
        variants={{ hover: { scale: 1.08 } }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute inset-0"
      >
        {/* cardImage (1200w) instead of heroImage (2400w): visually
            identical at card sizes, dramatically lighter to load. */}
        <ManagedImage
          src={item.cardImage || item.heroImage}
          alt={item.title}
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Gradients: quiet at rest, deeper on hover for the meta row. */}
      <div className="absolute inset-0 bg-gradient-to-t from-footer/80 via-footer/10 to-footer/10 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-footer/70 via-footer/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Shine sweep. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-on-media/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:left-[125%] group-hover:opacity-100"
      />

      {/* Hairline inner frame. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 z-10 rounded-xl sm:rounded-2xl border border-on-media/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Glass chips: serial number + category. */}
      <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-on-media/90 text-xs font-bold text-footer shadow-md backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-on-media/25 bg-footer/25 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-on-media backdrop-blur-md">
          FEATURED / {item.category.toUpperCase()}
        </span>
      </div>

      {/* Arrow chip pops in top-right. */}
      <span className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-foreground opacity-0 scale-75 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0">
        <ArrowUpRight size={15} />
      </span>

      {/* Copy block. */}
      <motion.div
        variants={{ hover: { y: -6 } }}
        transition={{ duration: 0.35, ease: EASE }}
        className={`absolute bottom-0 z-10 w-full ${tall ? "p-5 sm:p-6 md:p-8" : "p-4 sm:p-6"}`}
      >
        <h3
          className={`font-bold text-on-media leading-tight ${
            tall ? "text-xl sm:text-2xl md:text-3xl max-w-lg" : "text-lg sm:text-xl max-w-md"
          }`}
        >
          {item.title}
        </h3>

        {/* Underline draws, then the meta row unfolds. */}
        <span className="mt-3 block h-[2px] w-0 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 group-hover:w-16" />
        <div className="grid grid-rows-[0fr] transition-all duration-500 ease-out group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-on-media/85">
              <span className="inline-flex items-center gap-1.5">
                <Eye size={13} className="text-primary" />
                {item.views} views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} className="text-primary" />
                {item.readTime}
              </span>
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 tracking-widest text-on-media">
                READ THE RANKING
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// `featured` (slim fields) comes from the server page.
export default function FeaturedCollectionsSection({ featured = [] }) {
  const [primary, ...rest] = featured;
  const [hoveredSlug, setHoveredSlug] = useState(null);

  return (
    <section id="featured" className="w-full py-14 sm:py-20 md:py-24 bg-page scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="FEATURED COLLECTIONS"
            heading="Curated for a wider view."
            description="The definitive starting points for subjects changing how we live, work, and understand the world."
          />
        </Reveal>

        <StaggerGroup
          className="mt-10 sm:mt-14 grid lg:grid-cols-2 gap-4 sm:gap-6"
        >
          <>
            {primary ? (
              <StaggerItem className="h-full">
                <FeatureCard
                  item={primary}
                  index={0}
                  tall
                  dimmed={hoveredSlug !== null && hoveredSlug !== primary.slug}
                  onHover={setHoveredSlug}
                />
              </StaggerItem>
            ) : null}

            <div className="grid gap-4 sm:gap-6">
              {rest.map((item, index) => (
                <StaggerItem key={item.slug}>
                  <FeatureCard
                    item={item}
                    index={index + 1}
                    tall={false}
                    dimmed={hoveredSlug !== null && hoveredSlug !== item.slug}
                    onHover={setHoveredSlug}
                  />
                </StaggerItem>
              ))}
            </div>
          </>
        </StaggerGroup>
      </div>
    </section>
  );
}
