import React from "react";
import { Link2, Layers, ShieldCheck, Zap } from "lucide-react";

const faqItems = [
  {
    question: "What format can I paste my URLs in?",
    answer:
      "You can paste lists of URLs separated by newlines, Markdown links list, JSON array maps, or standard browser bookmark files. The tool extracts all valid HTTP/HTTPS URLs automatically.",
  },
  {
    question: "Can I choose which format to export to?",
    answer:
      "Yes. You can export the session list as standard Markdown links, a clean standalone HTML list, or a raw JSON array string.",
  },
  {
    question: "Are there any privacy concerns?",
    answer:
      "None. All processing, parsing, and URL parsing runs completely locally in the browser memory. No URLs are ever stored on any network databases.",
  },
  {
    question: "Is there a limit to how many links I can paste?",
    answer:
      "No. It handles large lists containing hundreds of tab links instantly.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            Seamless Session Exporter
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Consolidate your researched browser tabs into compact, reusable checklists in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Link2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Smart URL Parser</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Regex filters scan any raw text and bookmark tags to accurately isolate target domains.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Clean Formats</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate structured HTML documentation or markdown bullet lists with proper link anchors.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Total Privacy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Local javascript parser ensures that private research paths remain safe in your browser session.
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
