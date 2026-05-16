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

function ActionButton({ icon: Icon, label, caption, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-800 group-hover:text-blue-700">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-gray-500">{caption}</span>
      </span>
    </button>
  );
}

export default function BlogRefreshActions({
  formData = {},
  onApplyFields,
  onInsertBlock,
}) {
  const markReviewed = () => {
    onApplyFields?.(buildReviewFields(formData));
    emitAlert({ type: "success", message: "Review metadata updated." });
  };

  const addSourceNote = () => {
    onApplyFields?.(buildSourceNoteFields(formData));
    emitAlert({ type: "success", message: "Source note added." });
  };

  const insertRefreshNote = () => {
    onInsertBlock?.(buildRefreshNoteBlock(formData));
    emitAlert({ type: "success", message: "Refresh note inserted." });
  };

  const insertChecklist = () => {
    onInsertBlock?.(buildRefreshChecklistBlock(formData));
    emitAlert({ type: "success", message: "Refresh checklist inserted." });
  };

  const insertSourceReminder = () => {
    onInsertBlock?.(buildSourceReminderBlock());
    emitAlert({ type: "success", message: "Source reminder inserted." });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <RefreshCw className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Refresh Actions</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Quick editorial actions for stale posts, source checks, and update notes.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <ActionButton
          icon={CalendarCheck2}
          label="Mark reviewed today"
          caption="Sets reviewed date, reviewer, and a trust note."
          onClick={markReviewed}
        />
        <ActionButton
          icon={BookOpenCheck}
          label="Add source note"
          caption="Fills the source review note used on public pages."
          onClick={addSourceNote}
        />
        <ActionButton
          icon={FileCheck2}
          label="Insert refresh note"
          caption="Adds a visible update note inside the article."
          onClick={insertRefreshNote}
        />
        <ActionButton
          icon={ShieldCheck}
          label="Insert review checklist"
          caption="Adds a scannable list of what changed."
          onClick={insertChecklist}
        />
        <ActionButton
          icon={BookOpenCheck}
          label="Insert source reminder"
          caption="Adds reader-safe context for changing details."
          onClick={insertSourceReminder}
        />
      </div>
    </div>
  );
}
