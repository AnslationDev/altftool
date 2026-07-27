"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Gauge,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  WORKLOAD_PROFILES,
  assessReadiness,
  buildReadinessReport,
} from "../lib/assessReadiness.mjs";

import BrowserCapabilitiesScanner from "../components/BrowserCapabilitiesScanner";
import ExportCenter from "../components/ExportCenter";
import FrameworkMatrix from "../components/FrameworkMatrix";
import HardwareConfigurator from "../components/HardwareConfigurator";
import HeaderHero from "../components/HeaderHero";
import ModelRecommendationsGrid from "../components/ModelRecommendationsGrid";
import ReadinessScoreGauge from "../components/ReadinessScoreGauge";
import UpgradeAdvisoryPanel from "../components/UpgradeAdvisoryPanel";
import WorkloadAssessmentCards from "../components/WorkloadAssessmentCards";

const EMPTY_HARDWARE = {
  ramGb: "",
  vramGb: "",
  freeDiskGb: "",
  logicalCores: "",
  acceleration: "unknown",
};

export default function LocalAiReadinessChecker() {
  const [hardware, setHardware] = useState(EMPTY_HARDWARE);
  const [selectedProfiles, setSelectedProfiles] = useState(
    WORKLOAD_PROFILES.map((profile) => profile.id),
  );
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

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

  const runAssessment = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = assessReadiness(hardware, selectedProfiles);
      setResult(res);
      setIsScanning(false);
    }, 120);
  };

  const handleApplyDetectedSpecs = (specs) => {
    setHardware({
      ramGb: specs.ramGb || 8,
      vramGb: specs.vramGb || 0,
      freeDiskGb: specs.freeDiskGb || 30,
      logicalCores: specs.logicalCores || 4,
      acceleration: specs.acceleration || "none",
    });
    setResult(null);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Hero Banner Header */}
      <HeaderHero
        hasResult={Boolean(result)}
        onAutoDetect={() => {
          if (typeof window !== "undefined") {
            const nav = window.navigator;
            const cores = nav.hardwareConcurrency || 4;
            const memory = nav.deviceMemory || 8;
            const hasWebGpu = Boolean(nav.gpu);
            const ua = nav.userAgent || "";
            let accel = "none";
            if (/Mac/i.test(ua)) accel = "metal";
            else if (hasWebGpu) accel = "directml";

            handleApplyDetectedSpecs({
              ramGb: memory,
              logicalCores: cores,
              vramGb: hasWebGpu ? 6 : 0,
              freeDiskGb: 30,
              acceleration: accel,
            });
          }
        }}
        onResetWorkspace={reset}
      />

      {/* Live Browser Capabilities Scanner */}
      <BrowserCapabilitiesScanner
        onApplyDetectedSpecs={handleApplyDetectedSpecs}
      />

      {/* Hardware Configurator & Workload Profiles Selector */}
      <HardwareConfigurator
        hardware={hardware}
        onUpdateHardware={updateHardware}
        selectedProfiles={selectedProfiles}
        onToggleProfile={toggleProfile}
      />

      {/* Action Trigger Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isScanning}
          onClick={runAssessment}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-[var(--primary)] px-7 text-sm font-extrabold text-[var(--primary-foreground)] shadow-md transition-all hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:shadow-none"
        >
          {isScanning ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <Gauge className="size-5" />
          )}
          <span>Compare Thresholds &amp; Calculate Readiness</span>
        </button>

        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-6 text-sm font-bold text-[var(--foreground)] shadow-2xs transition-colors hover:bg-[var(--surface)]"
        >
          <RotateCcw className="size-5 text-[var(--primary)]" />
          <span>Reset</span>
        </button>
      </div>

      {/* Error Alert Display */}
      {result && !result.ok ? (
        <section
          className="rounded-3xl border border-[var(--danger)] bg-[var(--danger-soft)] p-6 shadow-sm"
          role="alert"
        >
          <h2 className="text-base font-extrabold text-[var(--danger)]">
            Check These Input Parameters
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold text-[var(--danger)]">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Assessment Results Section */}
      {result?.ok ? (
        <div className="space-y-6" aria-live="polite">
          {/* Readiness Score Gauge & Stats */}
          <ReadinessScoreGauge result={result} />

          {/* Workload Profile Assessment Cards */}
          <WorkloadAssessmentCards assessments={result.assessments} />

          {/* Recommended Local Models Grid */}
          <ModelRecommendationsGrid hardware={hardware} />

          {/* Framework Compatibility Matrix */}
          <FrameworkMatrix />

          {/* Upgrade & Optimization Advisory */}
          <UpgradeAdvisoryPanel hardware={hardware} result={result} />

          {/* Export & Sharing Center */}
          <ExportCenter report={report} result={result} />
        </div>
      ) : null}

      {/* Bottom Legal & Security Disclaimer */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-xs font-medium text-[var(--muted-foreground)]">
        <p className="flex items-start gap-2.5 leading-relaxed">
          <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-[var(--warning)]" />
          <span>
            <strong>Planning Threshold Disclaimer:</strong> These illustrative profiles compare hardware limits for local AI experimentation. Actual token generation speed, context size, and thermal throttling depend on the specific model, quantization level (e.g. Q4_K_M vs Q8_0), background processes, OS drivers, and model runtime.
          </span>
        </p>
      </section>
    </main>
  );
}
