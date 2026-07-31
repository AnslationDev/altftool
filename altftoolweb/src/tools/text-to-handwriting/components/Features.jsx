"use client";

import React from "react";
import { Edit3, BookOpen, ShieldCheck, Download, Sliders, Palette } from "lucide-react";

const faqItems = [
  {
    question: "How does the Text to Handwriting Converter work?",
    answer:
      "Our converter loads highly-realistic handwriting web fonts from Google Fonts and draws your typed text onto an HTML5 canvas. You can choose different line ruling presets (notebook, blank, grid, parchment) and ink colors (blue, dark blue, black, red, green) to compile the output.",
  },
  {
    question: "Are my documents secure?",
    answer:
      "Yes. The entire rendering, formatting, and conversion process takes place locally inside your browser. No text or generated images are ever uploaded to any database or external server.",
  },
  {
    question: "How do I make the output look like real handwriting?",
    answer:
      "To maximize realism, turn on our 'Hand Jitter Simulation' option. This adds micro-deviations to line rotation, font size, and spacing dynamically to simulate natural human variation.",
  },
  {
    question: "Can I download my handwritten document as a PDF?",
    answer:
      "Yes. You can download the completed sheet directly as a high-quality PNG image or compile and export it as a standard PDF page for easy sharing or uploading.",
  },
  {
    question: "Are there different paper types available?",
    answer:
      "Yes, we offer classic Ruled Notebook Lined paper, Blueprint Grid paper, Blank clean sheet, and Aged Parchment options.",
  },
  {
    question: "Does it support custom handwriting fonts?",
    answer:
      "We pre-load 40 distinct handwriting fonts. You can choose the one that matches your personal handwriting style best from the option settings panel.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        {/* Core Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) sm:text-4xl tracking-tight">
            Realistic Digital Handwriting Creator
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Convert digital text assignments, study notes, or emails into premium handwritten documents instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Notebook Presets</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose classic lined school notebooks, blank sheets, blueprint grid lines, or aged parchment paper.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Authentic Inks</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select between Royal Blue, Gel Blue, Deep Black, Red, or Green inks with precise hex mappings.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Jitter Realism</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enable subtle randomness for spacing, angles, and line slopes to make writing look 100% genuine.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our browser-based Text to Handwriting Converter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-(--surface) rounded-2xl border border-(--border) p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-(--foreground) mb-3 flex items-start gap-2.5">
                  <span className="text-teal-500 font-extrabold text-lg shrink-0">Q.</span>
                  <span>{item.question}</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
