"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import SectionHeading from "./SectionHeading";
import { Reveal, EASE } from "./motion";

// `item` (slim fields) comes from the server page.
export default function NewAndNotableSection({ item }) {
  const reduceMotion = useReducedMotion();
  if (!item) return null;

  return (
    <section className="w-full py-20 sm:py-24 bg-[#f7f8fa]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="NEW & NOTABLE"
            heading="Just added to the index."
            description="Freshly published rankings, chosen for how quickly they're already reshaping the conversation."
          />
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div
            whileHover="hover"
            className="mt-14 relative overflow-hidden rounded-2xl min-h-[280px] sm:min-h-[360px]"
          >
            <Link href={`/top5/item/${item.slug}`} className="absolute inset-0 z-10" />
            <motion.div
              variants={{ hover: { scale: 1.06 } }}
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
            <motion.span
              animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={reduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-6 z-10 rounded-full bg-[#10b981] px-3 py-1 text-xs font-bold text-white"
            >
              NEW
            </motion.span>
            <div className="absolute bottom-0 p-8 max-w-xl">
              <p className="text-xs font-semibold tracking-widest text-white/70">
                NEW / {item.category.toUpperCase()}
              </p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-white leading-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-white/70 text-sm">{item.updatedLabel}</p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
