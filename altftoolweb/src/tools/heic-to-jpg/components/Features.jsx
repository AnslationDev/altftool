import React from "react";
import { Image, ShieldCheck, Zap, Sliders, Settings, Download } from "lucide-react";

const faqItems = [
  {
    question: "What is a HEIC file?",
    answer:
      "HEIC (High Efficiency Image Container) is Apple's standard image format that allows high-quality images to be saved at a much smaller file size compared to JPG.",
  },
  {
    question: "Are my HEIC photos uploaded to a server?",
    answer:
      "No. All image conversions happen 100% locally in your web browser. Your private photos never leave your device.",
  },
  {
    question: "Can I convert multiple HEIC files at once?",
    answer:
      "Yes! Our batch converter allows you to drag and drop multiple HEIC/HEIF files, process them simultaneously, and export them as a single ZIP package.",
  },
  {
    question: "Does this conversion preserve metadata?",
    answer:
      "Our client-side conversion maps image pixel buffers directly to canvas frames. While it converts raw image buffers, EXIF metadata might not be retained in standard HTML5 canvas conversions.",
  },
  {
    question: "What output formats are supported?",
    answer:
      "You can choose to convert your HEIC photos into standard JPEG (JPG) format or high-quality PNG format depending on your usage requirements.",
  },
  {
    question: "How can I customize output quality?",
    answer:
      "You can adjust the quality slider in the configurations section from 10% (smallest file size) to 100% (highest quality, larger file size).",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        {/* Core Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) sm:text-4xl tracking-tight">
            Seamless Local HEIC Conversion
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Easily convert iPhone HEIC photos into widely compatible JPG and PNG formats directly on your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Batch Processing</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select multiple photos and compile them simultaneously to save time.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Private & Offline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No remote servers involved. Processing runs completely on your local device browser.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Custom Quality</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Scale quality variables to optimize file size for web page speeds or print needs.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our browser-based HEIC to JPG Converter
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
