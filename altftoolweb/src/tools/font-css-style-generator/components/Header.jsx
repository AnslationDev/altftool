import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-500 mb-3">
        Typography CSS Studio
      </p>
      <h1 className="heading text-gradient-hero">Font CSS Style Generator</h1>
      <p className="description mt-2 max-w-3xl mx-auto">
        Build live font styles, gradient text, shadows, responsive clamp CSS, and production-ready output in the browser.
      </p>
    </motion.header>
  );
}
