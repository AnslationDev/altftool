import React from "react";
import { Layout, Check, Shield, FileText } from "lucide-react";

const faqItems = [
  {
    question: "What does CSS Beautifier do?",
    answer:
      "It parses minified, unformatted, or messy CSS declarations and formats them with consistent indentations, spacing, and structured bracket alignments.",
  },
  {
    question: "Does it support Media Queries and Keyframes?",
    answer:
      "Yes! The custom formatting engine detects nested brackets and increments indentation levels dynamically to handle responsive blocks cleanly.",
  },
  {
    question: "Is my source code sent to any servers?",
    answer:
      "No. All parsing, indentation, and formatting operations are executed entirely client-side inside your browser, ensuring total privacy.",
  },
  {
    question: "How do I choose my indentation size?",
    answer:
      "Use the configuration panel below the input box to customize your preferred indentation width (2, 4, or 8 spaces). The tool always indents with spaces, not tab characters.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            Professional CSS Formatter
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Clean up CSS styles instantly to enhance legibility and match clean codebase style guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Layout className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Beautiful Formatting</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Transform single-line minified stylesheets into well-organized code blocks with consistent rules.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Customizable Layout</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure tab sizes, spacing rules, and line wrapping dynamically to fit your styling guidelines.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">100% Offline Secure</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Run conversions locally inside browser memory. None of your CSS styles or properties are uploaded.
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
