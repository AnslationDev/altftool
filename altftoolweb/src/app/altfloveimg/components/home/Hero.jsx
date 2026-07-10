"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Star, Lock, Wifi, ShieldCheck } from "lucide-react";
import Dropzone from "../shared/Dropzone";
import HeroArt from "../illustrations/HeroArt";
import { GlowField, DotGrid } from "../illustrations/Decorations";
import { setHandoffFiles } from "../../lib/handoff";
import { BASE } from "../../data/tools";
import { motion, useReducedMotion, fadeUp, container } from "../../lib/motion";

const STATS = [
  { value: "13+", label: "Pro tools" },
  { value: "100%", label: "In-browser" },
  { value: "0", label: "Uploads" },
  { value: "∞", label: "Free runs" },
];

export default function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const handleFiles = (files) => {
    setHandoffFiles(files);
    router.push(`${BASE}/compress`);
  };

  const item = reduce ? {} : fadeUp;

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--ali-page)" }}>
      <GlowField />
      <div className="absolute inset-0 ali-grid-bg opacity-50" />
      <DotGrid opacity={0.35} />

      <div className="ali-container relative z-10 grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* left */}
        <motion.div
          variants={reduce ? undefined : container(0.09)}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <motion.span variants={item} className="ali-eyebrow">
            <Sparkles size={14} /> Premium browser image studio
          </motion.span>

          <motion.h1 variants={item} className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Edit images like a pro,{" "}
            <span className="ali-gradient-text">without the cloud</span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "var(--ali-muted)" }}>
            Compress, resize, crop, convert, watermark and enhance — a complete toolkit that runs
            entirely on your device. No uploads, no sign-up, no limits.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={`${BASE}/compress`} className="ali-btn ali-btn-primary ali-btn-lg">
              Start for free <ArrowRight size={18} />
            </Link>
            <a href="#tools" className="ali-btn ali-btn-ghost ali-btn-lg">Explore tools</a>
          </motion.div>

          {/* upload affordance */}
          <motion.div variants={item} className="mt-6 max-w-md">
            <div className="ali-glass rounded-2xl p-2.5" style={{ boxShadow: "var(--ali-shadow-md)" }}>
              <Dropzone onFiles={handleFiles} multiple compact title="Drop images to begin" subtitle="opens in the compressor — switch tools anytime" />
            </div>
          </motion.div>

          {/* social proof */}
          <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm" style={{ color: "var(--ali-muted)" }}>
            <span className="inline-flex items-center gap-2.5">
              <span className="flex -space-x-2">
                {[["MR", "#14B8A6"], ["DK", "#38BDF8"], ["PS", "#0D9488"], ["TL", "#06B6D4"]].map(([t, c]) => (
                  <span key={t} className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white ring-2"
                    style={{ background: `linear-gradient(135deg, ${c}, var(--secondary, #38BDF8))`, ["--tw-ring-color"]: "var(--ali-page)" }}>
                    {t}
                  </span>
                ))}
              </span>
              <span>
                <span className="flex" style={{ color: "#f59e0b" }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="#f59e0b" />)}
                </span>
                <span className="text-xs font-medium" style={{ color: "var(--ali-text)" }}>Loved by 10k+ creators</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5"><Lock size={15} style={{ color: "var(--ali-blue)" }} /> Private</span>
            <span className="inline-flex items-center gap-1.5"><Wifi size={15} style={{ color: "var(--ali-blue)" }} /> Works offline</span>
          </motion.div>
        </motion.div>

        {/* right — illustration */}
        <motion.div
          className="relative"
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <div className="absolute inset-6 rounded-[40px] opacity-60 blur-2xl" style={{ background: "var(--ali-grad-soft)" }} />
          <HeroArt className="relative w-full" />
        </motion.div>
      </div>

      {/* stats */}
      <div className="ali-container relative z-10 pb-14 sm:pb-20">
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          variants={reduce ? undefined : container(0.07)}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "-50px" }}
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={item} className="ali-stat-card">
              <div className="text-2xl font-extrabold ali-gradient-text sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs font-medium sm:text-sm" style={{ color: "var(--ali-muted)" }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
