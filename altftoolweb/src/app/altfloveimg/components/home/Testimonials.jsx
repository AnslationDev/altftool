"use client";

import { Quote } from "lucide-react";
import { Reveal, RevealGroup, RevealItem, scaleIn } from "../../lib/motion";

const MARQUEE = [
  "Photographers", "E-commerce stores", "Social teams", "Designers", "Bloggers",
  "Developers", "Marketers", "Students", "Agencies", "Creators",
];

const HIGHLIGHTS = [
  { quote: "Compress client photos without uploading a single byte — the before/after slider makes it easy to check quality before you export.", tag: "Compress", c: "#14B8A6" },
  { quote: "Batch-resize product shots in seconds, then export the whole set as one ZIP.", tag: "Resize", c: "#38BDF8" },
  { quote: "Crop presets for Instagram, Facebook, LinkedIn and YouTube take the guesswork out of social dimensions.", tag: "Crop", c: "#0D9488" },
  { quote: "Every tool runs entirely in your browser, so converting a folder of files works even offline.", tag: "Convert", c: "#06B6D4" },
];

export default function Testimonials() {
  return (
    <section className="ali-section" style={{ background: "var(--ali-page)" }}>
      <div className="ali-container">
        {/* trust marquee */}
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ali-muted)" }}>
            Trusted by people who work with images all day
          </p>
        </Reveal>
        <div className="ali-marquee-wrap mt-6 overflow-hidden">
          <div className="ali-marquee">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="whitespace-nowrap text-lg font-semibold" style={{ color: "var(--ali-text-soft)" }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <Reveal className="mx-auto mt-16 max-w-2xl text-center">
          <span className="ali-eyebrow">Why people switch</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for people who get <span className="ali-gradient-text">more done</span>
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2" stagger={0.08}>
          {HIGHLIGHTS.map((r) => (
            <RevealItem key={r.tag} variants={scaleIn}>
              <figure className="ali-card ali-card-hover ali-card-glow relative flex h-full flex-col p-6" style={{ "--ali-accent": r.c }}>
                <Quote size={34} className="absolute right-5 top-5 opacity-10" style={{ color: r.c }} />
                <span className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: "color-mix(in srgb, var(--ali-accent) 14%, transparent)", color: "var(--ali-accent)" }}>
                  {r.tag}
                </span>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">&quot;{r.quote}&quot;</blockquote>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
