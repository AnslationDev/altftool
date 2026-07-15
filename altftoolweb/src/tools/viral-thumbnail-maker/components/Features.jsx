import React from "react";
import { Youtube, Sliders, Shield, Zap, Sparkles, Image } from "lucide-react";

const faqItems = [
  {
    question: "How does the Viral Thumbnail Maker generate thumbnails?",
    answer:
      "Describe your video topic, pick a visual style and color theme. The tool translates your inputs into a highly optimized AI prompt and generates 4 unique high-quality 16:9 thumbnail variations instantly.",
  },
  {
    question: "Can I customize the generated thumbnail?",
    answer:
      "Yes! You can specify custom overlay text directly in the generator, choose from 8 visual styles and 6 color themes, and regenerate as many times as you want until you get the perfect thumbnail.",
  },
  {
    question: "Do I need to sign up or purchase an API key?",
    answer:
      "No. The image generation utilizes free public AI endpoints, meaning you get fully unlimited high-quality generation with no key requirement and zero costs.",
  },
  {
    question: "What resolution does it export in?",
    answer:
      "All thumbnails are exported at exactly 1280x720 pixels, which is the standard 16:9 resolution recommended by YouTube for maximum clarity across desktop and mobile devices.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            AI-Driven YouTube Optimization
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Build eye-catching, high-CTR thumbnails in seconds. Answer key video queries, generate stunning backdrops, and overlay viral elements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Youtube className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Designed for CTR</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Focuses on high-contrast visuals, vibrant lighting, and expressive structures that capture viewers' interest.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">4 Variations at Once</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each generation creates 4 unique thumbnail variations so you can pick the best one for maximum engagement.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Free & Limitless</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No registration or billing details needed. Access high-quality multimodal text-to-image AI tools instantly.
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
