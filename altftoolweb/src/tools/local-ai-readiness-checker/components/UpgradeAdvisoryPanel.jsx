"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  HardDrive,
  Lightbulb,
  MemoryStick,
  Sparkles,
  Zap,
} from "lucide-react";

export default function UpgradeAdvisoryPanel({
  hardware,
  result,
}) {
  const ram = Number(hardware?.ramGb || 0);
  const vram = Number(hardware?.vramGb || 0);
  const cores = Number(hardware?.logicalCores || 0);
  const acceleration = hardware?.acceleration || "none";

  const tips = [];

  if (ram < 16) {
    tips.push({
      title: "System RAM Upgrade Recommended (16GB - 32GB)",
      description: "Local 7B and 8B parameter models require at least 16GB RAM for comfortable multitasking alongside browser and OS tasks.",
      icon: MemoryStick,
      type: "upgrade",
    });
  }

  if (acceleration === "none" || acceleration === "unknown") {
    tips.push({
      title: "Enable GPU Hardware Acceleration",
      description: "Running LLMs on CPU only can result in slower token generation (2 - 8 tokens/sec). Enabling Metal (macOS), CUDA (NVIDIA), or DirectML provides 5x - 20x faster inference.",
      icon: Zap,
      type: "speed",
    });
  }

  tips.push({
    title: "Use 4-bit GGUF Quantization (Q4_K_M)",
    description: "4-bit quantization reduces model memory footprint by ~70% with negligible loss in accuracy, allowing an 8B model to run inside 6GB VRAM.",
    icon: Sparkles,
    type: "efficiency",
  });

  if (cores < 6) {
    tips.push({
      title: "CPU Core Thread Allocation",
      description: "Assign n_threads = (physical_cores - 1) in Ollama or llama.cpp to prevent system UI freeze during long prompt processing.",
      icon: Cpu,
      type: "tuning",
    });
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Lightbulb className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            Hardware Upgrade &amp; Inference Optimization Tips
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Tailored suggestions to maximize local model token generation speed and memory efficiency
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div
              key={`tip-${idx}`}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 shadow-2xs transition-all hover:border-[var(--border-strong)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="size-4.5 text-[var(--primary)]" />
                  <h3 className="text-xs font-extrabold text-[var(--foreground)]">
                    {tip.title}
                  </h3>
                </div>

                <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                  {tip.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
