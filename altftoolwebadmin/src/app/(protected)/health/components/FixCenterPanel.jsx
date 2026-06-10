"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Wrench } from "lucide-react";
import { DetailTile } from "./HealthShared";
import { copyTextWithFallback } from "./clipboard";
import { formatGateStatus, formatNumber, getGateTone } from "./healthFormatters";

export default function FixCenterPanel({ fixCenter }) {
  const [copiedCommand, setCopiedCommand] = useState("");
  const items = fixCenter?.items || [];
  const topCommands = fixCenter?.topCommands || [];
  const copyCommand = async (command) => {
    if (await copyTextWithFallback(command)) {
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(""), 1600);
      return;
    }

    setCopiedCommand("");
  };

  return (
    <section id="fix-center-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="fix-center-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fix center</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Prioritized Release Actions</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Release blockers, warnings, and saved-artifact actions normalized into one queue.
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getGateTone(fixCenter?.status === "blocked" ? "block" : fixCenter?.status === "watch" ? "warn" : "pass")}`}>
          {formatGateStatus(fixCenter?.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailTile label="Fix score" value={`${formatNumber(fixCenter?.score)}/100`} tone={(fixCenter?.score || 0) >= 90 ? "emerald" : (fixCenter?.score || 0) >= 75 ? "amber" : "rose"} />
        <DetailTile label="Open actions" value={formatNumber(fixCenter?.counts?.total)} tone={fixCenter?.counts?.total ? "amber" : "emerald"} />
        <DetailTile label="Blockers" value={formatNumber(fixCenter?.counts?.block)} tone={fixCenter?.counts?.block ? "rose" : "emerald"} />
        <DetailTile label="Warnings" value={formatNumber(fixCenter?.counts?.warn)} tone={fixCenter?.counts?.warn ? "amber" : "emerald"} />
      </div>

      {items.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {items.slice(0, 8).map((item) => (
            <div key={item.key} className={`border p-3 rounded-md ${item.status === "block" ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-950">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">{item.detail}</p>
                </div>
                <span className={`shrink-0 rounded border px-2 py-1 text-xs font-bold ${getGateTone(item.status)}`}>
                  {formatGateStatus(item.status)}
                </span>
              </div>
              {item.nextAction ? <p className="mt-3 text-xs font-semibold leading-5 text-gray-700">{item.nextAction}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {item.targetHref ? (
                  <a
                    href={item.targetHref}
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    View {item.targetLabel || "panel"}
                  </a>
                ) : null}
                {item.adminPath ? (
                  <a
                    href={item.adminPath}
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    {item.adminLabel || "Open module"}
                  </a>
                ) : null}
              </div>
              {item.command ? (
                <div className="mt-3 flex items-stretch gap-2">
                  <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white">
                    {item.command}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCommand(item.command)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                    title={`Copy ${item.command}`}
                    aria-label={`Copy ${item.command}`}
                  >
                    {copiedCommand === item.command ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          No release fix actions are open.
        </div>
      )}

      {topCommands.length ? (
        <div className="mt-4 border border-gray-100 bg-gray-50 p-3 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fast command stack</p>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {topCommands.map((command) => (
              <code key={command} className="overflow-x-auto rounded border border-gray-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-gray-700">
                {command}
              </code>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
