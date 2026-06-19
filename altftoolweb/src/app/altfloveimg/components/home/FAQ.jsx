"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessagesSquare } from "lucide-react";
import { Reveal } from "../../lib/motion";
import { BASE } from "../../data/tools";

const FAQS = [
  { q: "Are my images uploaded anywhere?", a: "No. Every tool runs entirely inside your browser using the Canvas, File and Blob APIs. Your images never leave your device, which makes the platform private by design and able to work even offline." },
  { q: "Is it really free and unlimited?", a: "Yes. There are no file-size caps, daily limits, accounts or hidden fees. Because the processing happens on your own device, we can offer it free and unlimited." },
  { q: "Which formats are supported?", a: "You can work with JPG, PNG, WEBP, GIF and BMP inputs, and export to JPG, PNG and WEBP. Dedicated converters make switching between formats one click." },
  { q: "Will the tools add a watermark to my images?", a: "Never. The only watermark you'll ever see is one you add yourself with the Watermark tool. Exports are always clean." },
  { q: "Can I process multiple images at once?", a: "Yes. Tools like Compress and the converters support batch processing — drop in many images, process them together, and download everything as a single ZIP file." },
  { q: "Do the AI tools work right now?", a: "The Background Remover runs a real on-device model and the Upscaler enhances images in your browser. The architecture is prepared to plug in even more advanced AI models in the future." },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="ali-section" style={{ background: "var(--ali-surface)" }}>
      <div className="ali-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <span className="ali-eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, <span className="ali-gradient-text">answered</span>
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--ali-muted)" }}>
            Everything you need to know about how ALTF Love IMG keeps your work fast and private.
          </p>
          <div className="ali-card mt-6 flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: "var(--ali-grad)" }}>
              <MessagesSquare size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold">Still curious?</p>
              <Link href={`${BASE}/compress`} className="text-sm font-medium" style={{ color: "var(--ali-blue)" }}>
                Just try a tool — it's instant →
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="ali-card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={isOpen}>
                  <span className="font-semibold">{f.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-300"
                    style={{ background: isOpen ? "var(--ali-grad)" : "var(--ali-soft)", color: isOpen ? "#fff" : "var(--ali-muted)", transform: isOpen ? "rotate(45deg)" : "none" }}>
                    <Plus size={16} />
                  </span>
                </button>
                <div className="ali-acc-panel" data-open={isOpen}>
                  <div>
                    <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "var(--ali-muted)" }}>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
