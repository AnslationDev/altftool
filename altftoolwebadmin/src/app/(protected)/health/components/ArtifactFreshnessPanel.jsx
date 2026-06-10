"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Copy } from "lucide-react";
import { copyTextWithFallback } from "./clipboard";
import { formatDate, formatNumber, getGateSurface, getGateTone } from "./healthFormatters";

const ARTIFACT_FRESHNESS_TARGETS = [
  {
    key: "routeQa",
    label: "Route QA",
    generatedAt: (snapshot) => snapshot.routeQa?.checkedAt,
    detail: (snapshot) =>
      `${formatNumber(snapshot.routeQa?.totals?.routes)} routes, ${formatNumber(snapshot.routeQa?.totals?.browserProbes)} browser probes.`,
    command: "npm run qa:routes:report",
    maxFreshHours: 24,
    maxWatchHours: 72,
  },
  {
    key: "performanceBudget",
    label: "Performance budget",
    generatedAt: (snapshot) => snapshot.performanceBudget?.generatedAt,
    detail: (snapshot) =>
      `${formatNumber(snapshot.performanceBudget?.totals?.publicImages)} public images, ${formatNumber(snapshot.performanceBudget?.totals?.dynamicToolImports)} lazy tool imports.`,
    command: "npm run performance:budget:report",
    maxFreshHours: 24,
    maxWatchHours: 72,
  },
  {
    key: "blogContent",
    label: "Blog content",
    generatedAt: (snapshot) => snapshot.blogContent?.generatedAt,
    detail: (snapshot) =>
      `${formatNumber(snapshot.blogContent?.totals?.ready)}/${formatNumber(snapshot.blogContent?.totals?.total)} blogs ready.`,
    command: "npm run content:blogs:report",
    maxFreshHours: 24,
    maxWatchHours: 96,
  },
  {
    key: "productionLinks",
    label: "Production links",
    generatedAt: (snapshot) => snapshot.productionLinks?.generatedAt,
    detail: (snapshot) =>
      `${formatNumber(snapshot.productionLinks?.totals?.pages)} pages, ${formatNumber(snapshot.productionLinks?.totals?.linksChecked)} links checked.`,
    command: "npm run monitor:links:report",
    maxFreshHours: 24,
    maxWatchHours: 72,
  },
  {
    key: "releaseDoctor",
    label: "Release doctor",
    generatedAt: (snapshot) => snapshot.releaseDoctorArtifact?.generatedAt,
    detail: (snapshot) =>
      `${formatNumber(snapshot.releaseDoctorArtifact?.summary?.counts?.pass)} pass, ${formatNumber(snapshot.releaseDoctorArtifact?.summary?.counts?.warn)} warn.`,
    command: "npm run release:doctor:report",
    maxFreshHours: 24,
    maxWatchHours: 72,
  },
  {
    key: "healthManifest",
    label: "Health manifest",
    generatedAt: (snapshot) => snapshot.manifest?.generatedAt,
    detail: (snapshot) => `${formatNumber(snapshot.tools?.healthy)}/${formatNumber(snapshot.tools?.total)} tools healthy.`,
    command: "npm run health:manifest",
    maxFreshHours: 72,
    maxWatchHours: 168,
  },
];

function getArtifactAgeHours(generatedAt) {
  if (!generatedAt) return Infinity;
  const timestamp = new Date(generatedAt).getTime();
  if (!Number.isFinite(timestamp)) return Infinity;
  return Math.max(0, (Date.now() - timestamp) / 36e5);
}

function formatArtifactAge(hours) {
  if (!Number.isFinite(hours)) return "Missing";
  if (hours < 1) return "Just now";
  if (hours < 48) return `${Math.round(hours)}h old`;
  return `${Math.round(hours / 24)}d old`;
}

function artifactStatus(target, generatedAt) {
  const ageHours = getArtifactAgeHours(generatedAt);

  if (!Number.isFinite(ageHours)) return "block";
  if (ageHours > target.maxWatchHours) return "block";
  if (ageHours > target.maxFreshHours) return "warn";
  return "pass";
}

export default function ArtifactFreshnessPanel({ snapshot }) {
  const [copiedCommand, setCopiedCommand] = useState("");
  const rows = ARTIFACT_FRESHNESS_TARGETS.map((target) => {
    const generatedAt = target.generatedAt(snapshot);
    const status = artifactStatus(target, generatedAt);

    return {
      ...target,
      generatedAt,
      status,
      ageHours: getArtifactAgeHours(generatedAt),
      detail: target.detail(snapshot),
    };
  });
  const staleRows = rows.filter((row) => row.status !== "pass");
  const copyCommand = async (command) => {
    if (await copyTextWithFallback(command)) {
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(""), 1600);
      return;
    }

    setCopiedCommand("");
  };

  return (
    <section
      id="artifact-freshness-panel"
      className="rounded-md border border-gray-200 bg-white p-5 shadow-sm"
      data-testid="artifact-freshness-panel"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Artifact freshness</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">
              {staleRows.length
                ? `${staleRows.length} saved report${staleRows.length === 1 ? "" : "s"} need refresh`
                : "Saved reports are fresh"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              These JSON artifacts power the admin health dashboard. Refreshing them keeps release review, route QA, and performance signals trustworthy.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getGateTone(
            staleRows.some((row) => row.status === "block") ? "block" : staleRows.length ? "warn" : "pass",
          )}`}
        >
          {staleRows.some((row) => row.status === "block") ? "Refresh needed" : staleRows.length ? "Watch" : "Fresh"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.key} className={`rounded-md border p-3 ${getGateSurface(row.status)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-950">{row.label}</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">{row.detail}</p>
                <p className="mt-2 text-xs font-semibold text-gray-500">Generated {formatDate(row.generatedAt)}</p>
              </div>
              <span className={`shrink-0 rounded border px-2 py-1 text-xs font-bold ${getGateTone(row.status)}`}>
                {formatArtifactAge(row.ageHours)}
              </span>
            </div>
            <div className="mt-3 flex items-stretch gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white">
                {row.command}
              </code>
              <button
                type="button"
                onClick={() => copyCommand(row.command)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                title={`Copy ${row.command}`}
                aria-label={`Copy refresh command for ${row.label}`}
              >
                {copiedCommand === row.command ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
