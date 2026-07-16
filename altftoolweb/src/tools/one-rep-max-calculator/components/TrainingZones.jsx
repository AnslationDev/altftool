import { Dumbbell } from "lucide-react";

export default function TrainingZones({ oneRm }) {
  if (!oneRm) return null;

  return (
    <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
      <h3 className="font-semibold text-(--foreground) mb-3 flex items-center gap-2">
        <Dumbbell size={18} />
        Suggested Training Weights
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {[95, 90, 85, 80, 75, 70].map((pct) => (
          <div key={pct} className="rounded-md border border-(--border) p-3">
            <p className="text-(--muted-foreground)">{pct}%</p>
            <p className="font-bold text-(--foreground)">
              {(oneRm * (pct / 100)).toFixed(1)} kg
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
