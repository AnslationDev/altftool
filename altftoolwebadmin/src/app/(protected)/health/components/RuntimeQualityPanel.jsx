"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Database, Gauge, Route } from "lucide-react";
import { DetailTile } from "./HealthShared";
import { copyTextWithFallback } from "./clipboard";
import {
  formatDate,
  formatDuration,
  formatGateStatus,
  formatNumber,
  getGateTone,
  getScoreTone,
} from "./healthFormatters";

export default function RuntimeQualityPanel({ runtimeQuality }) {
  const [copiedCommand, setCopiedCommand] = useState("");
  const gates = runtimeQuality?.gates || [];
  const combinedCommand = runtimeQuality?.commands?.combined || "npm run validate:runtime-quality";
  const isReady = Boolean(runtimeQuality?.ok);
  const copyCommand = async (command) => {
    if (await copyTextWithFallback(command)) {
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(""), 1600);
      return;
    }

    setCopiedCommand("");
  };

  return (
    <section id="runtime-quality-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="runtime-quality-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-gray-950 text-white">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Runtime quality</p>
            <h2 className="mt-1 text-xl font-bold text-gray-950">
              {isReady ? "Strict runtime gates are clean" : "Strict runtime gates need review"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Route QA, Firebase live data, Firebase integrity, and performance budgets are grouped here as the fast runtime release gate.
              Generated {formatDate(runtimeQuality?.generatedAt)}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded border px-3 py-1.5 text-xs font-bold ${getGateTone(isReady ? "pass" : "block")}`}>
            {formatGateStatus(runtimeQuality?.status)}
          </span>
          <span className={`inline-flex rounded border px-3 py-1.5 text-xs font-bold ${getScoreTone(runtimeQuality?.score || 0)}`}>
            {formatNumber(runtimeQuality?.score)}/100
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DetailTile
          label="Gate Summary"
          value={`${formatNumber(runtimeQuality?.summary?.pass)}/${formatNumber(runtimeQuality?.summary?.total)} passing`}
          tone={isReady ? "emerald" : "rose"}
        />
        <DetailTile
          label="Blocked Gates"
          value={formatNumber(runtimeQuality?.summary?.block)}
          tone={runtimeQuality?.summary?.block ? "rose" : "emerald"}
        />
        <div className="min-w-0 rounded-md border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Combined Command</p>
          <div className="mt-2 flex items-stretch gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white">
              {combinedCommand}
            </code>
            <button
              type="button"
              onClick={() => copyCommand(combinedCommand)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              title={`Copy ${combinedCommand}`}
              aria-label="Copy runtime quality command"
            >
              {copiedCommand === combinedCommand ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {gates.map((gate) => {
          const isFirebaseGate = gate.key?.includes("firebase");
          const isPerformanceGate = gate.key?.includes("performance");
          const GateIcon = isFirebaseGate ? Database : isPerformanceGate ? Gauge : Route;
          const gateFailures = gate.failures || [];

          return (
            <div
              key={gate.key}
              className={`border p-4 rounded-md ${gate.ok ? "border-emerald-100 bg-emerald-50" : "border-rose-100 bg-rose-50"}`}
              data-testid={`runtime-quality-${gate.key}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-gray-700 shadow-sm">
                    <GateIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-950">{gate.label}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">{gate.detail}</p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 rounded border px-2.5 py-1 text-xs font-bold ${getGateTone(gate.status)}`}>
                  {formatGateStatus(gate.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {isPerformanceGate ? (
                  <>
                    <DetailTile label="Images" value={formatNumber(gate.totals?.publicImages)} />
                    <DetailTile label="Lazy tools" value={formatNumber(gate.totals?.dynamicToolImports)} tone="emerald" />
                    <DetailTile label="Eager imports" value={formatNumber(gate.totals?.directToolImportFiles)} tone={gate.totals?.directToolImportFiles ? "rose" : "emerald"} />
                  </>
                ) : isFirebaseGate ? (
                  <>
                    <DetailTile label="Reads" value={`${formatNumber(gate.passingChecks)}/${formatNumber(gate.totalChecks)}`} tone={gate.ok ? "emerald" : "rose"} />
                    <DetailTile label="Duration" value={formatDuration(gate.durationMs)} />
                    <DetailTile label="Project" value={gate.projectId || "unknown"} mono />
                  </>
                ) : (
                  <>
                    <DetailTile label="Routes" value={formatNumber(gate.totals?.routes)} />
                    <DetailTile label="Warnings" value={formatNumber(gate.totals?.warnings)} tone={gate.totals?.warnings ? "rose" : "emerald"} />
                    <DetailTile label="Slow" value={formatNumber(gate.totals?.slowRoutes)} tone={gate.totals?.slowRoutes ? "rose" : "emerald"} />
                  </>
                )}
              </div>

              <div className="mt-4 grid gap-2 xl:grid-cols-2">
                {[gate.command, gate.artifactCommand].filter(Boolean).map((command) => (
                  <div key={command} className="flex items-stretch gap-2">
                    <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white">
                      {command}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyCommand(command)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                      title={`Copy ${command}`}
                      aria-label={`Copy command for ${gate.label}`}
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

              {gateFailures.length ? (
                <div className="mt-4 space-y-2">
                  {gateFailures.slice(0, 4).map((failure) => (
                    <p key={failure} className="break-words text-xs font-semibold text-rose-700">
                      {failure}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700">
                  Strict gate is passing.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
