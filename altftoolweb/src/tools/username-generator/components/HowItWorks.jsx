import React from "react";
import { Zap, Edit, Wand2, RefreshCw, Sparkles, Copy } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Enter Your Keywords",
    description:
      "Start by entering your name, interests, niche, or any keywords you want the username to be based on. This helps generate personalized username ideas.",
    icon: Edit,
  },
  {
    step: 2,
    title: "AI Username Generation",
    description:
      "The tool instantly combines your keywords with stylistic patterns, special formats, numbers, and unique variations to generate creative username ideas.",
    icon: Wand2,
  },
  {
    step: 3,
    title: "Generate Unlimited Ideas",
    description:
      "Click the generate button again to get fresh new usernames. Every click produces unique styles and combinations—no two lists are the same.",
    icon: RefreshCw,
  },
  {
    step: 4,
    title: "Stylized Username Variations",
    description:
      "The tool enhances names with cool fonts, symbols, and aesthetic styles so you can find usernames perfect for gaming, Instagram, YouTube, and more.",
    icon: Sparkles,
  },
  {
    step: 5,
    title: "Copy & Use Instantly",
    description:
      "Easily copy any username with one click and use it on social media, gaming platforms, or branding profiles instantly.",
    icon: Copy,
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        {/* <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--primary)  shadow-lg mb-6">
          <Zap className="w-7 h-7 text-white" />
        </div> */}

        <h1 className="text-4xl font-bold text-(--foreground) mb-3">
          How It Works
        </h1>

        <p className="text-lg text-(--muted-foreground)">
          Create unique, stylish, and creative usernames in just a few clicks.
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="
              relative 
              bg-(--background) 
              border border-(--border) 
              rounded-2xl 
              p-8 
              shadow-sm 
              hover:shadow-md 
              transition-shadow
            "
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--muted) mb-6">
              <item.icon className="w-6 h-6 text-indigo-600" />
            </div>

            <span className="absolute top-6 right-6 text-sm font-semibold text-indigo-600">
              Step {item.step}
            </span>

            <h3 className="text-xl font-semibold text-(--foreground) mb-3">
              {item.title}
            </h3>

            <p className="text-(--muted-foreground) text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
