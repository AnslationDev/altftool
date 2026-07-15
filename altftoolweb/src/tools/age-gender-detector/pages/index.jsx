"use client";

import { useState } from "react";
import { BadgeCheck, ScanFace, Sparkles, UserRoundCheck, ShieldCheck } from "lucide-react";
import useImageAnalysis from "../hooks/useImageAnalysis";
import UploadArea from "../components/UploadArea.jsx";
import ResultPanel from "../components/ResultPanel.jsx";
import WebcamDetector from "../components/WebcamDetector.jsx";
import FeatureStrip from "../components/FeatureStrip.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import ExampleResults from "../components/ExampleResults.jsx";
import TipsFaq from "../components/TipsFaq.jsx";
import ExploreAiTools from "../components/ExploreAiTools.jsx";

function TrustChip({ icon: Icon, tone, children }) {
  const tones = {
    success: {
      backgroundColor: "var(--anslation-ds-success-soft)",
      color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
    },
    neutral: { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" },
    primary: {
      backgroundColor: "var(--anslation-ds-primary-soft)",
      color: "color-mix(in srgb, var(--anslation-ds-primary) 60%, var(--foreground))",
    },
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
      style={tones[tone] || tones.neutral}
    >
      <Icon size={13} aria-hidden="true" />
      {children}
    </span>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-(--foreground) sm:text-4xl">
              Age &amp; Gender Detector
            </h1>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: "var(--anslation-ds-secondary-soft)",
                color: "color-mix(in srgb, var(--anslation-ds-secondary) 60%, var(--foreground))",
              }}
            >
              <Sparkles size={13} aria-hidden="true" />
              AI-Powered
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground) sm:text-[15px]">
            Upload a photo and our advanced AI will detect the person&apos;s estimated age and
            gender in seconds.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TrustChip icon={BadgeCheck} tone="success">
              100% Free
            </TrustChip>
            <TrustChip icon={UserRoundCheck} tone="neutral">
              No Sign Up
            </TrustChip>
            <TrustChip icon={ShieldCheck} tone="primary">
              Privacy First
            </TrustChip>
          </div>
        </div>

        {/* decorative illustration */}
        <div aria-hidden="true" className="relative hidden h-36 w-48 shrink-0 lg:block">
          <span className="absolute right-24 top-20 h-16 w-16 rounded-full border border-dashed border-(--border)" />
          <span className="absolute right-0 top-24 h-10 w-10 rounded-full border border-dashed border-(--border)" />
          <span
            className="absolute right-8 top-2 flex h-24 w-24 rotate-6 items-center justify-center rounded-[20px] text-white shadow-[var(--anslation-ds-shadow-md)]"
            style={{ background: "var(--anslation-ds-cta-gradient)" }}
          >
            <ScanFace size={44} />
          </span>
          <Sparkles
            size={18}
            className="absolute right-36 top-4 text-(--primary-hover) dark:text-(--primary)"
          />
          <Sparkles size={13} className="absolute right-2 top-6 text-(--muted-foreground)" />
        </div>
      </div>
    </header>
  );
}

export default function AgeGenderDetectorApp() {
  const analysis = useImageAnalysis();
  const [cameraOpen, setCameraOpen] = useState(false);
  const busy = analysis.status === "loading" || analysis.status === "analyzing";

  return (
    <div className="font-secondary space-y-5 pb-2 text-(--foreground) sm:space-y-6">
      <Hero />

      <div className="grid items-stretch gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <UploadArea
          onFile={analysis.analyzeFile}
          onOpenCamera={() => setCameraOpen(true)}
          disabled={busy}
        />
        <ResultPanel
          status={analysis.status}
          image={analysis.image}
          faces={analysis.faces}
          activeFace={analysis.activeFace}
          setActiveFace={analysis.setActiveFace}
          processingMs={analysis.processingMs}
          error={analysis.error}
          onReset={analysis.reset}
        />
      </div>

      <FeatureStrip />

      <HowItWorks />

      <ExampleResults />

      <TipsFaq />

      <ExploreAiTools />

      {cameraOpen && (
        <WebcamDetector
          onCapture={(dataUrl) => {
            setCameraOpen(false);
            analysis.analyzeSrc(dataUrl);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
