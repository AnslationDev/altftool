import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Panel from "./Panel";

export default function ParserStatus({ schema, warnings }) {
  const healthy = schema.tables.length > 0 && warnings.length === 0;

  return (
    <Panel title="Schema Parser Status" icon={healthy ? CheckCircle2 : AlertTriangle}>
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm text-(--muted-foreground)">
            {schema.tables.length
              ? `Parsed ${schema.tables.length} table(s) and ${schema.relationships.length} relationship(s).`
              : "Waiting for valid CREATE TABLE statements."}
          </p>
          {warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              {warnings.map((warning, index) => (
                <p
                  key={`${warning}-${index}`}
                  className="break-words rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-200"
                >
                  {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
