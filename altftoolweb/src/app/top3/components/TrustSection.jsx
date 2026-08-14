"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Container, Reveal, Kicker } from "./ui";
import { editorialStandards, testPipeline } from "../data/content";

// ============================================================================
// Trust section — Why Trust + Editorial Standards + Methodology
// Three sub-sections with distinct layouts, sharing a dark theme.
// ============================================================================

export function TrustSection() {
  return (
    <section id="standards" className="relative bg-ink py-24 text-paper md:py-32">
      <Container>
        {/* Why Trust */}
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <Kicker className="text-paper/60">
                <span className="inline-block h-px w-6 bg-paper/60" />
                Why trust Top3
              </Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,4.5vw,64px)] font-light leading-[1.02] tracking-[-0.02em]">
                Seven years of
                <br />
                <em className="italic text-accent-soft">saying no</em>
                <br />more often than yes.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-paper/75">
                Our team has turned down paid placement every week since 2019. That's
                not a policy — it's the reason this publication still exists.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-10 grid grid-cols-2 gap-6 max-w-sm">
                {[
                  { n: "0", l: "Paid placements, ever" },
                  { n: "100%", l: "Reader-supported" },
                  { n: "7 yrs", l: "Independent operation" },
                  { n: "42", l: "Reader surveys run" },
                ].map((s) => (
                  <div key={s.l} className="border-t border-paper/20 pt-3">
                    <div className="display text-3xl font-light num-tabular">{s.n}</div>
                    <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.14em] text-paper/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Editorial standards cards */}
          <div className="md:col-span-7">
            <div className="grid gap-px bg-paper/15 sm:grid-cols-2">
              {editorialStandards.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.5}>
                  <div className="group h-full bg-ink p-8 transition-colors hover:bg-paper/[0.04]">
                    <div className="display text-[56px] font-light italic text-paper/20 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 display text-xl font-light">{s.title}</h3>
                    <p className="mt-3 text-[13px] leading-[1.6] text-paper/70">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Methodology pipeline */}
      <div id="methodology" className="mt-32 border-t border-paper/15 pt-24">
        <Container>
          <Reveal>
            <Kicker className="text-paper/60">
              <span className="inline-block h-px w-6 bg-paper/60" />
              How we test
            </Kicker>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="display mt-5 max-w-3xl text-[clamp(32px,4vw,56px)] font-light leading-[1.05] tracking-[-0.02em]">
              A seven-step pipeline — identical for every category, scaled to what matters.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-7">
            {testPipeline.map((step, i) => (
              <PipelineStep key={step.step} step={step} index={i} />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}

function PipelineStep({ step, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const height = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  return (
    <Reveal delay={index}>
      <div ref={ref} className="relative">
        <div className="relative h-20 w-full bg-paper/10 overflow-hidden">
          <motion.div style={{ height }} className="absolute inset-x-0 top-0 bg-accent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="display text-4xl font-light italic text-paper/80 num-tabular">{step.step}</span>
          </div>
        </div>
        <div className="mt-4 display text-lg font-light">{step.name}</div>
        <p className="mt-2 text-[12px] leading-[1.55] text-paper/65">{step.detail}</p>
      </div>
    </Reveal>
  );
}
