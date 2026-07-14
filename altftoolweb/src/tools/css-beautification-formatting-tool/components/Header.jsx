import { motion } from "framer-motion";
import { Braces } from "lucide-react";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cf-hero mb-8 overflow-hidden rounded-3xl p-5 text-center sm:p-6 cf-glass cf-neon"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold text-blue-400">
        <Braces className="h-4 w-4" />
        Browser CSS Studio
      </div>
      <h1 className="mx-auto max-w-4xl text-2xl font-black leading-tight text-blue-500 sm:text-3xl lg:text-4xl">
        CSS Beautification and Formatting Tool
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
        Beautify, validate, minify, compare, copy, and download CSS in real time.
      </p>
    </motion.div>
  );
}
