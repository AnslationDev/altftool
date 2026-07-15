import React from "react";
import { Layout, Check, Shield, UserCheck, Sparkles, Smile } from "lucide-react";

const faqItems = [
  {
    question: "How does the Profile Picture Rating tool analyze my photo?",
    answer:
      "The tool uses local HTML5 canvas analysis (measuring image brightness, contrast, framing, color distribution, and composition) to evaluate key criteria of your profile picture.",
  },
  {
    question: "Is my uploaded photo secure and private?",
    answer:
      "Absolutely. Your photo is processed locally in your browser. We never upload your images to our servers.",
  },
  {
    question: "What makes a good profile picture according to this analyzer?",
    answer:
      "A high-scoring profile photo features clear, front-facing lighting, a simple or softly blurred background, central framing with a head-and-shoulders crop, high contrast, and a warm, approachable facial expression.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            Optimize Your Digital First Impression
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Analyze your photos scientifically to maximize engagement, professional trust, and readability on all social media platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Social & Professional Audit</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get targeted ratings for LinkedIn, Twitter, GitHub, or casual dating apps to fit the context you need.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Advanced Image Scan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Go beyond simple filters. Receive full feedback on expression, alignment, background, and lighting.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Privacy Protected</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No photos or API keys are stored on our servers. All operations happen in-browser in your memory space.
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
