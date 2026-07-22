"use client";

import { motion } from "framer-motion";
import { Layers, ArrowUpRight } from "lucide-react";

export function CollectionCard({ collection, index = 0 }) {
  return (
    <motion.a
      href="/imgprompt/studio/collections"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
      className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-6 card-hover"
      style={{ backgroundImage: `linear-gradient(140deg, ${collection.gradient[0]}14, ${collection.gradient[1]}0a)` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl transition-all duration-500 group-hover:opacity-50"
        style={{ background: `linear-gradient(135deg, ${collection.gradient[0]}, ${collection.gradient[1]})` }}
      />
      <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-border bg-card/80 backdrop-blur">
        <Layers className="h-4 w-4 text-foreground/70" />
      </div>
      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 text-xs text-foreground/80 backdrop-blur">
          {collection.promptCount} prompts
        </div>
        <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
          {collection.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          Curated by {collection.curator}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </motion.a>
  );
}
