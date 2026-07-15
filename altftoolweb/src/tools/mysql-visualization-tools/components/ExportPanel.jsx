import { Copy, Download, Save } from "lucide-react";
import Panel from "./Panel";

export default function ExportPanel({
  canExport,
  onCopySchema,
  onDownloadJson,
  onDownloadPng,
  onSaveHistory,
}) {
  const actions = [
    ["Copy schema", Copy, onCopySchema, Boolean(canExport)],
    ["Download JSON", Download, onDownloadJson, Boolean(canExport)],
    ["Export PNG", Download, onDownloadPng, Boolean(canExport)],
    ["Save history", Save, onSaveHistory, Boolean(canExport)],
  ];

  return (
    <Panel title="Export Panel" icon={Download}>
      <p className="mb-3 text-sm text-(--muted-foreground)">Every export is generated from the current parsed schema.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map(([label, Icon, handler, enabled]) => (
          <button
            key={label}
            type="button"
            disabled={!enabled}
            onClick={handler}
            className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate">{label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
