import React, { useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { resetProjectData } from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";

export default function AlphobiaModuleLayout({ children, title, subtitle }) {
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    const confirm = window.confirm(
      "Are you absolutely sure you want to reset all project data back to its original state? All custom edits will be permanently deleted."
    );
    if (!confirm) return;

    setResetting(true);
    try {
      await resetProjectData();
      emitAlert({
        type: "success",
        message: "Project database successfully reset to default state!",
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      emitAlert({
        type: "error",
        message: "Failed to reset project database.",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header with Title and Reset button inline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card p-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
          <p className="text-xs text-[var(--muted)]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {resetting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Resetting Database...
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Database
              </>
            )}
          </button>
        </div>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}
