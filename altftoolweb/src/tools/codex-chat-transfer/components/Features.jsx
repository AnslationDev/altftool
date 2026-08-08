import React from "react";
import { MessageSquare, RefreshCw, ShieldCheck, Zap, HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "What formats can I convert between?",
    answer:
      "You can convert conversation payloads between OpenAI API JSON format (role and content parameters), Anthropic Messages API format, and clean Markdown text logs.",
  },
  {
    question: "Is there any limit to the logs I can paste?",
    answer:
      "No. All parsing and structural mapping is performed locally using your browser's JavaScript engine, so there are no file size or character constraints.",
  },
  {
    question: "Are my chat histories stored?",
    answer:
      "Absolutely not. Your chat log content is parsed and converted entirely in your browser and is never transmitted anywhere. (The code editor UI itself loads its assets from a CDN, but no chat data is ever sent there or to any other server.)",
  },
  {
    question: "Does this handle custom system prompt mappings?",
    answer:
      "Yes. When converting between OpenAI and Anthropic format, system prompts are either translated to independent system roles or isolated as top-level params according to developer specifications.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            Advanced Conversation Transpiler
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Bridge the gap between AI platforms by refactoring structural logs in a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Bidirectional Mappings</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Easily convert roles between assistant, user, system, and user-assistant pairings.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Markdown Exports</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Convert raw API JSON objects into human-readable text documentation.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Fully Local</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Safe execution that keeps sensitive enterprise conversational data in-browser and never transmits it anywhere.
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
