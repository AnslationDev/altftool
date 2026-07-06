"use client";

import { useState } from "react";
import { ListPlus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { emitAlert } from "@/lib/alertBus";
import { addTopics, deleteTopic, retryTopic, triggerBlogGeneration, updateTopic } from "../services/automationService";
import { EmptyState, GhostButton, PanelCard, PrimaryButton, StatusChip, formatWhen } from "./shared";

export default function TopicQueuePanel({ topics, onRefresh, adminEmail }) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);

  const queue = topics.filter((t) => t.status !== "suggested");

  const handleAdd = async () => {
    const lines = draft.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setBusy(true);
    try {
      const added = await addTopics(lines, { createdBy: adminEmail });
      emitAlert({ type: "success", message: `${added} topic${added === 1 ? "" : "s"} added to the queue.` });
      setDraft("");
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { result } = await triggerBlogGeneration(1);
      if (result?.skipped) {
        emitAlert({ type: "warning", message: `Skipped: ${result.reason}` });
      } else {
        const ok = result?.created?.length || 0;
        const bad = result?.failed?.length || 0;
        emitAlert({
          type: ok ? "success" : "warning",
          message: `Generation finished — ${ok} draft${ok === 1 ? "" : "s"} created${bad ? `, ${bad} failed` : ""}.`,
        });
      }
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setGenerating(false);
    }
  };

  const act = async (fn, message) => {
    try {
      await fn();
      if (message) emitAlert({ type: "success", message });
      onRefresh();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    }
  };

  return (
    <div className="space-y-5">
      <PanelCard
        title="Add topics"
        caption="One topic per line (min 8 characters). The cron picks pending topics by priority, then oldest first."
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder={"How to merge PDF files on mobile\nBest free image compressors compared"}
          className="w-full rounded-xl border border-border bg-surface-soft/60 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <div className="mt-3 flex justify-end">
          <PrimaryButton onClick={handleAdd} disabled={busy || !draft.trim()}>
            <ListPlus className="h-3.5 w-3.5" />
            Add to queue
          </PrimaryButton>
        </div>
      </PanelCard>

      <PanelCard
        title={`Queue (${queue.length})`}
        caption="Drafts land in All Blogs with status “In review”."
        actions={
          <PrimaryButton onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate 1 now"}
          </PrimaryButton>
        }
      >
        {!queue.length ? (
          <EmptyState message="No topics in the queue yet. Add a few above — the hourly cron does the rest." />
        ) : (
          <ul className="divide-y divide-border">
            {queue.map((topic) => (
              <li key={topic.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{topic.topic}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {topic.source === "trending" ? "From trending · " : ""}
                    Added {formatWhen(topic.createdAt)}
                    {topic.error ? <span className="text-danger"> · {topic.error}</span> : null}
                  </p>
                </div>
                <StatusChip status={topic.status} />
                <div className="flex items-center gap-1.5">
                  {topic.status === "done" && topic.blogId ? (
                    <Link
                      href={`/altftool/blogs/edit-blog/${topic.blogId}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary"
                    >
                      Open draft
                    </Link>
                  ) : null}
                  {topic.status === "failed" ? (
                    <GhostButton onClick={() => act(() => retryTopic(topic.id), "Topic re-queued.")}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry
                    </GhostButton>
                  ) : null}
                  {topic.status === "pending" ? (
                    <GhostButton
                      onClick={() =>
                        act(() => updateTopic(topic.id, { priority: (Number(topic.priority) || 0) + 1 }))
                      }
                    >
                      Priority +{Number(topic.priority) || 0}
                    </GhostButton>
                  ) : null}
                  <GhostButton tone="text-danger" onClick={() => act(() => deleteTopic(topic.id), "Topic deleted.")}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </GhostButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
    </div>
  );
}
