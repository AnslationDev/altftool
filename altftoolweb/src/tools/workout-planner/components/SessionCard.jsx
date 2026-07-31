"use client";

export default function SessionCard({ session, sessionKey, log, onToggleComplete, onUpdateRpe }) {
  return (
    <div className="p-4 shadow-sm rounded-lg border border-(--border) bg-(--card)">
      <p className="text-xs font-semibold uppercase tracking-wider text-(--primary)">{session.day}</p>
      <h4 className="text-lg font-bold mt-1">{session.title}</h4>
      <p className="text-sm mt-1">{session.exercise} - {session.sets} sets x {session.reps}</p>
      <p className="text-xs mt-2 text-(--muted-foreground)">{session.intensity} intensity</p>
      <div className="mt-3 rounded-lg border border-(--border) bg-(--background) p-3 md:hidden">
        <p className="text-xs font-semibold mb-1">Quick View</p>
        <p className="text-xs text-(--muted-foreground)">
          {session.blocks[0]} | {session.blocks[1]} | {session.blocks[2]}
        </p>
      </div>
      <ul className="mt-3 space-y-1 text-sm hidden md:block">{session.blocks.map((block) => <li key={block}>- {block}</li>)}</ul>
      <p className="text-xs mt-2 text-(--muted-foreground)">{session.injuryNote}</p>

      <div className="mt-3 p-3 rounded-lg border border-(--border) bg-(--background)">
        <p className="text-xs font-semibold mb-2">Track Session</p>
        <div className="flex items-center gap-3">
          <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={Boolean(log?.completed)} onChange={() => onToggleComplete(sessionKey)} /> Completed</label>
          <label className="text-xs">RPE
            <input type="number" min="1" max="10" value={log?.rpe ?? 7} onChange={(e) => onUpdateRpe(sessionKey, e.target.value)} className="ml-2 w-16 px-2 py-1 rounded border border-(--border) bg-(--card) text-(--foreground) outline-none focus:border-(--primary)" />
          </label>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-lg border border-(--border) bg-(--background)">
        <p className="text-xs font-semibold mb-1">Weekly Progression</p>
        {session.weekPlan.map((w) => <p key={w.week} className="text-xs text-(--muted-foreground)">Week {w.week}: {w.prescription}</p>)}
      </div>
    </div>
  );
}
