"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Video } from "lucide-react";
import { IMAGE_MODELS, VIDEO_MODELS } from "../../data/models";

function ModelChip({ model }) {
  const Icon = model.medium === "video" ? Video : ImageIcon;
  return (
    <div className="group flex items-center gap-3 whitespace-nowrap rounded-2xl border border-border bg-card/50 px-4 py-3 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${model.accent}1a`, boxShadow: `0 0 0 1px ${model.accent}33` }}
      >
        <Icon className="h-4 w-4" style={{ color: model.accent }} />
      </span>
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-sm font-semibold">{model.name}</span>
          {model.badge && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: `${model.accent}1a`, color: model.accent }}
            >
              {model.badge}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{model.vendor}</div>
      </div>
    </div>
  );
}

function MarqueeRow({ models, reverse, duration }) {
  const row = [...models, ...models];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {row.map((m, i) => (
          <ModelChip key={m.id + i} model={m} />
        ))}
      </motion.div>
    </div>
  );
}

/** Two belts moving in opposite directions — image models one way, video
 *  models the other — so the claim "every major AI engine" reads as a
 *  living showcase instead of one flat static row. */
export function ModelMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-border py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-primary/[0.04]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Tuned for every major AI engine — one click to OpenArt
        </p>
      </div>
      <div className="relative space-y-4">
        <MarqueeRow models={IMAGE_MODELS} duration={30} />
        <MarqueeRow models={VIDEO_MODELS} duration={34} reverse />
      </div>
    </section>
  );
}
