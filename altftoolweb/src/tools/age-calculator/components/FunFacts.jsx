"use client";

import { Sparkles, Star, Rabbit, Users, Gem, Flower2, Palette } from "lucide-react";
import { SectionCard, ACCENT } from "./ui";

export default function FunFacts({ facts }) {
  const items = [
    { icon: Star, label: "Zodiac Sign", value: facts.zodiacSign, tone: ACCENT.teal },
    { icon: Rabbit, label: "Chinese Zodiac", value: facts.chineseZodiac, tone: ACCENT.cyan },
    { icon: Users, label: "Generation", value: facts.generation, tone: ACCENT.blue },
    { icon: Gem, label: "Birthstone", value: facts.birthstone, tone: ACCENT.violet },
    { icon: Flower2, label: "Birth Flower", value: facts.birthFlower, tone: ACCENT.teal },
    { icon: Palette, label: "Lucky Color", value: facts.luckyColor, tone: ACCENT.blue },
  ];
  return (
    <SectionCard title="Fun Facts About Your Birth Date" icon={Sparkles}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.label} className="flex flex-col items-center rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-sm">
            <span
              className="grid h-11 w-11 place-items-center rounded-full"
              style={{ background: `color-mix(in srgb, ${i.tone} 16%, transparent)`, color: i.tone }}
            >
              <i.icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground)">{i.label}</p>
            <p className="text-sm font-bold text-(--foreground)">{i.value}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
