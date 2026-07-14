import React from "react";
import { Columns, ArrowLeftRight, ShieldCheck, Zap } from "lucide-react";

const faqItems = [
  {
    question: "How does the comparison engine work?",
    answer:
      "The tool pretty-prints both input JSON streams and performs a line-by-line diff alignment check, highlighting additions, deletions, and value modifications between the two objects.",
  },
  {
    question: "Can I compare remote JSON files?",
    answer:
      "Yes! You can paste any valid public REST API URL or raw JSON URL into the URL fetch box, and the tool will fetch it directly using browser requests.",
  },
  {
    question: "Are my JSON datasets uploaded to any server?",
    answer:
      "No. All parsing, validation, comparison, and diff highlighting operations are processed 100% locally on your computer in browser memory.",
  },
  {
    question: "What happens if my JSON is invalid?",
    answer:
      "The parser checks syntax immediately. If there is a trailing comma or missing quote, a descriptive syntax error alert will guide you to repair it.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            Advanced JSON Differ & Align
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Analyze changes in structural payloads and API outputs instantly with high contrast markers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Columns className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Split-Screen View</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Inspect modifications side-by-side with matched line numbers and synchronized scroll indicators.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Triple Input Sources</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Paste code snippets directly, drop JSON files, or fetch data streams via external Web APIs.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Client-Side Secure</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Secure offline parsing guarantees that private keys or sensitive user configurations stay safe on your device.
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
