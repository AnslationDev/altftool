"use client";

import { useParams } from "next/navigation";
import AdvancedWorkbench from "@/tools/_shared/advanced/AdvancedWorkbench";
import AssistiveTool from "@/tools/_shared/assistive/AssistiveTool";
import ToolRuntime from "@/tools/_shared/toolkit/ToolRuntime";
import { advancedCatalog } from "@/tools/_shared/advanced/catalog";
import { newTaskSpecCatalog } from "./specCatalog";

const assistiveSlugs = new Set([
  "adjustable-reading-reformatter",
  "bionic-reading-converter",
  "live-caption-overlay",
  "low-vision-camera-magnifier",
  "dwell-click-keyboard",
  "switch-scanning-communicator",
  "aac-phrase-board",
  "high-contrast-document-recolor",
  "slow-speech-playback-trainer",
  "lip-read-practice-mirror",
  "big-button-medical-info-card",
  "braille-embosser-sheet-maker",
  "focus-reading-mask",
  "one-handed-keyboard-trainer",
  "voice-steadiness-visualizer",
]);

export default function NewTaskEntry() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  if (advancedCatalog[slug]) return <AdvancedWorkbench slug={slug} />;
  if (assistiveSlugs.has(slug)) return <AssistiveTool slug={slug} />;

  const spec = newTaskSpecCatalog[slug];
  if (!spec) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--foreground)]"
      >
        This tool runtime is unavailable.
      </div>
    );
  }
  return <ToolRuntime spec={spec} />;
}
