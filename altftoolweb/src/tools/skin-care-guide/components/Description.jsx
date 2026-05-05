"use client";

import React from "react";
import { Sun, Droplet, Leaf, Smile, Moon, Heart } from "lucide-react";

const cardData = [
  {
    title: "Cleanse Daily",
    description: "Remove dirt, oil, and impurities with a gentle cleanser suitable for your skin type.",
    icon: <Droplet className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Hydrate Skin",
    description: "Use a moisturizer daily to keep your skin soft, supple, and well-hydrated.",
    icon: <Leaf className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Protect from Sun",
    description: "Apply sunscreen every morning to protect your skin from harmful UV rays.",
    icon: <Sun className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Night Care",
    description: "Use night creams or serums to repair and rejuvenate your skin while you sleep.",
    icon: <Moon className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Healthy Diet",
    description: "Eat fruits, vegetables, and drink plenty of water for glowing skin.",
    icon: <Heart className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Self-Care Routine",
    description: "Pamper yourself with masks, exfoliation, and regular skin checkups.",
    icon: <Smile className="w-8 h-8 text-(--primary)" />
  }
];

export default function SkinCareGuide() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 mt-[-40]">
      <h2 className="text-3xl font-bold text-(--foreground) text-center mb-10">How It Works ?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-start hover:bg-white/20 transition-colors shadow-md"
          >
            <div className="mb-4">{card.icon}</div>
            <h3 className="text-xl font-semibold text-(--foreground) mb-2 group-hover:text-blue-500 transition-colors">
              {card.title}
            </h3>
            <p className="text-(--foreground) text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}