"use client";

import {
  Cpu,
  Gauge,
  HardDrive,
  Info,
  MemoryStick,
  Sparkles,
  Zap,
} from "lucide-react";
import { WORKLOAD_PROFILES } from "../lib/assessReadiness.mjs";

const FIELD_META = [
  { id: "ramGb", label: "System Memory (RAM GB)", icon: MemoryStick, placeholder: "e.g. 16" },
  { id: "vramGb", label: "Accelerator Memory (VRAM GB)", icon: Gauge, placeholder: "e.g. 8" },
  { id: "freeDiskGb", label: "Free Disk Storage (GB)", icon: HardDrive, placeholder: "e.g. 50" },
  { id: "logicalCores", label: "Logical CPU Cores", icon: Cpu, placeholder: "e.g. 8" },
];

export default function HardwareConfigurator({
  hardware,
  onUpdateHardware,
  selectedProfiles,
  onToggleProfile,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-12">
      {/* Hardware Specifications Form */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8 xl:col-span-7">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <MemoryStick className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
                2. Hardware Specifications Editor
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Review or adjust your system parameters for precise workload assessment
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FIELD_META.map(({ id, label, icon: Icon, placeholder }) => (
            <label key={id} className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-[var(--foreground)]">
                <Icon className="size-4 text-[var(--primary)]" aria-hidden="true" />
                {label}
              </span>
              <input
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 font-mono text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)]"
                type="number"
                min="0"
                step={id === "logicalCores" ? "1" : "0.1"}
                inputMode="decimal"
                value={hardware[id]}
                onChange={(e) => onUpdateHardware(id, e.target.value)}
                placeholder={placeholder}
              />
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-[var(--foreground)]">
              <Zap className="size-4 text-[var(--primary)]" aria-hidden="true" />
              Available GPU / Hardware Acceleration Backend
            </span>
            <select
              className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)]"
              value={hardware.acceleration}
              onChange={(e) => onUpdateHardware("acceleration", e.target.value)}
            >
              <option value="unknown">Not sure / Unconfirmed</option>
              <option value="none">None / CPU Only</option>
              <option value="metal">Apple Metal (M1/M2/M3/M4 Unified Memory)</option>
              <option value="cuda">NVIDIA CUDA (RTX / GTX Series)</option>
              <option value="rocm">AMD ROCm (Radeon GPUs)</option>
              <option value="directml">DirectML (Windows DirectX 12 GPU)</option>
              <option value="other">Other Confirmed Acceleration Engine</option>
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
          💡 <strong>Unified Memory Tip:</strong> Macs with Apple Silicon share system RAM dynamically as VRAM. Enter your total RAM memory for both RAM and VRAM when running Metal models.
        </div>
      </section>

      {/* Workload Profiles Selector */}
      <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8 xl:col-span-5">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)]">
              Workload Profiles
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Select illustrative local AI targets to evaluate
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {WORKLOAD_PROFILES.map((profile) => {
            const isChecked = selectedProfiles.includes(profile.id);
            return (
              <label
                key={profile.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                  isChecked
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[var(--primary)]"
                  checked={isChecked}
                  onChange={() => onToggleProfile(profile.id)}
                />
                <div>
                  <span className="block text-xs font-extrabold text-[var(--foreground)]">
                    {profile.name}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium leading-relaxed text-[var(--muted-foreground)]">
                    {profile.description}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
