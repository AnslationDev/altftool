"use client";

import { Star, Quote } from "lucide-react";
import { Reveal, RevealGroup, RevealItem, scaleIn } from "../../lib/motion";

const MARQUEE = [
  "Photographers", "E-commerce stores", "Social teams", "Designers", "Bloggers",
  "Developers", "Marketers", "Students", "Agencies", "Creators",
];

const REVIEWS = [
  { quote: "Finally an image compressor that doesn't upload my client photos to some random server. The before/after slider is chef's kiss.", name: "Maya R.", role: "Freelance Photographer", initials: "MR", c: "#2563eb" },
  { quote: "I batch-resize product shots every week. It does it in seconds and the ZIP export saves me so much time.", name: "Daniel K.", role: "E-commerce Manager", initials: "DK", c: "#7c3aed" },
  { quote: "The crop presets for Instagram and YouTube are exactly what our social team needed. No more guessing dimensions.", name: "Priya S.", role: "Social Media Lead", initials: "PS", c: "#0891b2" },
  { quote: "Clean, fast, and it works on my phone. Converted a folder of WEBP files on the train. Zero friction.", name: "Tomás L.", role: "Indie Developer", initials: "TL", c: "#0ea5e9" },
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
              <span key={i} className="whitespace-nowrap text-lg font-semibold" style={{ color: "var(--ali-border-strong)" }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <Reveal className="mx-auto mt-16 max-w-2xl text-center">
          <span className="ali-eyebrow">Loved by creators</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            People get <span className="ali-gradient-text">more done</span>
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2" stagger={0.08}>
          {REVIEWS.map((r) => (
            <RevealItem key={r.name} variants={scaleIn}>
              <figure className="ali-card ali-card-hover ali-card-glow relative flex h-full flex-col p-6" style={{ "--ali-accent": r.c }}>
                <Quote size={34} className="absolute right-5 top-5 opacity-10" style={{ color: r.c }} />
                <div className="flex gap-0.5" style={{ color: "#f59e0b" }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">"{r.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${r.c}, #4f46e5)` }}>{r.initials}</span>
                  <span>
                    <span className="block text-sm font-semibold">{r.name}</span>
                    <span className="block text-xs" style={{ color: "var(--ali-muted)" }}>{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
