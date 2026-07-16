import { FileCode2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8 mt-6"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider mb-4">
        <FileCode2 size={14} />
        Formatting Engine Active
      </div>
      <h1 className="heading !text-3xl sm:!text-4xl md:!text-5xl font-black mb-2 tracking-tight">
        PHP Beautifier Studio
      </h1>
      <p className="description text-xs md:text-sm opacity-80 max-w-xl mx-auto">
        Real-time PHP formatting engine right inside your browser. Paste, upload, and format messy PHP safely and quickly.
      </p>
    </motion.div>
  );
}
