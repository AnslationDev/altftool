"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ListChecks, XCircle } from "lucide-react";
import { DetailTile } from "./HealthShared";
import { copyTextWithFallback } from "./clipboard";
import {
  formatDate,
  formatDuration,
  formatGateStatus,
  formatNumber,
  getGateTone,
} from "./healthFormatters";

export default function ReleaseDoctorArtifactPanel({ releaseDoctorArtifact }) {
  const [copiedCommand, setCopiedCommand] = useState("");
  const checks = releaseDoctorArtifact?.checks || [];
  const qualityChecks = releaseDoctorArtifact?.qualityChecks || [];
  const counts = releaseDoctorArtifact?.summary?.counts || { pass: 0, warn: 0, block: 0 };
  const status = releaseDoctorArtifact?.status || "unknown";
  const score = releaseDoctorArtifact?.score || 0;
  const actionChecks = checks.filter((check) => check.status !== "pass");
  const copyCommand = async (command) => {
    if (await copyTextWithFallback(command)) {
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(""), 1600);
      return;
    }

    setCopiedCommand("");
  };

  return (
    <section id="release-doctor-artifact-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md xl:col-span-2" data-testid="release-doctor-artifact-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Release doctor</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Saved Artifact</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Last saved release doctor report from {formatDate(releaseDoctorArtifact?.generatedAt)}.
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getGateTone(status === "blocked" ? "block" : status === "ready-with-warnings" ? "warn" : status === "ready" ? "pass" : "warn")}`}>
          {formatGateStatus(status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DetailTile label="Score" value={`${formatNumber(score)}/100`} tone={score >= 90 ? "emerald" : score >= 75 ? "amber" : "rose"} />
        <DetailTile label="Pass" value={formatNumber(counts.pass)} tone="emerald" />
        <DetailTile label="Warn" value={formatNumber(counts.warn)} tone={counts.warn ? "amber" : "emerald"} />
        <DetailTile label="Block" value={formatNumber(counts.block)} tone={counts.block ? "rose" : "emerald"} />
        <DetailTile label="Duration" value={formatDuration(releaseDoctorArtifact?.durationMs)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">
          {releaseDoctorArtifact?.strict ? "Strict mode" : "Standard mode"}
        </span>
        <span className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">
          {releaseDoctorArtifact?.offline ? "Offline artifact" : "Live artifact"}
        </span>
      </div>

      {actionChecks.length ? (
        <div className="mt-4 border border-amber-100 bg-amber-50 p-3 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Open release actions</p>
          <div className="mt-2 space-y-2">
            {actionChecks.slice(0, 5).map((check) => (
              <p key={check.key} className="break-words text-xs font-semibold text-amber-800">
                {check.label}: {check.nextAction || check.detail}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Saved release doctor artifact has no open release actions.
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {[releaseDoctorArtifact?.artifactCommand, releaseDoctorArtifact?.strictCommand].filter(Boolean).map((command) => (
          <div key={command} className="flex items-stretch gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white">
              {command}
            </code>
            <button
              type="button"
              onClick={() => copyCommand(command)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              title={`Copy ${command}`}
              aria-label={`Copy ${command}`}
            >
              {copiedCommand === command ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto border border-gray-100 rounded-md">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Check</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {checks.slice(0, 8).map((check) => (
              <tr key={check.key}>
                <td className="px-3 py-2">
                  <p className="font-semibold text-gray-950">{check.label}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{check.detail}</p>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded border px-2 py-1 text-xs font-semibold ${getGateTone(check.status)}`}>
                    {formatGateStatus(check.status)}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold text-gray-700">{formatNumber(check.score)}</td>
                <td className="px-3 py-2">
                  {check.command ? <code className="break-all font-mono text-xs text-gray-600">{check.command}</code> : <span className="text-xs text-gray-400">n/a</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-md">
        {qualityChecks.map((check) => (
          <div key={check.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{check.label}</p>
              <p className="mt-1 break-words text-xs text-gray-500">{check.detail}</p>
            </div>
            {check.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
