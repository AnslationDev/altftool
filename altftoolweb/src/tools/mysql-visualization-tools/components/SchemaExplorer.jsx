import { TableProperties } from "lucide-react";
import Panel from "./Panel";

export default function SchemaExplorer({ tables, queryAnalysis }) {
  return (
    <Panel title="Schema Explorer" icon={TableProperties}>
      <p className="mb-3 break-words text-sm text-(--muted-foreground)">
        Browse parsed tables and query references.
      </p>

      {queryAnalysis.referencedTables.length > 0 && (
        <div className="mb-4 break-words rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm text-cyan-700 [overflow-wrap:anywhere] dark:text-cyan-100">
          Query references {queryAnalysis.referencedTables.join(", ")} with {queryAnalysis.joinCount} JOIN clause(s).
        </div>
      )}

      <div className="space-y-4">
        {tables.length ? (
          tables.map((table) => (
            <details
              key={table.name}
              open
              className="overflow-hidden rounded-xl border border-(--border) bg-(--background)"
            >
              <summary className="cursor-pointer px-4 py-3 font-bold text-(--foreground)">
                <span className="break-words [overflow-wrap:anywhere]">{table.name}</span>
              </summary>
              <div className="text-sm">
                <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(56px,0.55fr)_minmax(44px,0.45fr)] gap-2 bg-(--muted) px-3 py-2 text-[11px] font-bold uppercase text-(--muted-foreground)">
                  <div>Column</div>
                  <div>Type</div>
                  <div>Keys</div>
                  <div>Null</div>
                </div>
                {table.columns.map((column) => (
                  <div
                    key={column.name}
                    className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(56px,0.55fr)_minmax(44px,0.45fr)] gap-2 border-t border-(--border) px-3 py-2"
                  >
                    <div className="min-w-0 break-words font-semibold leading-5 text-(--foreground) [overflow-wrap:anywhere]">
                      {column.name}
                    </div>
                    <div className="min-w-0 break-words leading-5 text-(--muted-foreground) [overflow-wrap:anywhere]">
                      {column.type}
                    </div>
                    <div className="min-w-0 break-words text-xs leading-5 text-(--muted-foreground) [overflow-wrap:anywhere]">
                      {[column.primary && "PK", column.unique && "UNIQUE", column.references && "FK"]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </div>
                    <div className="min-w-0 break-words leading-5 text-(--muted-foreground)">
                      {column.nullable ? "Yes" : "No"}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-(--border) p-4 text-sm text-(--muted-foreground)">
            Parsed tables will appear here after valid schema input.
          </p>
        )}
      </div>
    </Panel>
  );
}
