"use client";

import { useMemo, useState } from "react";
import { Check, CheckCheck, ShieldAlert, Wand2, X } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  approveProposal,
  bulkApproveProposals,
  isHighRiskProposal,
  rejectProposal,
  triggerSeoGeneration,
} from "../services/automationService";
import { EmptyState, GhostButton, PanelCard, PrimaryButton, StatusChip, formatWhen } from "./shared";

function DiffRow({ label, before, after }) {
  if (!after) return null;
  const changed = String(before || "") !== String(after || "");
  return (
    <div className="grid gap-1 rounded-lg bg-surface-soft/60 p-2.5 sm:grid-cols-[90px_1fr]">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
      <div className="min-w-0 space-y-1">
        {changed && before ? (
          <p className="truncate text-xs text-muted line-through">{String(before)}</p>
        ) : null}
        <p className="text-xs font-medium text-foreground">{String(after)}</p>
      </div>
    </div>
  );
}

function ProposalCard({ proposal, adminEmail, onRefresh, selected, onToggleSelect }) {
  const [busy, setBusy] = useState("");
  const { current = {}, proposed = {} } = proposal;
  const highRisk = isHighRiskProposal(proposal);

  const act = async (kind, fn, message) => {
    setBusy(kind);
    try {
      await fn();
      emitAlert({ type: "success", message });
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setBusy("");
    }
  };

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {proposal.status === "pending" ? (
            <input
              type="checkbox"
              checked={Boolean(selected)}
              disabled={highRisk}
              onChange={() => onToggleSelect?.(proposal.id)}
              aria-label={`Select proposal for ${proposal.path}`}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)] disabled:opacity-40"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{proposal.path}</p>
            <p className="mt-0.5 text-xs text-muted">
              {proposal.pageType} · {formatWhen(proposal.createdAt)}
              {proposal.rationale ? ` — ${proposal.rationale}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {highRisk ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-[11px] font-semibold text-danger">
              <ShieldAlert className="h-3 w-3" />
              High risk
            </span>
          ) : null}
          <StatusChip status={proposal.status} />
        </div>
      </div>

      <div className="space-y-2">
        <DiffRow label="Title" before={current.title} after={proposed.title} />
        <DiffRow label="Description" before={current.description} after={proposed.description} />
        <DiffRow label="Keywords" before={(current.keywords || []).join(", ")} after={(proposed.keywords || []).join(", ")} />
        <DiffRow label="OG title" before={current.og?.title} after={proposed.og?.title} />
        <DiffRow label="OG desc" before={current.og?.description} after={proposed.og?.description} />
        <DiffRow
          label="Schema"
          before={current.schema ? `${current.schema.length} block(s)` : ""}
          after={proposed.schema ? proposed.schema.map((s) => s["@type"]).join(", ") : ""}
        />
      </div>

      {proposal.gscSnapshot?.topQueries?.length ? (
        <p className="mt-3 rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary">
          Top queries: {proposal.gscSnapshot.topQueries.map((q) => q.query).slice(0, 4).join(" · ")}
        </p>
      ) : null}

      {proposal.status === "pending" ? (
        <div className="mt-4 flex justify-end gap-2">
          <GhostButton
            tone="text-danger"
            disabled={busy !== ""}
            onClick={() => act("reject", () => rejectProposal(proposal.id, adminEmail), "Proposal rejected.")}
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </GhostButton>
          <PrimaryButton
            disabled={busy !== ""}
            onClick={() =>
              act("approve", () => approveProposal(proposal, adminEmail), `Applied to ${proposal.path} via SEO config.`)
            }
          >
            <Check className="h-3.5 w-3.5" />
            {busy === "approve" ? "Applying…" : "Approve & apply"}
          </PrimaryButton>
        </div>
      ) : null}
    </li>
  );
}

export default function ProposalsPanel({ proposals, onRefresh, adminEmail }) {
  const [generating, setGenerating] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const filtered = proposals.filter((p) => (filter === "all" ? true : p.status === filter));
  const selectable = useMemo(
    () => filtered.filter((p) => p.status === "pending" && !isHighRiskProposal(p)),
    [filtered],
  );
  const selected = useMemo(
    () => selectable.filter((p) => selectedIds.has(p.id)),
    [selectable, selectedIds],
  );

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size >= selectable.length ? new Set() : new Set(selectable.map((p) => p.id)),
    );

  const handleBulkApprove = async () => {
    if (!selected.length) return;
    setBulkBusy(true);
    try {
      const { applied } = await bulkApproveProposals(selected, adminEmail);
      emitAlert({ type: "success", message: `${applied} proposal(s) applied via SEO config.` });
      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { result } = await triggerSeoGeneration({ count: 3 });
      if (result?.skipped) emitAlert({ type: "warning", message: `Skipped: ${result.reason}` });
      else emitAlert({ type: "success", message: `${result?.created?.length || 0} proposal(s) generated.` });
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PanelCard
      title={`SEO proposals (${filtered.length})`}
      caption="Approve applies through the audited SEO config path — the same save the Pages editor uses."
      actions={
        <>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter proposals"
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="applied">Applied</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <PrimaryButton onClick={handleGenerate} disabled={generating}>
            <Wand2 className="h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate 3 now"}
          </PrimaryButton>
        </>
      }
    >
      {selectable.length > 1 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-soft/60 px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
            <input
              type="checkbox"
              checked={selectedIds.size > 0 && selectedIds.size >= selectable.length}
              onChange={toggleSelectAll}
              aria-label="Select all safe pending proposals"
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Select all safe ({selectable.length})
          </label>
          <PrimaryButton onClick={handleBulkApprove} disabled={bulkBusy || !selected.length}>
            <CheckCheck className="h-3.5 w-3.5" />
            {bulkBusy ? "Applying…" : `Approve ${selected.length || ""} selected`}
          </PrimaryButton>
        </div>
      ) : null}

      {!filtered.length ? (
        <EmptyState message="No proposals here. Generate some — the priority scorer picks the weakest pages first." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              adminEmail={adminEmail}
              onRefresh={onRefresh}
              selected={selectedIds.has(proposal.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
