import { GitBranch, Link2Off } from "lucide-react";
import Panel from "./Panel";

export default function RelationshipMap({ relationships }) {
  return (
    <Panel title="Relationship Map" icon={GitBranch}>
      <p className="mb-3 text-sm text-(--muted-foreground)">Detected from real foreign keys.</p>

      {relationships.length ? (
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <div
              key={relationship.id}
              className="min-w-0 rounded-xl border border-(--border) bg-(--background) p-3"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold text-(--foreground)">
                <span className="min-w-0 max-w-full break-words [overflow-wrap:anywhere]">{relationship.source}</span>
                <span className="text-cyan-500">{"->"}</span>
                <span className="min-w-0 max-w-full break-words [overflow-wrap:anywhere]">{relationship.target}</span>
              </div>
              <p className="mt-1 break-words text-xs text-(--muted-foreground) [overflow-wrap:anywhere]">
                {relationship.sourceColumn} references {relationship.targetColumn || "unknown column"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-(--border) p-4 text-sm text-(--muted-foreground)">
          <Link2Off size={18} />
          No foreign key relationships detected in the current input.
        </div>
      )}
    </Panel>
  );
}
