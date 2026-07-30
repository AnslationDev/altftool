"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessagesSquare } from "lucide-react";
import { Reveal } from "../../lib/motion";
import { BASE } from "../../data/tools";
import { FAQS } from "../../data/faqs";

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
                Just try a tool — it&#39;s instant →
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.question} className="ali-card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={isOpen}>
                  <span className="font-semibold">{f.question}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-300"
                    style={{ background: isOpen ? "var(--ali-grad)" : "var(--ali-soft)", color: isOpen ? "#fff" : "var(--ali-muted)", transform: isOpen ? "rotate(45deg)" : "none" }}>
                    <Plus size={16} />
                  </span>
                </button>
                <div className="ali-acc-panel" data-open={isOpen}>
                  <div>
                    <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "var(--ali-muted)" }}>{f.answer}</p>
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
