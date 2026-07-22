"use client";

import { motion } from "framer-motion";
import { REVIEWS } from "../../data/reviews";
import { SectionHeader } from "../shared/section-header";
import { ReviewCard } from "../shared/review-card";

function Row({ items, reverse = false, duration = 40 }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <motion.div
        className="flex w-max gap-5 py-2"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {row.map((r, i) => (
          <div key={r.id + i} className="w-[340px] shrink-0">
            <ReviewCard review={r} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function ReviewsSection() {
  const mid = Math.ceil(REVIEWS.length / 2);
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Customer Reviews"
          title={<>Loved by <span className="text-gradient-brand">creators worldwide</span></>}
          subtitle="Join thousands of designers, marketers and studios shipping better AI work with Imaginnex."
        />
      </div>
      <div className="mt-14 space-y-5">
        <Row items={REVIEWS.slice(0, mid)} duration={44} />
        <Row items={REVIEWS.slice(mid)} reverse duration={52} />
      </div>
    </section>
  );
}
