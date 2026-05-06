"use client"

import { useState } from "react";
import { CheckCircle2, XCircle, Pencil, BookOpen } from "lucide-react";

export default function TaskInput({ isRunning, justCompleted, onTaskChange, locked }) {
  const [task, setTask] = useState("");
  const [confirmed, setConfirmed] = useState(false); 
  const [taskResult, setTaskResult] = useState(null);

  const handleChange = (e) => {
    setTask(e.target.value);
    onTaskChange?.(e.target.value);
  };

  const handleSet = () => {
    if (!task.trim()) return;
    setConfirmed(true); 
  };

  const handleComplete = (result) => {
    setTaskResult(result);
    setConfirmed(false);
    setTask("");
    onTaskChange?.("");
  };

  // ── State 3: Session complete → Task done? ──
  if (justCompleted && !taskResult && task) {
    return (
      <div className="bg-(--background) border border-(--border) rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={15} className="text-(--primary)" />
          <p className="text-sm font-bold font-primary text-(--foreground)">
            Task Completed?
          </p>
        </div>
        <p className="text-sm text-(--muted-foreground) font-secondary mb-4 truncate">
          &quot;{task}&quot;
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleComplete("done")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white font-primary font-bold text-sm cursor-pointer border-none hover:opacity-90 transition-all"
          >
            <CheckCircle2 size={16} />
            <span className="hidden sm:inline-flex">Yes, Done!</span>
          </button>
          <button
            onClick={() => handleComplete("skip")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--muted) text-(--muted-foreground) font-primary font-bold text-sm cursor-pointer border-none transition-all"
          >
            <XCircle size={16} />
            <span className="hidden sm:inline-flex">Not yet</span>
          </button>
        </div>
      </div>
    );
  }

  // ── State 2: Running → show banner ──
  if (isRunning && task && confirmed) {
    return (
      <div className="flex items-center gap-3 bg-(--background) border border-(--border) rounded-xl px-4 py-3 mb-4">
        <BookOpen size={15} className="text-(--primary) shrink-0" />
        <p className="text-sm font-secondary text-(--foreground) truncate flex-1">
          Working on: <span className="font-bold text-(--primary)">{task}</span>
        </p>
      </div>
    );
  }

  // ── Confirmed but not running → show summary ──
  if (confirmed && !isRunning) {
    return (
      <div className="flex items-center justify-between bg-(--background) border border-(--border) rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-(--primary) shrink-0" />
          <p className="text-sm font-secondary text-(--foreground) truncate">
            <span className="font-bold text-(--primary)">{task}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setConfirmed(false); // ← edit
          }}
          className="text-xs font-primary font-bold text-(--primary) cursor-pointer bg-transparent border-none hover:underline shrink-0"
        >
          Edit
        </button>
      </div>
    );
  }

  // ── State 1: Idle → input ──
  if (isRunning) return null;

  return (
    <div className="bg-(--background) border border-(--border) rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Pencil size={15} className="text-(--primary) shrink-0 hidden sm:inline-flex" />
        <p className="text-sm font-bold font-primary text-(--foreground) leading-tight">
          What are you working on?
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="e.g. Build landing page"
          value={task}
          onChange={handleChange}
          maxLength={60}
          onKeyDown={(e) => e.key === "Enter" && handleSet()}
           disabled={locked}
          className={`flex-1 px-3 py-2.5 rounded-lg border border-(--border) bg-(--muted) text-(--foreground) text-sm font-secondary outline-none focus:border-(--primary) transition-all
          ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        {task && (
          <button
            onClick={() => handleSet(task)}
            className="sm:px-4 sm:py-2 px-2 py-2 rounded-lg bg-(--primary) text-white font-primary font-bold text-sm cursor-pointer border-none hover:opacity-90 transition-all shrink-0"
          >
            Set
          </button>
        )}
      </div>

      {task && (
        <p className="text-xs text-(--muted-foreground) font-secondary mt-2">
          {60 - task.length} characters remaining
        </p>
      )}
    </div>
  );
}