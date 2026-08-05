import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LEARNING_RESOURCES } from "../data/resources";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const MotionLink = motion.create(Link);

/** Section 7 — guides, news, comparisons, and other learning resources. */
export default function LearningResourcesSection() {
  return (
    <section id="resources" aria-label="Learning and resources" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Keep learning"
            title="Learning & resources"
            subtitle="Guides, comparisons, and news to help you get more out of every AI tool."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_RESOURCES.map((resource, index) => (
            <Reveal key={resource.id} delay={Math.min(index * 0.06, 0.3)}>
              <MotionLink
                href={resource.href}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="aib-card group flex h-full flex-col rounded-2xl p-5"
              >
                <motion.span
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50"
                  whileHover={{ scale: 1.1 }}
                >
                  <resource.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </motion.span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{resource.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{resource.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
                  {resource.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </MotionLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
