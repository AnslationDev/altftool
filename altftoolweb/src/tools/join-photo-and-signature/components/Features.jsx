import React from "react";
import { Image, ShieldCheck, Download, Edit3, Sliders, Layers } from "lucide-react";

export default function Features() {
  return (
    <section className="py-16 bg-(--page) border-t border-(--border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
            A Safe and Compliant Candidate Image Merger
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Quickly merge your passport-size photo and handwritten signature to meet exact specifications for UPSC, banking, and government applications.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Exam Specific Presets</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apply pre-configured dimensions and ratio presets for major Indian competitive exams like UPSC, SSC, and IBPS instantly.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Privacy first (Local processing)</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your photos and signatures are confidential. All image combining and resizing operations occur strictly inside your local browser.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Target File Size (KB)</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Specify a target file size (e.g., 20KB - 50KB) and our compressor will automatically adjust output parameters to match the threshold.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Image className="h-6 w-6" alt="" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Signature Scaling</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Adjust the scale and proportions of the signature easily to fit naturally below your photo without stretching or pixelation.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Edit3 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Custom Margins & Gaps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Fine-tune the layout by adjusting vertical spacing, alignment, and card margins to generate an aesthetic and clean result.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Multiple Output Formats</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Export your joined results as high-resolution JPEG, JPG, or PNG files, ready for standard upload interfaces.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-(--foreground) mb-10">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="bg-(--surface) p-6 rounded-xl border border-(--border)">
              <h4 className="font-semibold text-(--foreground) mb-2">Why is it important that processing is client-side?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Many online photo resizers upload your images to remote servers to process them. This exposes your personal photos and signature samples to potential security leaks. This tool runs entirely locally in JavaScript, guaranteeing 100% data privacy.
              </p>
            </div>
            <div className="bg-(--surface) p-6 rounded-xl border border-(--border)">
              <h4 className="font-semibold text-(--foreground) mb-2">What is the standard configuration for UPSC online applications?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                UPSC requires a combined image file where the candidate's passport photograph is on top, and the signature is positioned directly underneath. The total image dimensions must be between 350x525 px, and the file size must be between 20KB and 140KB.
              </p>
            </div>
            <div className="bg-(--surface) p-6 rounded-xl border border-(--border)">
              <h4 className="font-semibold text-(--foreground) mb-2">What should I do if my signature background is gray/dirty?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                To get the best result, sign on plain, unruled white paper with a thick black gel pen. Scan or photograph it in bright daylight, and use crop handles to trim any dark corners before importing it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
