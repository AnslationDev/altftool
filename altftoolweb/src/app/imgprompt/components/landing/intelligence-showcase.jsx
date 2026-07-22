"use client";

import { motion } from "framer-motion";
import { Brain, Gauge, Target, TrendingUp, ShieldCheck, Wand2, Camera, Palette } from "lucide-react";
import { SectionHeader } from "../shared/section-header";

const FEATURES = [
  { icon: Brain, title: "Prompt Intelligence Score", desc: "Every prompt is graded 0–100 across 14 signals — quality, realism, composition, SEO, viral & conversion probability.", accent: "#8b5cf6" },
  { icon: Wand2, title: "AI Prompt Assistant", desc: "Improve, rewrite, expand, shorten or professionalize any prompt with one tap.", accent: "#3b82f6" },
  { icon: Camera, title: "Camera, Lens & Lighting AI", desc: "Get pro camera bodies, lenses, lighting recipes and composition suggestions instantly.", accent: "#22d3ee" },
  { icon: Target, title: "Full Prompt Explanation", desc: "Understand exactly why a prompt scores 95 — strengths, weaknesses, missing keywords & fixes.", accent: "#ec4899" },
  { icon: TrendingUp, title: "Real-Time Trend Engine", desc: "Daily, weekly & country-wise trending prompts across models, social, festivals & more.", accent: "#f59e0b" },
  { icon: ShieldCheck, title: "Commercial License Ready", desc: "Know which prompts are safe for ads, print & client work before you render.", accent: "#10b981" },
  { icon: Palette, title: "100+ Categories", desc: "Image, video, film, ads, architecture, healthcare, gaming, education — bespoke for each.", accent: "#a855f7" },
  { icon: Gauge, title: "Negative Prompt Generator", desc: "Auto-build subject-aware negative prompts for clean, artifact-free output.", accent: "#6366f1" },
];

export function IntelligenceShowcase() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Prompt Intelligence"
          title={<>Not a prompt generator.<br /><span className="text-gradient-brand">A prompt engineering brain.</span></>}
          subtitle="Imaginnex thinks like a senior prompt engineer — scoring, explaining and optimizing every prompt so your first render is your best render."
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
              <div
                className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `${f.accent}1a`, border: `1px solid ${f.accent}33` }}
              >
                <f.icon className="h-5 w-5" style={{ color: f.accent }} />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div
                className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ background: f.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
