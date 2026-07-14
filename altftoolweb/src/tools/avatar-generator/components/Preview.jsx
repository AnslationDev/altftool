"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarSvg from "./AvatarSvg";

// Live preview surface. Holds the ref used for PNG export / clipboard copy.
// Crossfades between style changes with framer-motion for a premium feel.
export default function Preview({ config, onRef }) {
  const containerRef = useRef(null);

  // Forward the actual <svg> node to the parent for export.
  const setSvgRef = (node) => {
    if (onRef) onRef(node);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-(--border) bg-(--card) p-6 shadow-sm"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={config.style + config.seed}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full w-full"
          >
            <AvatarSvg
              config={config}
              svgRef={setSvgRef}
              className="h-full w-full drop-shadow-sm"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-xs text-(--muted-foreground)">
        Live preview · {config.style} style
      </p>
    </div>
  );
}
