"use client";

import {
  Activity,
  FileImage,
  Camera,
  Sun,
  Layers,
  Grid3X3,
  Palette,
  UserCheck,
} from "lucide-react";
import AnalysisCard from "./AnalysisCard";
import { ANALYSIS_CHECKS } from "../constants/index";

const ICON_MAP = {
  noise: Activity,
  compression: FileImage,
  metadata: Camera,
  lighting: Sun,
  texture: Layers,
  edges: Grid3X3,
  color: Palette,
  faces: UserCheck,
};

export default function DetailedReport({ detailedAnalysis }) {
  if (!detailedAnalysis) return null;

  const summaryScore = detailedAnalysis.summary || detailedAnalysis.noise;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
        <h3 className="text-base font-semibold text-[var(--foreground)]">Analysis Summary</h3>
        {detailedAnalysis.summary && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {detailedAnalysis.summary.summary}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-[var(--muted)]/50 p-3 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{detailedAnalysis.summary?.overallScore ?? "—"}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Score</p>
          </div>
          <div className="rounded-lg bg-[var(--muted)]/50 p-3 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{detailedAnalysis.summary?.confidence ?? "—"}%</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Confidence</p>
          </div>
          <div className="rounded-lg bg-[var(--muted)]/50 p-3 text-center">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {detailedAnalysis.summary?.riskLevel?.label ?? "—"}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Risk Level</p>
          </div>
          <div className="rounded-lg bg-[var(--muted)]/50 p-3 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{ANALYSIS_CHECKS.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Checks</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ANALYSIS_CHECKS.map((check) => {
          const analysisData = detailedAnalysis[check.id];
          if (!analysisData) return null;
          return (
            <AnalysisCard
              key={check.id}
              check={{
                name: check.name,
                score: analysisData.score,
                confidence: analysisData.confidence,
                description: analysisData.description,
                details: analysisData.details,
              }}
              icon={ICON_MAP[check.id]}
            />
          );
        })}
      </div>
    </div>
  );
}
