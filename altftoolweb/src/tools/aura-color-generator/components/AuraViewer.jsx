"use client";

import { motion } from "framer-motion";
import ParticleCanvas from "./ParticleCanvas";

export default function AuraViewer({ aura, imagePreview }) {
  if (!aura || !imagePreview) return null;

  const isGradient = aura.hex.startsWith("linear-gradient");
  const glowColor = isGradient ? "#8B5CF6" : aura.hex;

  return (
    <div className="relative flex items-center justify-center p-8">
      <ParticleCanvas color={glowColor} count={25} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor}40, ${glowColor}10)`,
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid ${glowColor}`,
            boxShadow: `0 0 40px ${glowColor}80`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 overflow-hidden rounded-2xl border-2 shadow-2xl"
          style={{ borderColor: glowColor }}
        >
          <img src={imagePreview} alt="Aura" className="h-64 w-64 object-cover sm:h-80 sm:w-80" />
        </motion.div>
      </motion.div>
    </div>
  );
}
