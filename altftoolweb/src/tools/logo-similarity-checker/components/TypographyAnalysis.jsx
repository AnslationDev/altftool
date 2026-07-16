"use client";

import { Type, Bold, AlignCenter, TextSelect, CaseLower, CaseUpper } from "lucide-react";

export default function TypographyAnalysis({ typoA, typoB, typoComparison }) {
  if (!typoA && !typoB) return null;

  const TypoCard = ({ typo, label }) => (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-[--foreground]">{label}</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-[--border] p-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${typo.textDetected ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
            <TextSelect className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-[--foreground]">{typo.textDetected ? "Text Detected" : "No Text Detected"}</p>
            <p className="text-[10px] text-[--muted]">{typo.textPresence}% text presence</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Type, label: "Font Style", value: typo.estimatedFontStyle },
            { icon: Bold, label: "Boldness", value: `${typo.boldness}%` },
            { icon: AlignCenter, label: "Alignment", value: typo.alignment },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg bg-[--surface-soft] p-2">
                <div className="flex items-center gap-1.5 text-xs text-[--muted] mb-1"><Icon className="h-3 w-3" />{item.label}</div>
                <p className="text-xs font-bold text-[--foreground]">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-[--surface-soft] p-2">
          <p className="text-xs text-[--muted] mb-1">Character Analysis</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><CaseUpper className="h-3 w-3 text-primary" />{typo.uppercase}% Upper</span>
            <span className="flex items-center gap-1"><CaseLower className="h-3 w-3 text-primary" />{typo.lowercase}% Lower</span>
            <span className="flex items-center gap-1"><Type className="h-3 w-3 text-primary" />{typo.spacing}% Spacing</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {typoComparison && (
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[--foreground]"><Type className="h-4 w-4 text-primary" />Typography Match</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-[--surface-soft] p-2">
              <p className="text-xs text-[--muted]">Text Presence</p>
              <p className="text-lg font-bold text-[--foreground]">{typoComparison.textPresence}%</p>
            </div>
            <div className="rounded-lg bg-[--surface-soft] p-2">
              <p className="text-xs text-[--muted]">Boldness</p>
              <p className="text-lg font-bold text-[--foreground]">{typoComparison.boldness}%</p>
            </div>
            <div className="rounded-lg bg-[--surface-soft] p-2">
              <p className="text-xs text-[--muted]">Overall</p>
              <p className="text-lg font-bold text-[--foreground]">{typoComparison.overall}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {typoA && <TypoCard typo={typoA} label="Logo A — Typography Analysis" />}
        {typoB && <TypoCard typo={typoB} label="Logo B — Typography Analysis" />}
      </div>
    </div>
  );
}
