import React from "react";
import { Smile, Sliders, Shield, Zap, Sparkles, Wand2 } from "lucide-react";

  const faqItems = [
    {
      question: "How does the AI Selfie Enhancer improve my photos?",
      answer:
        "It uses advanced client-side HTML5 Canvas pixel manipulation algorithms to perform skin smoothing (using multi-pass box blur algorithms), brightness adjustment, contrast boosting, and vibrance scaling. This acts like an instant digital airbrush.",
    },
    {
      question: "What do the different enhancement presets do?",
      answer:
        "The tool includes over 70 specialized AI presets across multiple categories including: Professional Studio (balanced lighting), Creative (artsy effects), Specialized Skin Enhancement (blemish reduction), Dynamic Colors, Portrait Photography (celebrity-quality), Lifestyle, and Artistic Expression. Each preset is optimized for specific use cases like corporate headshots, social media posts, or creative projects with detailed descriptions for each style.",
    },
    {
      question: "Is there a progress indicator when applying presets?",
      answer:
        "Yes! When you apply any preset, a real-time progress bar appears showing the enhancement process. The bar simulates the AI enhancement algorithm processing your image, with detailed descriptions of what enhancements are being applied (skin tone, lighting, facial features, etc.). This provides visual feedback and demonstrates the sophisticated processing happening locally in your browser.",
    },
    {
      question: "Are my photos sent to any servers?",
      answer:
        "No. All image enhancements, cropping, and slider calculations run 100% locally in your browser memory. Your privacy is fully protected.",
    },
    {
      question: "Can I save the enhanced selfie in high quality?",
      answer:
        "Yes! When you click the Download button, the tool exports the processed canvas directly as a full-resolution JPEG/PNG file with preservation of all applied enhancements.",
    },
  ];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            High-Fidelity Canvas Enhancement
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upgrade your profile portraits instantly. Apply professional filters, smooth out skin highlights, and fine-tune colors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Wand2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Instant AI Presets</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apply pre-configured filters optimized for professional portraits, casual snapshots, or creative styling.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Granular Control Sliders</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Fine-tune exposure, contrast, saturation, skin smoothing, and sharpness dynamically to get the exact look.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Completely Client-Side</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Zero server latency, zero account sign-ups, and absolute photo privacy. All edits are made on your machine.
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
