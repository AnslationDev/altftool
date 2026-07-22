"use client";

import { useState, useCallback } from "react";
import {
  Target,
  Calendar,
  CalendarDays,
  CalendarRange,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Flame,
} from "lucide-react";
import { GOAL_TYPES } from "../constants/trackerConfig";

export default function Goals({ goals, onUpdate, earnedBadges, streak }) {
  const [editingGoals, setEditingGoals] = useState(goals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: "daily", title: "", target: "" });

  const handleSave = useCallback(() => {
    onUpdate(editingGoals);
  }, [editingGoals, onUpdate]);

  const addGoal = useCallback(() => {
    if (!newGoal.title.trim()) return;
    const goal = {
      id: Date.now(),
      ...newGoal,
      target: Number(newGoal.target) || 80,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...editingGoals, goal];
    setEditingGoals(updated);
    onUpdate(updated);
    setNewGoal({ type: "daily", title: "", target: "" });
    setShowAddGoal(false);
  }, [newGoal, editingGoals, onUpdate]);

  const removeGoal = useCallback(
    (id) => {
      const updated = editingGoals.filter((g) => g.id !== id);
      setEditingGoals(updated);
      onUpdate(updated);
    },
    [editingGoals, onUpdate]
  );

  const toggleGoal = useCallback(
    (id) => {
      const updated = editingGoals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
      setEditingGoals(updated);
      onUpdate(updated);
    },
    [editingGoals, onUpdate]
  );

  const GOAL_ICONS = {
    daily: Calendar,
    weekly: CalendarDays,
    monthly: CalendarRange,
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Streak & Achievements" icon={Flame}>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Flame className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-xs font-bold uppercase text-amber-600">Current Streak</p>
              <p className="text-2xl font-extrabold text-[var(--foreground)]">{streak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
            <Award className="h-8 w-8 text-[var(--primary)]" />
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Badges Earned</p>
              <p className="text-2xl font-extrabold text-[var(--foreground)]">{earnedBadges.length}</p>
            </div>
          </div>
        </div>

        {earnedBadges.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-3">
                <Award className="h-6 w-6 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{badge.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">Complete check-ins to earn achievement badges.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Goals"
        icon={Target}
        action={
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
          >
            <Plus className="mr-1 inline h-3.5 w-3.5" />
            Add Goal
          </button>
        }
      >
        {showAddGoal && (
          <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal((p) => ({ ...p, type: e.target.value }))}
                className="input rounded-lg px-3 py-2 text-sm"
              >
                {GOAL_TYPES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
                placeholder="Goal title..."
                className="input rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal((p) => ({ ...p, target: e.target.value }))}
                  placeholder="Target %"
                  className="input flex-1 rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={addGoal} className="btn-primary rounded-lg px-4 py-2 text-sm">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {editingGoals.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No goals set yet. Add a goal to track your progress.</p>
        ) : (
          <div className="space-y-3">
            {editingGoals.map((goal) => {
              const GoalIcon = GOAL_ICONS[goal.type] || Calendar;
              return (
                <div key={goal.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
                  <button onClick={() => toggleGoal(goal.id)} className="shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-[var(--border)]" />
                    )}
                  </button>
                  <GoalIcon className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${goal.completed ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}>
                      {goal.title}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {goal.type} goal | Target: {goal.target}%
                    </p>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="shrink-0 text-[var(--muted-foreground)] hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
