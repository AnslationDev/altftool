import React from "react";
import {
  Search,
  MousePointerClick,
  Copy,
  Star,
  Share2,
  Smartphone,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search for Emojis",
    description:
      "Use the smart search bar to quickly find emojis by typing keywords or phrases.",
  },
  {
    icon: MousePointerClick,
    title: "Browse Categories",
    description:
      "Explore emojis through organized categories like Smileys, Animals, Food, and Symbols.",
  },
  {
    icon: Copy,
    title: "Pick an Emoji",
    description:
      "Click any emoji to select it. The artwork is a 64px PNG, so a flag or a smiley looks the same on Windows, Android, macOS and Linux.",
  },
  {
    icon: Star,
    title: "Frequently Used, Automatically",
    description:
      "The emojis you pick most often rise to the Frequently Used row at the top, saved in your own browser so they are still there next visit.",
  },
  {
    icon: Share2,
    title: "Trending GIFs Too",
    description:
      "Switch to the GIFs tab for the 20 GIFs currently trending on Giphy, fetched through AltFTool's server so no API key reaches your browser.",
  },
  {
    icon: Smartphone,
    title: "Works on All Devices",
    description:
      "Enjoy a smooth and responsive experience across mobile, tablet, and desktop devices.",
  },
];

export default function Description() {
  return (
    <section className="py-12 sm:py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 mt-[-40]">
          How It Works ?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md p-6 transition duration-300 hover:shadow-xl"
              >
                

                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition">
                  {step.title}
                </h3>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}