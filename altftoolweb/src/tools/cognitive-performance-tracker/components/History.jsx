"use client";

import { useState, useCallback } from "react";
import {
  HistoryIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  FileText,
  AlertCircle,
} from "lucide-react";
import { calculateDailyScore } from "../utils/analytics";
import { exportAllData, importData } from "../utils/storage";

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function History({ checkIns, onRemove }) {
  const [expanded, setExpanded] = useState(null);
  const [importMsg, setImportMsg] = useState("");

  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));

  const handleExportJSON = useCallback(() => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognitive-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (checkIns.length === 0) return;
    const headers = ["Date", "Sleep", "Water", "Mood", "Energy", "Study", "Work", "Exercise", "Meditation", "Score", "Notes"];
    const rows = sorted.map((c) => [
      c.date,
      c.sleepHours || 0,
      c.waterIntake || 0,
      c.mood || 0,
      c.energyLevel || 0,
      c.studyHours || 0,
      c.workHours || 0,
      c.exercise || 0,
      c.meditation || 0,
      calculateDailyScore(c),
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognitive-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [checkIns, sorted]);

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target.result);
      setImportMsg(ok ? "Data imported successfully! Refresh the page." : "Invalid file format.");
      setTimeout(() => setImportMsg(""), 3000);
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard
        title="History"
        icon={HistoryIcon}
        action={
          <span className="text-sm text-[var(--muted-foreground)]">{checkIns.length} entries</span>
        }
      >
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <HistoryIcon className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">No History</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Start checking in to build your history.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((entry) => {
              const score = calculateDailyScore(entry);
              const isExpanded = expanded === entry.date;

              return (
                <div key={entry.date} className="rounded-xl border border-[var(--border)] overflow-hidden">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpanded(isExpanded ? null : entry.date)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(isExpanded ? null : entry.date); }}
                    className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-[var(--section-highlight)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-sm font-extrabold text-[var(--primary)]">
                        {score}%
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">{entry.date}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Sleep: {entry.sleepHours || 0}h | Mood: {entry.mood || 0}/5 | Energy: {entry.energyLevel || 0}/5
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(entry.date);
                        }}
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[var(--border)] bg-[var(--section-highlight)] p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Sleep</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.sleepHours || 0} hrs</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Water</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.waterIntake || 0} glasses</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Mood</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.mood || 0}/5</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Energy</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.energyLevel || 0}/5</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Study</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.studyHours || 0} hrs</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Work</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.workHours || 0} hrs</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Exercise</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.exercise || 0} min</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Meditation</span>
                          <p className="font-bold text-[var(--foreground)]">{entry.meditation || 0} min</p>
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="mt-3 rounded-lg bg-[var(--card)] p-3">
                          <span className="text-xs font-bold text-[var(--muted-foreground)]">Notes</span>
                          <p className="mt-1 text-sm text-[var(--foreground)]">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Backup & Restore" icon={Download}>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportJSON} className="btn-secondary rounded-lg px-4 py-2 text-sm">
            <Download className="mr-1.5 inline h-4 w-4" />
            Export JSON
          </button>
          <button onClick={handleExportCSV} className="btn-secondary rounded-lg px-4 py-2 text-sm">
            <FileText className="mr-1.5 inline h-4 w-4" />
            Export CSV
          </button>
          <label className="btn-secondary inline-flex cursor-pointer rounded-lg px-4 py-2 text-sm">
            <Upload className="mr-1.5 inline h-4 w-4" />
            Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        {importMsg && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--primary)]">
            <AlertCircle className="h-4 w-4" />
            {importMsg}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
