"use client";

import { motion } from "framer-motion";
import { Camera, Shield, Download, Sparkles, Upload } from "lucide-react";
import { Button } from "@altftool/ui";

const FEATURES = [
  { icon: Camera, label: "AI Face Detection" },
  { icon: Sparkles, label: "Background Removal" },
  { icon: Download, label: "Print Ready" },
];

const TRUST_BADGES = [
  "100% Browser Based",
  "No Upload Required",
  "Privacy First",
];

const floatingIcons = [
  { Icon: Camera, x: "10%", y: "20%", delay: 0 },
  { Icon: Sparkles, x: "85%", y: "15%", delay: 0.2 },
  { Icon: Shield, x: "15%", y: "70%", delay: 0.4 },
  { Icon: Download, x: "80%", y: "75%", delay: 0.6 },
];

export default function HeroSection({ onUpload }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-24"
      style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, #1e3a5f 100%)",
      }}
      role="banner"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />

      {floatingIcons.map(({ Icon, x, y, delay }) => (
        <motion.div
          key={delay}
          className="absolute hidden md:block"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md">
            <Icon size={24} />
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Sparkles size={14} />
            AI-Powered Photo Tool
          </div>
        </motion.div>

        <motion.h1
          className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          AI Passport Photo Maker
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Create professional passport and visa photos instantly. Automatic face detection,
          background removal, and print-ready templates — all in your browser.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: "white",
              color: "var(--primary)",
            }}
            aria-label="Upload your photo to get started"
          >
            <Upload size={18} />
            Upload Your Photo
          </Button>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md"
            >
              <Icon size={14} />
              {label}
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {TRUST_BADGES.map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-xs text-white/70">
              <Shield size={12} className="text-white/80" />
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
