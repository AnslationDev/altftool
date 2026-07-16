import { motion } from "framer-motion";
import { CornerDownRight } from "lucide-react";
import { useTypingEffect } from "../../privacy-policy-generator/hooks/useTypingEffect";

export default function Hero() {
  const typed = useTypingEffect("Build anchors, scroll handlers, route links, and reusable jump snippets from live inputs.", 20);

  return (
    <section className="pp-hero pp-glass pp-neon mb-8 overflow-hidden rounded-3xl border border-(--border) bg-(--card)/60 p-5 sm:p-6">
      <motion.div className="flex flex-col items-center text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-400">
          <CornerDownRight className="h-4 w-4" />
          Jump Code Generator Studio
        </div>
        <h1 className="max-w-3xl text-2xl font-black leading-tight text-blue-500 sm:text-3xl lg:text-4xl">
          Jump Code Generator
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
          {typed}
          <span className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 bg-teal-400" />
        </p>
      </motion.div>
    </section>
  );
}
