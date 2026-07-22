"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function SectionHeader({ eyebrow, title, subtitle, align = "center", className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className={cn("max-w-2xl text-base text-muted-foreground", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
