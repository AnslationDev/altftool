"use client";

import { useState } from "react";
import { ArrowUpRight, TrendingUp, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { deleteTopic, promoteTopic, triggerRun } from "../services/automationService";
import { EmptyState, GhostButton, PanelCard, PrimaryButton, formatWhen } from "./shared";

export default function TrendingPanel({ topics, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const suggestions = topics.filter((t) => t.status === "suggested");

  const handleScan = async () => {
    setBusy(true);
    try {
      const { results } = await triggerRun({ lanes: ["trending"] });
      const lane = results?.trending;
      if (lane?.skipped) emitAlert({ type: "warning", message: `Skipped: ${lane.reason}` });
      else emitAlert({ type: "success", message: `${lane?.created?.length || 0} rising quer${(lane?.created?.length || 0) === 1 ? "y" : "ies"} filed as suggestions.` });
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn, message) => {
    try {
      await fn();
      emitAlert({ type: "success", message });
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    }
  };

  return (
    <PanelCard
      title={`Trending suggestions (${suggestions.length})`}
      caption="Rising Search Console queries (last window vs previous). Promote the good ones into the blog queue."
      actions={
        <PrimaryButton onClick={handleScan} disabled={busy}>
          <TrendingUp className="h-3.5 w-3.5" />
          {busy ? "Scanning…" : "Scan GSC now"}
        </PrimaryButton>
      }
    >
      {!suggestions.length ? (
        <EmptyState message="No suggestions yet. Run a scan — needs Search Console connected and the trending lane enabled." />
      ) : (
        <ul className="divide-y divide-border">
          {suggestions.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{item.topic}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {item.gscSnapshot
                    ? `${item.gscSnapshot.impressions} impressions · pos ${item.gscSnapshot.position} · ${
                        item.gscSnapshot.growth === null ? "new query" : `${item.gscSnapshot.growth}× growth`
                      } · `
                    : ""}
                  {formatWhen(item.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <PrimaryButton onClick={() => act(() => promoteTopic(item.id), "Added to the blog queue.")}>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Queue it
                </PrimaryButton>
                <GhostButton tone="text-danger" onClick={() => act(() => deleteTopic(item.id), "Suggestion dismissed.")}>
                  <Trash2 className="h-3.5 w-3.5" />
                </GhostButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
