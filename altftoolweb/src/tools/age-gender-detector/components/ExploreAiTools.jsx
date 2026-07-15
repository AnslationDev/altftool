"use client";

import {
  ArrowRight,
  Eraser,
  ImagePlus,
  Layers,
  PencilLine,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD, FOCUS_RING } from "./ui.jsx";

const AI_TOOLS = [
  { slug: "2-images-swap", name: "Face Swap", icon: UserRound, tone: "primary" },
  { slug: "bg-remover", name: "Background Remover", icon: Eraser, tone: "info" },
  { slug: "photo-to-sketch", name: "Photo to Sketch", icon: PencilLine, tone: "warning" },
  { slug: "pixar-style-generator", name: "Pixar Style Generator", icon: Sparkles, tone: "danger" },
  { slug: "text-behind-image", name: "Text Behind Image", icon: Layers, tone: "success" },
];

export default function ExploreAiTools() {
  return (
    <section aria-label="Explore more AI tools" className={`${CARD} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white"
          style={{ background: "var(--anslation-ds-cta-gradient)" }}
        >
          <ImagePlus size={18} aria-hidden="true" />
        </span>
        <h2 className="text-base font-bold tracking-tight text-(--foreground)">
          Explore More AI Tools
        </h2>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-center">
          {AI_TOOLS.map((tool) => (
            <a
              key={tool.slug}
              href={`/tools/all/${tool.slug}`}
              className={`inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={toneStyle(tool.tone)}
              >
                <tool.icon size={11} aria-hidden="true" />
              </span>
              {tool.name}
            </a>
          ))}
        </div>

        <a
          href="/tools/all"
          className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[8px] px-4 text-sm font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:opacity-95 ${FOCUS_RING}`}
          style={{ background: "var(--anslation-ds-cta-gradient)" }}
        >
          View All Tools
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
