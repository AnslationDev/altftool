import React from "react";
import { ListTodo, Search, ShieldCheck, Zap } from "lucide-react";

const faqItems = [
  {
    question: "Where are my prompts stored?",
    answer:
      "All prompts are stored directly in your browser's local storage (`localStorage`). Clearing browser site data will delete your saved prompts unless you back them up first.",
  },
  {
    question: "Can I export/import my database?",
    answer:
      "Yes! The tool includes complete JSON backup tools. You can export your entire collection as a single JSON file and import it on any other machine or browser.",
  },
  {
    question: "How do I filter prompts?",
    answer:
      "You can search by keyword in prompt titles/descriptions or select tags like 'Writing', 'Coding', 'SEO', and 'Creative' to view matching categories instantly.",
  },
  {
    question: "Is there a limit to how many prompts I can save?",
    answer:
      "No. Browser `localStorage` typically permits up to 5MB of string data, which is enough to save thousands of standard prompts.",
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
              <ListTodo className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Tagging & Groups</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Categorize templates using modular semantic tags to keep prompts clean and manageable.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Instant Querying</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Search by title or snippet with key highlights mapping search phrases instantly.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Offline Storage</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No cloud accounts needed. Your configurations run entirely inside your client browser.
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
