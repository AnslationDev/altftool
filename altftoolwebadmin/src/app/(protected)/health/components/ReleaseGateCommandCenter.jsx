"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Copy,
  ListChecks,
  RefreshCw,
  Route,
  ServerCog,
  XCircle,
} from "lucide-react";
import {
  formatDate,
  formatGateStatus,
  formatNumber,
  getGateSurface,
  getGateTone,
  getScoreTone,
} from "./healthFormatters";
import { copyTextWithFallback } from "./clipboard";

export default function ReleaseGateCommandCenter({ snapshot, onRefresh, refreshing, loading }) {
  const releaseGates = snapshot?.releaseGates || {};
  const releaseDoctor = snapshot?.releaseDoctor || {};
  const gates = releaseGates.gates || [];
  const [copiedFixCommand, setCopiedFixCommand] = useState("");
  const gateStatus = releaseGates.status || "blocked";
  const blockers = gates.filter((gate) => gate.status === "block");
  const watchItems = gates.filter((gate) => gate.status === "warn");
  const doctorCounts = releaseDoctor?.summary?.counts || {
    pass: releaseGates.passed || 0,
    warn: releaseGates.warning || 0,
    block: releaseGates.blocked || 0,
  };
  const doctorStatus = releaseDoctor.status || gateStatus;
  const strictDoctorStatus = releaseDoctor.strictStatus || (watchItems.length || blockers.length ? "blocked" : "ready");
  const doctorCommand = releaseDoctor.commands?.normal || "npm run release:doctor";
  const strictDoctorCommand = releaseDoctor.commands?.strict || "npm run release:doctor:strict";
  const doctorChecks = releaseDoctor.checks?.length
    ? releaseDoctor.checks
    : gates.map((gate) => ({
        ...gate,
        nextAction: gate.action,
      }));
  const actionChecks = doctorChecks.filter((check) => check.status !== "pass").slice(0, 6);
  const copyFixCommand = async (command) => {
    if (await copyTextWithFallback(command)) {
      setCopiedFixCommand(command);
      window.setTimeout(() => setCopiedFixCommand(""), 1600);
    }
  };
  const timeline = [
    {
      key: "snapshot",
      label: "Snapshot",
      value: formatDate(snapshot?.generatedAt),
      detail: snapshot?.cached ? "Cached response" : "Fresh response",
      status: snapshot?.cached ? "warn" : "pass",
      icon: Clock3,
    },
    {
      key: "manifest",
      label: "Manifest",
      value: formatDate(snapshot?.manifest?.generatedAt),
      detail: "Registry, QA, SEO, and content baseline",
      status: snapshot?.manifest?.generatedAt ? "pass" : "block",
      icon: ServerCog,
    },
    {
      key: "routeQa",
      label: "Route QA",
      value: formatDate(snapshot?.routeQa?.checkedAt),
      detail: `${formatNumber(snapshot?.routeQa?.totals?.routes)} routes tracked`,
      status: snapshot?.routeQa?.ok ? "pass" : snapshot?.routeQa?.checkedAt ? "warn" : "block",
      icon: Route,
    },
    {
      key: "blogAudit",
      label: "Blog Audit",
      value: formatDate(snapshot?.blogContent?.generatedAt),
      detail: `${formatNumber(snapshot?.blogContent?.totals?.ready)} ready blogs`,
      status: snapshot?.blogContent?.ok ? "pass" : Number(snapshot?.blogContent?.score || 0) >= 72 ? "warn" : "block",
      icon: BookOpenCheck,
    },
  ];

  return (
    <section id="release-gate-command-center" className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm rounded-md" data-testid="release-gate-command-center">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Release gates</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">
              {releaseGates.ready ? "Ready for release review" : `${formatGateStatus(gateStatus)} release state`}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {formatNumber(releaseGates.passed)}/{formatNumber(releaseGates.total)} gates passing.
              {blockers.length ? ` ${blockers.length} blocker${blockers.length === 1 ? "" : "s"} need fixing before deploy.` : ""}
              {watchItems.length ? ` ${watchItems.length} watch item${watchItems.length === 1 ? "" : "s"} should be reviewed.` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded border px-3 py-1.5 text-xs font-bold ${getGateTone(gateStatus)}`}>
            {formatGateStatus(gateStatus)}
          </span>
          <span className={`inline-flex rounded border px-3 py-1.5 text-xs font-bold ${getScoreTone(releaseGates.score || 0)}`}>
            {formatNumber(releaseGates.score)}/100
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh release gates"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh gates
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_1fr_1fr]" data-testid="release-doctor-summary">
        <div className="border border-[var(--border)] bg-[var(--surface-soft)] p-4 rounded-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Release doctor</p>
              <h3 className="mt-1 text-lg font-bold text-[var(--foreground)]">{formatGateStatus(doctorStatus)}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {formatNumber(doctorCounts.pass)} pass, {formatNumber(doctorCounts.warn)} warn,{" "}
                {formatNumber(doctorCounts.block)} block across the same release gate checks.
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded border px-2.5 py-1 text-xs font-bold ${
                doctorStatus === "blocked"
                  ? getGateTone("block")
                  : doctorStatus === "ready-with-warnings"
                    ? getGateTone("warn")
                    : getGateTone("pass")
              }`}
            >
              {formatGateStatus(doctorStatus)}
            </span>
          </div>
          <code className="mt-4 block overflow-x-auto rounded border border-[var(--border)] bg-[var(--foreground)] px-3 py-2 font-mono text-xs font-semibold text-[var(--background)]">
            {doctorCommand}
          </code>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface-soft)] p-4 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Strict CI gate</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-[var(--foreground)]">{formatGateStatus(strictDoctorStatus)}</p>
            <span
              className={`inline-flex rounded border px-2.5 py-1 text-xs font-bold ${
                strictDoctorStatus === "blocked" ? getGateTone("block") : getGateTone("pass")
              }`}
            >
              {strictDoctorStatus === "blocked" ? "Blocks CI" : "Can ship"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Strict mode treats warnings as blockers, so deploy jobs stop before production drift sneaks in.
          </p>
          <code className="mt-4 block overflow-x-auto rounded border border-[var(--border)] bg-[var(--foreground)] px-3 py-2 font-mono text-xs font-semibold text-[var(--background)]">
            {strictDoctorCommand}
          </code>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface-soft)] p-4 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Production signal</p>
          <p className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {formatNumber(releaseDoctor.sources?.productionScore || snapshot?.production?.score || 0)}/100
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-[var(--muted)]">
            {releaseDoctor.sources?.productionHealthUrl || snapshot?.production?.healthUrl || "Production health URL not configured"}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Last route QA: {formatDate(releaseDoctor.sources?.routeQaCheckedAt || snapshot?.routeQa?.checkedAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {timeline.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.key} className={`border p-3 rounded-md ${getGateSurface(item.status)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{item.label}</p>
                  <p className="mt-2 break-words text-sm font-bold text-[var(--foreground)]">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
                </div>
                <Icon className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {gates.map((gate) => {
          const GateIcon = gate.status === "pass" ? CheckCircle2 : gate.status === "warn" ? AlertTriangle : XCircle;

          return (
            <div key={gate.key} className="flex min-h-[156px] flex-col justify-between border border-[var(--border)] bg-[var(--surface-soft)] p-3 rounded-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--foreground)]">{gate.label}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{gate.detail}</p>
                </div>
                <GateIcon
                  className={`h-4 w-4 shrink-0 ${
                    gate.status === "pass"
                      ? "text-[var(--success)]"
                      : gate.status === "warn"
                        ? "text-[var(--warning)]"
                        : "text-[var(--danger)]"
                  }`}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded border px-2 py-1 text-xs font-bold ${getGateTone(gate.status)}`}>
                  {formatGateStatus(gate.status)}
                </span>
                <span className={`rounded border px-2 py-1 text-xs font-bold ${getScoreTone(gate.score)}`}>
                  {formatNumber(gate.score)}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{gate.action}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border border-[var(--border)] bg-[var(--surface-soft)] p-4 rounded-md" data-testid="release-doctor-fix-commands">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Fix commands</p>
            <h3 className="mt-1 text-sm font-bold text-[var(--foreground)]">
              {actionChecks.length ? `${formatNumber(actionChecks.length)} release action${actionChecks.length === 1 ? "" : "s"}` : "No release actions"}
            </h3>
          </div>
          <span className={`inline-flex rounded border px-2.5 py-1 text-xs font-bold ${getGateTone(doctorStatus === "blocked" ? "block" : doctorStatus === "ready-with-warnings" ? "warn" : "pass")}`}>
            {formatGateStatus(doctorStatus)}
          </span>
        </div>

        {actionChecks.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {actionChecks.map((check) => {
              const command = check.command || doctorCommand;

              return (
                <div key={check.key} className="border border-[var(--border)] bg-[var(--surface)] p-3 rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--foreground)]">{check.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{check.nextAction || check.detail}</p>
                    </div>
                    <span className={`shrink-0 rounded border px-2 py-1 text-xs font-bold ${getGateTone(check.status)}`}>
                      {formatGateStatus(check.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-stretch gap-2">
                    <code className="min-w-0 flex-1 overflow-x-auto rounded border border-[var(--border)] bg-[var(--foreground)] px-3 py-2 font-mono text-xs font-semibold text-[var(--background)]">
                      {command}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyFixCommand(command)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                      title={`Copy ${command}`}
                      aria-label={`Copy fix command for ${check.label}`}
                    >
                      {copiedFixCommand === command ? (
                        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 border border-[var(--success)]/20 bg-[var(--success-soft)] p-3 text-sm font-semibold text-[var(--success)] rounded-md">
            Release doctor has no active fix commands.
          </div>
        )}
      </div>
    </section>
  );
}
