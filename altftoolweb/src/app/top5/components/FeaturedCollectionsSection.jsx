"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import SectionHeading from "./SectionHeading";
import { Reveal, StaggerGroup, StaggerItem, EASE } from "./motion";
import { getRanking } from "../data/rankings";

const FEATURED_SLUGS = ["global-universities", "football-players", "electric-cars"];

export default function FeaturedCollectionsSection() {
  const [primary, ...rest] = FEATURED_SLUGS.map((slug) => getRanking(slug)).filter(Boolean);

  return (
    <section id="featured" className="w-full py-14 sm:py-20 md:py-24 bg-[#f7f8fa] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="FEATURED COLLECTIONS"
            heading="Curated for a wider view."
            description="The definitive starting points for subjects changing how we live, work, and understand the world."
          />
        </Reveal>

        <StaggerGroup className="mt-10 sm:mt-14 grid lg:grid-cols-2 gap-4 sm:gap-6">
          {primary ? (
            <StaggerItem>
              <motion.div
                whileHover="hover"
                className="group relative block overflow-hidden rounded-2xl min-h-[260px] sm:min-h-[320px] lg:min-h-[520px]"
              >
                <Link href={`/top5/item/${primary.slug}`} className="absolute inset-0 z-10" />
                <motion.div
                  variants={{ hover: { scale: 1.08 } }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0"
                >
                  <ManagedImage
                    src={primary.heroImage}
                    alt={primary.title}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <motion.div
                  variants={{ hover: { y: -6 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute bottom-0 p-5 sm:p-6 md:p-8"
                >
                  <p className="text-xs font-semibold tracking-widest text-white/70">
                    FEATURED / {primary.category.toUpperCase()}
                  </p>
                  <h3 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {primary.title}
                  </h3>
                </motion.div>
              </motion.div>
            </StaggerItem>
          ) : null}

          <div className="grid gap-4 sm:gap-6">
            {rest.map((item) => (
              <StaggerItem key={item.slug}>
                <motion.div
                  whileHover="hover"
                  className="group relative block overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[240px]"
                >
                  <Link href={`/top5/item/${item.slug}`} className="absolute inset-0 z-10" />
                  <motion.div
                    variants={{ hover: { scale: 1.08 } }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <ManagedImage
                      src={item.heroImage}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <motion.div
                    variants={{ hover: { y: -6 } }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="absolute bottom-0 p-4 sm:p-6"
                  >
                    <p className="text-xs font-semibold tracking-widest text-white/70">
                      FEATURED / {item.category.toUpperCase()}
                    </p>
                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerGroup>
      </div>
    </section>
  );
}
