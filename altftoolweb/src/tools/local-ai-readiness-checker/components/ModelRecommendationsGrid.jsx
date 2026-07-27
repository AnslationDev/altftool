"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Cpu,
  Flame,
  Info,
  Layers,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  MODEL_CATALOG,
  evaluateModelCompatibility,
} from "../lib/assessReadiness.mjs";

const STATUS_BADGES = {
  Recommended: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
  "Runs Well": "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]",
  "Heavy / Marginal": "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]",
  "Not Recommended": "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ModelRecommendationsGrid({
  hardware,
}) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Boxes className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Recommended Local Open-Weight Models
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Model suitability calculated against your hardware RAM, VRAM, and acceleration
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODEL_CATALOG.map((model) => {
          const status = evaluateModelCompatibility(hardware, model);
          const badgeStyle = STATUS_BADGES[status] || STATUS_BADGES["Heavy / Marginal"];

          return (
            <div
              key={model.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 shadow-2xs transition-all hover:border-[var(--border-strong)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-[var(--surface)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--muted-foreground)] border border-[var(--border)]">
                    {model.category}
                  </span>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${badgeStyle}`}>
                    {status}
                  </span>
                </div>

                <h3 className="mt-2.5 text-sm font-extrabold text-[var(--foreground)]">
                  {model.name}
                </h3>
                <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                  {model.description}
                </p>
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-3 text-[11px] font-semibold text-[var(--muted-foreground)]">
                <div className="flex items-center justify-between">
                  <span>Req. RAM: {model.minRamGb} GB</span>
                  <span>Disk: {model.minDiskGb} GB</span>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px]">
                  <span>Params: {model.parameters}</span>
                  <span className="text-[var(--primary)] font-bold">Quant: {model.recommendedQuant}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
