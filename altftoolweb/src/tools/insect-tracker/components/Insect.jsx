"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INSECT_TYPES } from "../utils/insects";

// A single active insect. The engine moves the outer wrapper imperatively
// (transform), so this component only handles rendering + the click/catch hit.
// IMPORTANT: never put a framer-motion animate/style transform on the OUTER
// node — the engine owns that transform. All decorative motion lives on the
// inner elements below.
function InsectBase({
  id,
  typeKey,
  size,
  color,
  points,
  name,
  initialX,
  initialY,
  initialRot,
  caught,
  onCatch,
  registerNode,
}) {
  const Type = INSECT_TYPES[typeKey].Component;
  const reduce = useReducedMotion();

  return (
    <div
      ref={(node) => registerNode(id, node)}
      className="absolute left-0 top-0 z-10 touch-none select-none"
      style={{
        cursor: caught ? "default" : "pointer",
        willChange: "transform",
        transform: `translate(${initialX}px, ${initialY}px) translate(-50%, -50%) rotate(${initialRot}deg)`,
      }}
      onClick={() => !caught && onCatch(id)}
      role="button"
      tabIndex={-1}
      aria-label={`Catch ${name} for ${points} points`}
    >
      {/* caught pop + spawn scale (kept intact) */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: caught ? 0 : 1, opacity: caught ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        whileHover={{ scale: caught ? 0 : 1.18 }}
        whileTap={{ scale: caught ? 0 : 0.9 }}
      >
        {/* soft glow aura behind the bug */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{
            width: size * 1.15,
            height: size * 1.15,
            background: color,
            opacity: 0.28,
          }}
        />
        {/* gentle idle float — decorative only */}
        <motion.div
          animate={reduce ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 3px 5px ${color}55)` }}
        >
          <Type size={size} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default memo(InsectBase);
