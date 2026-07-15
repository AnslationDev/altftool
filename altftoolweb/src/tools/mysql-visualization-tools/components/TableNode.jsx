import { Handle, Position } from "@xyflow/react";
import { KeyRound, Link2 } from "lucide-react";

export default function TableNode({ data }) {
  const table = data.label.table;
  const active = data.label.active;
  const activeColumns = data.label.activeColumns || [];

  return (
    <div className={`w-[280px] max-w-[280px] overflow-hidden rounded-[18px] border ${active ? "border-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" : "border-transparent"}`}>
      <Handle type="target" position={Position.Left} className="!bg-emerald-300" />
      <div className="border-b border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
        <div className="break-words text-sm font-black leading-tight text-cyan-100 [overflow-wrap:anywhere]" title={table.name}>
          {table.name}
        </div>
        <div className="text-[11px] uppercase tracking-wide text-slate-400">
          {table.columns.length} columns
        </div>
      </div>
      <div className="max-h-[320px] overflow-auto px-3 py-2">
        {table.columns.map((column) => (
          <div
            key={column.name}
            className={`flex min-w-0 items-center justify-between gap-2 border-b border-white/5 py-2 last:border-b-0 ${activeColumns.includes(column.name.toLowerCase()) ? "rounded-md bg-emerald-400/10 px-2" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-100">
                {column.primary && <KeyRound size={12} className="shrink-0 text-amber-300" />}
                {column.references && <Link2 size={12} className="shrink-0 text-emerald-300" />}
                <span className="min-w-0 break-words leading-tight [overflow-wrap:anywhere]" title={column.name}>
                  {column.name}
                </span>
              </div>
              <div className="break-words text-[11px] leading-tight text-slate-400 [overflow-wrap:anywhere]" title={column.type}>
                {column.type}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
              {column.nullable ? "NULL" : "REQ"}
            </span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-cyan-300" />
    </div>
  );
}
