import React from "react";
import { Sparkles, Smile, ShieldCheck, Download } from "lucide-react";

const faqItems = [
  {
    question: "How does the AI Character Generation mode work?",
    answer:
      "It synthesizes your chosen properties into a descriptive cartoon rendering prompt and fetches it via the free Pollinations.ai API with no signup required.",
  },
  {
    question: "How does the Photo Stylizer mode work?",
    answer:
      "If you upload a local photograph or enter an image link, the tool does two things: it sends the picture to image.pollinations.ai for the AI render, and it loads it onto a canvas where the 3D emboss/depth shaders and cinema bloom layers are applied client-side. Only the canvas half stays on your device.",
  },
  {
    question: "Is there any cost or limit to generating images?",
    answer:
      "No! The Pollinations AI API and the client-side canvas stylizer are completely free to use with no generation limits.",
  },
  {
    question: "Where do my uploaded photos go?",
    answer:
      "They are sent to a third party. Uploading a file or entering an image link sends the picture straight to image.pollinations.ai — an uploaded file is POSTed as image data, a pasted link is passed along as an image URL — because that service runs the Flux model that produces the render. AltFTool never receives or stores your photo, but what Pollinations does with it is covered by its terms, not ours. Only the emboss, bloom and vibrancy sliders work on a local canvas without sending anything.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            3D Animated Avatar Creator
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience magical animated styling with free text-to-image AI or local photorealistic transformations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Free AI Character Synthesizer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Query deep neural diffusion models directly to create unique toys, magicians, or superheroes.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Smile className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">3D Clay-Emboss Filters</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Convert flat profile photographs into rounded, smooth claymation-like 3D characters.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Glassy Pixar Eyes Overlays</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select and adjust cute glossy animated eyes, round noses, and smiles directly on the canvas.
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
