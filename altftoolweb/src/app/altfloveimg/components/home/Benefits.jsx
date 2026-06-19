"use client";

import { ShieldCheck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem, scaleIn } from "../../lib/motion";
import { GlyphBolt, GlyphCloudOff, GlyphDevices, GlyphInfinity } from "../illustrations/FeatureGlyphs";
import { DotGrid } from "../illustrations/Decorations";

const ITEMS = [
  { Glyph: GlyphBolt, title: "Blazing fast", body: "Results appear instantly — no queues, no waiting, no progress bars to babysit." },
  { Glyph: GlyphCloudOff, title: "No uploads required", body: "Skip the round-trip. Everything happens locally, even fully offline." },
  { Glyph: GlyphDevices, title: "Works everywhere", body: "Fully responsive across desktop, tablet and mobile browsers." },
  { Glyph: GlyphInfinity, title: "Truly unlimited", body: "No file caps, no daily limits, no account. Use it as much as you like." },
];

export default function Benefits() {
  return (
    <section className="ali-section relative overflow-hidden" style={{ background: "var(--ali-page)" }}>
      <DotGrid opacity={0.4} />
      <div className="ali-container relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="ali-eyebrow">Why ALTF Love IMG</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for speed, privacy <span className="ali-gradient-text">and zero friction</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {/* feature hero card */}
          <Reveal variants={scaleIn} className="lg:row-span-2">
            <div className="relative flex h-full flex-col overflow-hidden rounded-[26px] p-8 text-white" style={{ background: "var(--ali-grad)" }}>
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <ShieldCheck size={32} />
              </div>
              <h3 className="relative mt-6 text-2xl font-bold">Private by design</h3>
              <p className="relative mt-3 max-w-md text-[15px] leading-relaxed text-white/90">
                Your images are processed entirely on your device using the Canvas API. Nothing is
                ever uploaded to a server — which is exactly why we can keep it free, unlimited and
                instant.
              </p>
              <div className="relative mt-auto flex flex-wrap gap-2 pt-8">
                {["Canvas API", "No tracking", "GDPR-friendly", "Offline-ready"].map((t) => (
                  <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">{t}</span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* benefit grid */}
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2" stagger={0.06}>
            {ITEMS.map(({ Glyph, title, body }) => (
              <RevealItem key={title} variants={scaleIn}>
                <div className="ali-card ali-card-hover ali-card-glow flex h-full flex-col p-6" style={{ "--ali-accent": "#2563eb" }}>
                  <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: "var(--ali-grad-soft)" }}>
                    <Glyph size={26} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ali-muted)" }}>{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
