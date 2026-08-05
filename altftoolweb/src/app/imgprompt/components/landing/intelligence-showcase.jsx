"use client";

import { motion } from "framer-motion";
import { Brain, Gauge, Target, Library, ShieldCheck, Wand2, Camera, Palette } from "lucide-react";
import { SectionHeader } from "../shared/section-header";

const FEATURES = [
  { icon: Brain, title: "Prompt Structure Review", desc: "Review useful prompt signals such as subject detail, composition, lighting and output constraints." },
  { icon: Wand2, title: "AI Prompt Assistant", desc: "Improve, rewrite, expand, shorten or professionalize any prompt with one tap." },
  { icon: Camera, title: "Camera, Lens & Lighting AI", desc: "Get camera, lens, lighting and composition suggestions for your prompt." },
  { icon: Target, title: "Prompt Explanation", desc: "See the structure behind a suggestion and identify details you may want to add, remove or rewrite." },
  { icon: Library, title: "Curated Pattern Library", desc: "Browse stable prompt examples across models, formats and creative themes." },
  { icon: ShieldCheck, title: "Usage Checklist", desc: "Review model, platform and content-policy considerations before using an output commercially." },
  { icon: Palette, title: "Creative Categories", desc: "Explore image, video, film, advertising, architecture, healthcare, gaming and education starting points." },
  { icon: Gauge, title: "Negative Prompt Generator", desc: "Build subject-aware negative prompts and adjust them before rendering." },
];

export function IntelligenceShowcase() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Prompt Toolkit"
          title={<>More than a blank prompt box.<br /><span className="text-gradient-brand">A structured creative workspace.</span></>}
          subtitle="Imaginnex helps you draft, review and adapt prompts while keeping the final creative decision in your hands."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 card-hover"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
