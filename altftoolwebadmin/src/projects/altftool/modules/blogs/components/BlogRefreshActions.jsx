"use client";

import {
  BookOpenCheck,
  CalendarCheck2,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  buildRefreshChecklistBlock,
  buildRefreshNoteBlock,
  buildReviewFields,
  buildSourceNoteFields,
  buildSourceReminderBlock,
} from "./blogRefreshKit";
import BlogHelperToggleButton from "./BlogHelperToggleButton";
import {
  clearedFields,
  fieldsMatch,
  hasMarkedBlock,
  removeMarkedBlock,
  wrapMarkedBlock,
} from "./blogToggleBlocks";

const REFRESH_MARKER_PREFIX = "ALTFT_REFRESH_ACTION";

export default function BlogRefreshActions({
  formData = {},
  onApplyFields,
  onInsertBlock,
}) {
  const markReviewed = () => {
    const fields = buildReviewFields(formData);
    const attached = Boolean(formData.reviewedAt) || fieldsMatch(formData, fields);
    onApplyFields?.(attached ? clearedFields(fields) : fields);
    emitAlert({ type: "success", message: attached ? "Review metadata removed." : "Review metadata updated." });
  };

  const addSourceNote = () => {
    const fields = buildSourceNoteFields(formData);
    const attached = fieldsMatch(formData, fields);
    onApplyFields?.(attached ? clearedFields(fields) : fields);
    emitAlert({ type: "success", message: attached ? "Source note removed." : "Source note added." });
  };

  const toggleBlock = ({ id, label, html }) => {
    const attached = hasMarkedBlock(formData.description, REFRESH_MARKER_PREFIX, id);
    if (attached) {
      onInsertBlock?.({
        description: removeMarkedBlock(formData.description, REFRESH_MARKER_PREFIX, id),
      });
      emitAlert({ type: "success", message: `${label} removed.` });
      return;
    }

    onInsertBlock?.(wrapMarkedBlock(REFRESH_MARKER_PREFIX, id, html));
    emitAlert({ type: "success", message: `${label} inserted.` });
  };

  const reviewFields = buildReviewFields(formData);
  const sourceNoteFields = buildSourceNoteFields(formData);
  const reviewAttached = Boolean(formData.reviewedAt) || fieldsMatch(formData, reviewFields);
  const sourceNoteAttached = fieldsMatch(formData, sourceNoteFields);
  const refreshNoteAttached = hasMarkedBlock(formData.description, REFRESH_MARKER_PREFIX, "refresh-note");
  const checklistAttached = hasMarkedBlock(formData.description, REFRESH_MARKER_PREFIX, "review-checklist");
  const sourceReminderAttached = hasMarkedBlock(formData.description, REFRESH_MARKER_PREFIX, "source-reminder");

  const insertChecklist = () => {
    toggleBlock({
      id: "review-checklist",
      label: "Refresh checklist",
      html: buildRefreshChecklistBlock(formData),
    });
  };

  const insertSourceReminder = () => {
    toggleBlock({
      id: "source-reminder",
      label: "Source reminder",
      html: buildSourceReminderBlock(),
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <RefreshCw className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-muted">Refresh Actions</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Quick editorial actions for stale posts, source checks, and update notes.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <BlogHelperToggleButton
          icon={CalendarCheck2}
          label="Mark reviewed today"
          caption="Sets reviewed date, reviewer, and a trust note."
          attached={reviewAttached}
          onClick={markReviewed}
          onToggle={markReviewed}
        />
        <BlogHelperToggleButton
          icon={BookOpenCheck}
          label="Add source note"
          caption="Fills the source review note used on public pages."
          attached={sourceNoteAttached}
          onToggle={addSourceNote}
        />
        <BlogHelperToggleButton
          icon={FileCheck2}
          label="Insert refresh note"
          caption="Adds a visible update note inside the article."
          attached={refreshNoteAttached}
          onToggle={() =>
            toggleBlock({
              id: "refresh-note",
              label: "Refresh note",
              html: buildRefreshNoteBlock(formData),
            })
          }
        />
        <BlogHelperToggleButton
          icon={ShieldCheck}
          label="Insert review checklist"
          caption="Adds a scannable list of what changed."
          attached={checklistAttached}
          onToggle={insertChecklist}
        />
        <BlogHelperToggleButton
          icon={BookOpenCheck}
          label="Insert source reminder"
          caption="Adds reader-safe context for changing details."
          attached={sourceReminderAttached}
          onToggle={insertSourceReminder}
        />
      </div>
    </div>
  );
}
