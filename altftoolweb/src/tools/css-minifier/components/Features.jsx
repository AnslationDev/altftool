import React from "react";
import { Zap, Layout, ShieldCheck, HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "How does the minifier decrease code size?",
    answer:
      "It strips code comments, collapses unnecessary whitespaces, eliminates trailing semicolons, and cleans spaces around rules and selectors.",
  },
  {
    question: "Can I choose to preserve copyright comments?",
    answer:
      "Yes! You can toggle option configurations below the input to retain comments beginning with /*! or keep important licenses intact.",
  },
  {
    question: "Is this CSS compressor secure for sensitive code?",
    answer:
      "Completely. The compression logic runs in local sandboxed browser memory, meaning your private stylesheets are never uploaded.",
  },
  {
    question: "What is the typical compression savings?",
    answer:
      "Standard development CSS files can see 20% to 50% code reduction. Heavily commented or space-heavy files see even higher reduction.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            High Performance CSS Compressor
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Reduce asset payloads instantly to speed up loading times and improve web vitals metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Max Compression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Shrink stylesheets to their absolute minimum footprints by stripping spacing and comments.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Layout className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Detailed Statistics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Observe exactly how many bytes were shaved off and check visual savings ratios in real-time.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Safe Offline Run</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No API requests are sent. Everything compiles client-side for maximum speed and data safety.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
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
