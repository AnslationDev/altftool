import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-500">
        Canvas + SVG design studio
      </p>
      <h1 className="heading animate-fade-up md:whitespace-nowrap !text-5xl md:!text-6xl">
        Icon Maker Tool
      </h1>
      <p className="description mx-auto mt-4 max-w-5xl text-2xl md:text-3xl">
        Create launcher icons, favicons, PWA assets, SVG marks, and multi-size PNG packs with instant browser rendering.
      </p>
    </motion.header>
  );
}
