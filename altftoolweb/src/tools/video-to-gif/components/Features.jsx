import React from "react";
import { Film, ShieldCheck, Zap, Sliders, Settings, Download } from "lucide-react";

const faqItems = [
  {
    question: "How does the Video to GIF Converter work?",
    answer:
      "Our converter uses your browser's native canvas capabilities and a high-performance encoder to extract frames from your video file at the desired FPS (frames per second). It then maps the colors and compiles them into an optimized GIF completely inside your browser.",
  },
  {
    question: "Are my video files private and secure?",
    answer:
      "Yes, 100%. Unlike online converters that upload your video files to a remote server (which exposes your content to data leaks), all frame extraction and GIF compiling happen locally in your web browser. Your video never leaves your device.",
  },
  {
    question: "What video formats are supported?",
    answer:
      "We support standard HTML5 video formats including MP4, WebM, and OGG. Most modern smartphones, cameras, and screen recording apps capture in these compatible formats.",
  },
  {
    question: "Can I trim my video before making a GIF?",
    answer:
      "Yes! You can use our intuitive slider timeline controls to specify a starting time and ending time, so you only convert the exact clip you need rather than the entire video.",
  },
  {
    question: "How can I reduce the file size of the generated GIF?",
    answer:
      "GIF files can become large very quickly. To minimize the file size, try reducing the export resolution (width/height), lowering the frame rate (FPS), or selecting a shorter trim duration.",
  },
  {
    question: "Does it support looping and custom speed?",
    answer:
      "Yes. You can choose to enable/disable looping, customize the playback speed (0.5x, 1x, 1.5x, 2x), and select color palettes to balance quality and performance.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        {/* Core Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) sm:text-4xl tracking-tight">
            Premium Features for Perfect GIFs
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Convert clips, screen recordings, or phone videos into highly-optimized loopable GIFs instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Film className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Trim Timeline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Drag start and end sliders to choose the exact snippet of video to compile.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">100% Client-Side</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Zero server uploads. Your high-definition videos stay fully private on your device.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">FPS & Scale controls</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Control export resolution and frame rate (up to 30 FPS) to optimize GIF file size.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our browser-based Video to GIF Converter
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
