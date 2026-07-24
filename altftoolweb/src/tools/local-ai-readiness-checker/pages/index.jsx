"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  Gauge,
  HardDrive,
  Info,
  MemoryStick,
  RotateCcw,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";

import {
  assessReadiness,
  buildReadinessReport,
  WORKLOAD_PROFILES,
} from "../lib/assessReadiness.mjs";

const EMPTY_HARDWARE = {
  ramGb: "",
  vramGb: "",
  freeDiskGb: "",
  logicalCores: "",
  acceleration: "unknown",
};

const STATUS_META = {
  "meets-thresholds": {
    label: "Meets these thresholds",
    icon: CheckCircle2,
    className: "border-[var(--success)] bg-[var(--success-soft)]",
  },
  "close-to-thresholds": {
    label: "Close to these thresholds",
    icon: AlertTriangle,
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
  },
  "below-thresholds": {
    label: "Below these thresholds",
    icon: XCircle,
    className: "border-[var(--danger)] bg-[var(--danger-soft)]",
  },
};

const FIELD_META = [
  { id: "ramGb", label: "System memory (GB)", icon: MemoryStick },
  { id: "vramGb", label: "Accelerator memory (GB)", icon: Gauge },
  { id: "freeDiskGb", label: "Free disk space (GB)", icon: HardDrive },
  { id: "logicalCores", label: "Logical CPU cores", icon: Cpu },
];

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "local-ai-readiness-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function LocalAiReadinessChecker() {
  const [hardware, setHardware] = useState(EMPTY_HARDWARE);
  const [selectedProfiles, setSelectedProfiles] = useState(
    WORKLOAD_PROFILES.map((profile) => profile.id),
  );
  const [result, setResult] = useState(null);
  const report = useMemo(
    () => (result?.ok ? buildReadinessReport(result) : null),
    [result],
  );

  const updateHardware = (field, value) => {
    setHardware((current) => ({ ...current, [field]: value }));
    setResult(null);
  };

  const toggleProfile = (id) => {
    setSelectedProfiles((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setResult(null);
  };

  const reset = () => {
    setHardware(EMPTY_HARDWARE);
    setSelectedProfiles(WORKLOAD_PROFILES.map((profile) => profile.id));
    setResult(null);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Cpu className="h-4 w-4" aria-hidden="true" />
              Manual, private hardware check
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Local AI Readiness Checker
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Enter your computer&apos;s specifications and compare them with transparent,
              illustrative workload thresholds. Nothing scans your device or leaves this tab.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Not a compatibility promise</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Actual speed and memory use depend on the model, quantization, context, runtime,
              drivers, and workload. Verify those requirements separately.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
              <MemoryStick className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Your hardware
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Use values from your operating system&apos;s trusted hardware information page.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELD_META.map(({ id, label, icon: Icon }) => (
              <label key={id} className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <Icon className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                  {label}
                </span>
                <input
                  className="input-field min-h-11 w-full"
                  type="number"
                  min="0"
                  step={id === "logicalCores" ? "1" : "0.1"}
                  inputMode="decimal"
                  value={hardware[id]}
                  onChange={(event) => updateHardware(id, event.target.value)}
                  placeholder="0"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Zap className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              Available acceleration
            </span>
            <select
              className="input-field min-h-11 w-full"
              value={hardware.acceleration}
              onChange={(event) => updateHardware("acceleration", event.target.value)}
            >
              <option value="unknown">Not sure</option>
              <option value="none">None / CPU only</option>
              <option value="cuda">CUDA</option>
              <option value="rocm">ROCm</option>
              <option value="metal">Metal</option>
              <option value="directml">DirectML</option>
              <option value="other">Other confirmed acceleration</option>
            </select>
          </label>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Shared-memory systems may not report a fixed VRAM amount. Enter the memory you can
              safely allocate to the accelerator, or zero when unknown, and review runtime-specific
              guidance before installing anything.
            </p>
          </div>
        </section>

        <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Workload profiles
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            These are illustrative planning thresholds, not requirements for named models.
          </p>
          <div className="mt-4 space-y-3">
            {WORKLOAD_PROFILES.map((profile) => (
              <label
                key={profile.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={selectedProfiles.includes(profile.id)}
                  onChange={() => toggleProfile(profile.id)}
                />
                <span>
                  <span className="block text-sm font-bold text-[var(--foreground)]">
                    {profile.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {profile.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary min-h-11 px-5"
          onClick={() => setResult(assessReadiness(hardware, selectedProfiles))}
        >
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Compare thresholds
        </button>
        <button type="button" className="btn-secondary min-h-11 px-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {report ? (
          <button
            type="button"
            className="btn-secondary min-h-11 px-5"
            onClick={() => downloadReport(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download counts-only summary
          </button>
        ) : null}
      </div>

      {result && !result.ok ? (
        <section
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5"
          role="alert"
        >
          <h2 className="font-bold text-[var(--foreground)]">Check these inputs</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result?.ok ? (
        <section className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Profiles checked", result.counts.assessed],
              ["Meets thresholds", result.counts.meetsThresholds],
              ["Close", result.counts.closeToThresholds],
              ["Below", result.counts.belowThresholds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--foreground)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.assessments.map((assessment) => {
              const meta = STATUS_META[assessment.status];
              const StatusIcon = meta.icon;
              return (
                <article
                  key={assessment.id}
                  className={`rounded-lg border p-5 ${meta.className}`}
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                        {meta.label}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-[var(--foreground)]">
                        {assessment.name}
                      </h3>
                    </div>
                  </div>
                  {assessment.gaps.length ? (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-[var(--foreground)]">
                        Inputs below the profile
                      </p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        {assessment.gaps.map((gap) => (
                          <li key={gap.field}>
                            {gap.field === "acceleration"
                              ? "Compatible acceleration was not confirmed."
                              : `${gap.label}: ${gap.available} ${gap.unit} entered; ${gap.required} ${gap.unit} threshold.`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                      Every manually entered value meets this profile&apos;s planning thresholds.
                      This does not test drivers, runtimes, thermal limits, or a model.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
