import React from "react";
import {
  FileEdit,
  SlidersHorizontal,
  Volume,
  PlayCircle,
  Languages,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Enter or Paste Your Text",
    description:
      "Type or paste the text you want to convert into speech. The tool supports paragraphs, long text, and multilingual content.",
    icon: FileEdit,
  },
  {
    step: 2,
    title: "Choose Voice & Customize Settings",
    description:
      "Select from the available system voices and adjust the speed, pitch, and volume to match the speaking style you prefer.",
    icon: SlidersHorizontal,
  },
  {
    step: 3,
    title: "Generate Speech Instantly",
    description:
      "Click the Speak button to hear your text. The built-in speech engine reads your content with clear and natural-sounding audio.",
    icon: Volume,
  },
  {
    step: 4,
    title: "Pause, Resume or Stop Anytime",
    description:
      "Control playback easily using pause, resume, and stop buttons—perfect for long reading sessions or content review.",
    icon: PlayCircle,
  },
  {
    step: 5,
    title: "Supports Multiple Languages",
    description:
      "Your browser automatically provides a variety of voices and languages. Choose the voice that best suits your needs.",
    icon: Languages,
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-4xl font-bold text-(--foreground) mb-3">
          How It Works
        </h1>
        <p className="text-(--muted-foreground) text-lg">
          A simple step-by-step process to convert text into natural-sounding
          speech
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className={`"
              relative
              bg-(--background)
              border border-(--border)
              rounded-2xl p-5
              shadow-sm 
              hover:shadow-md
              transition-shadow
            `}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-100 mb-6">
              <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <span className="absolute top-6 right-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Step {item.step}
            </span>

            <h3 className="text-xl font-semibold text-(--foreground) mb-3">
              {item.title}
            </h3>

            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
