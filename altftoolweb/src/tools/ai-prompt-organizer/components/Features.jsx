"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Sparkles,
  Tags,
  Copy,
  Zap,
  ChevronDown,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Local-first & private",
      icon: ShieldCheck,
      accent: "text-emerald-500 bg-emerald-500/10",
      desc: "Every prompt, tag, and favorite lives in your browser's local storage. Nothing is uploaded, so it works offline with zero latency.",
    },
    {
      title: "Instant fuzzy search",
      icon: Search,
      accent: "text-blue-500 bg-blue-500/10",
      desc: "Search across titles, descriptions, content, and tags in real time. Filter by category, favorites, or team scope in a single click.",
    },
    {
      title: "AI prompt optimization",
      icon: Sparkles,
      accent: "text-violet-500 bg-violet-500/10",
      desc: "One click restructures a raw idea into a professional instruction set with context, role, step-by-step rules, and output format.",
    },
    {
      title: "Tags & collections",
      icon: Tags,
      accent: "text-indigo-500 bg-indigo-500/10",
      desc: "Organize prompts with flexible tags and grouped collections so the right template is always a couple of keystrokes away.",
    },
    {
      title: "One-click reuse",
      icon: Copy,
      accent: "text-orange-500 bg-orange-500/10",
      desc: "Copy, duplicate, edit, or share any prompt instantly. Dynamic [VARIABLES] make each template reusable across projects.",
    },
    {
      title: "Fast & keyboard-friendly",
      icon: Zap,
      accent: "text-amber-500 bg-amber-500/10",
      desc: "A responsive, developer-friendly interface with smooth interactions that scales cleanly from mobile to widescreen.",
    },
  ];

  const faqs = [
    {
      q: "How does the AI Improve action work?",
      a: "Selecting AI Improve on any prompt simulates a prompt-engineering pass: it expands your raw text into a structured instruction set containing a context block, an assigned role, step-by-step rules, isolated dynamic variables, and an output format. It's modeled after prompt-expansion features in ChatGPT and Notion AI.",
    },
    {
      q: "Is my data synced to a server?",
      a: "No. This tool is intentionally local-first. All prompts, duplicates, favorites, and edits are stored directly in your browser's localStorage. You can use every feature offline, and nothing leaves your device.",
    },
    {
      q: "How does search and filtering work?",
      a: "The search index parses each prompt's title, description, content, model, and tag list, updating results as you type. You can combine it with category chips and quick filters (Recent, Favorites, Personal, Team) to narrow your vault instantly.",
    },
    {
      q: "Does it support light and dark mode?",
      a: "Yes. The entire interface is built on the site's theme tokens, so it adapts automatically to your light or dark preference with consistent contrast and accessible color choices throughout.",
    },
  ];

  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="border-t border-(--border) bg-(--background) px-4 py-16 sm:px-6 sm:py-20 text-(--foreground)">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Heading */}
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
            <Sparkles className="w-3.5 h-3.5 text-(--primary)" /> Why AI Prompt Organizer
          </span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            A private, organized home for your best prompts
          </h2>
          <p className="text-[14px] leading-relaxed text-(--muted-foreground)">
            Built for developers, writers, and teams who reuse AI prompts every day — fast to search, easy to
            organize, and safe by default.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-(--border) bg-(--card) p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.accent}`}>
                <f.icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-(--foreground)">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-(--muted-foreground)">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">Frequently asked questions</h3>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-(--border) bg-(--card)">
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[14px] font-semibold text-(--foreground)">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-(--muted-foreground) transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 -mt-1">
                      <p className="text-[13px] leading-relaxed text-(--muted-foreground)">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
