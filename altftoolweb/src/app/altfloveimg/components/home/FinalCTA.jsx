"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Wifi, Infinity as InfinityIcon } from "lucide-react";
import { BASE } from "../../data/tools";
import { Reveal } from "../../lib/motion";

export default function FinalCTA() {
  return (
    <section className="ali-section" style={{ background: "var(--ali-page)" }}>
      <div className="ali-container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[34px] px-6 py-16 text-center sm:px-12 sm:py-24" style={{ background: "var(--ali-grad)" }}>
            {/* decorations */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-12 -top-16 h-72 w-72 rounded-full bg-white/12 blur-3xl" />
              <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
              <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
                <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0 H0 V40" fill="none" stroke="#fff" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#cta-grid)" />
              </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles size={15} /> Ready when you are
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Start editing images in seconds
              </h2>
              <p className="mt-4 text-lg text-white/90">No sign-up. No uploads. No limits. Just pick a tool and go.</p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href={`${BASE}/compress`} className="ali-btn ali-btn-lg" style={{ background: "#fff", color: "var(--ali-blue-700)" }}>
                  Compress an image <ArrowRight size={18} />
                </Link>
                <a href="#tools" className="ali-btn ali-btn-lg" style={{ background: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}>
                  Explore all tools
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={16} /> Private by design</span>
                <span className="inline-flex items-center gap-1.5"><Wifi size={16} /> Works offline</span>
                <span className="inline-flex items-center gap-1.5"><InfinityIcon size={16} /> Free & unlimited</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
