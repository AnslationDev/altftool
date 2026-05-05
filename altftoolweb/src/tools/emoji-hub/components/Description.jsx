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
    title: "Copy Instantly",
    description:
      "Click on any emoji to instantly copy it to your clipboard for quick use.",
  },
  {
    icon: Star,
    title: "Save Your Favorites",
    description:
      "Mark frequently used emojis as favorites to access them anytime easily.",
  },
  {
    icon: Share2,
    title: "Use Anywhere",
    description:
      "Paste copied emojis into social media posts, chats, emails, or any content platform.",
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