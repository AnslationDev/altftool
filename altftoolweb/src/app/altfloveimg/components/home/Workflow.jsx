"use client";

import { UploadCloud, Wand2, Download } from "lucide-react";
import { Reveal, RevealGroup, RevealItem, scaleIn } from "../../lib/motion";

const STEPS = [
  { icon: UploadCloud, n: "01", title: "Upload", body: "Drag & drop or select an image. It loads instantly and stays on your device." },
  { icon: Wand2, n: "02", title: "Edit", body: "Pick a tool and adjust settings with a live preview until it's exactly right." },
  { icon: Download, n: "03", title: "Download", body: "Export your result in one click — a single file or a batch as a ZIP." },
];

export default function Workflow() {
  return (
    <section className="ali-section" style={{ background: "var(--ali-surface)" }}>
      <div className="ali-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="ali-eyebrow">How it works</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps. <span className="ali-gradient-text">That's it.</span>
          </h2>
        </Reveal>

        <RevealGroup className="relative mt-14 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {/* connecting line */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-9 hidden h-0.5 md:block"
            style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ali-blue) 55%, transparent), transparent)" }} />

          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <RevealItem key={s.n} variants={scaleIn}>
                <div className="ali-card ali-card-hover relative flex flex-col items-center p-7 text-center" style={{ "--ali-accent": "#2563eb" }}>
                  <span className="absolute right-5 top-4 text-4xl ali-step-num">{s.n}</span>
                  <div className="grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg" style={{ background: "var(--ali-grad)" }}>
                    <Icon size={28} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--ali-muted)" }}>{s.body}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
