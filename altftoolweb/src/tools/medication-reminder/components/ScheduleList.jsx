import React from "react";
import { Alert } from "@altftool/ui";

export default function ScheduleList({ medications }) {
  if (!medications || medications.length === 0) {
    return (
      <p className="text-sm text-(--muted-foreground)">
        Your schedule is clear.
      </p>
    );
  }

  // Sort medications by time
  const sortedMedications = [...medications].sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="space-y-4">
      {sortedMedications.map((med) => {
        // Simple logic to show a subtle highlight if it's "today's" dose
        // For a real app, this would involve actual Date/Time comparisons
        return (
          <div key={med.id} className="flex items-center gap-4 rounded-md border-l-4 border-(--primary) bg-(--card) p-3 shadow-sm">
            <div className="flex-shrink-0 text-center">
              <p className="text-lg font-bold text-(--primary)">{med.time}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-(--foreground)">{med.name}</p>
              <p className="text-sm text-(--muted-foreground)">{med.dosage}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
