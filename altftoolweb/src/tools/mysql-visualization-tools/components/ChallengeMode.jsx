"use client";

import { Target } from "lucide-react";
import Panel from "./Panel";

export default function ChallengeMode({ challenges, activeId, onSelect }) {
  return (
    <Panel title="Challenge Mode" icon={Target}>
      <div className="grid gap-3 md:grid-cols-3">
        {challenges.map((challenge) => (
          <button
            key={challenge.id}
            type="button"
            onClick={() => onSelect(challenge)}
            className={`min-h-20 rounded-lg border p-3 text-left transition ${activeId === challenge.id ? "border-emerald-400 bg-emerald-500/10" : "border-(--border) bg-(--background) hover:border-(--primary)"}`}
          >
            <div className="text-sm font-black text-(--foreground)">{challenge.title}</div>
            <div className="mt-1 text-xs leading-5 text-(--muted-foreground)">{challenge.prompt}</div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
