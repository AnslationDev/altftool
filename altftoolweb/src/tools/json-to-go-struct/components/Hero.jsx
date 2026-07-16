import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { useTypingEffect } from "../hooks/useTypingEffect";

export default function Hero() {
  const typed = useTypingEffect("Paste JSON, validate it, and generate production-ready Go structs with tags, nesting, slices, and nullable fields.", 18);

  return (
    <section className="jg-hero pp-hero pp-glass pp-neon mb-8 overflow-hidden rounded-3xl p-5 sm:p-8">
      <motion.div className="text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="jg-hero-pill mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black">
          <Code2 className="h-4 w-4" />
          JSON To Go Struct Generator
        </div>
        <h1 className="jg-hero-title mx-auto max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          JSON To Go Struct Generator
        </h1>
        <p className="jg-hero-copy mx-auto mt-7 max-w-4xl text-lg leading-8 sm:text-2xl">
          {typed}
          <span className="ml-1 inline-block h-6 w-0.5 translate-y-0.5 bg-cyan-500" />
        </p>
      </motion.div>
    </section>
  );
}
