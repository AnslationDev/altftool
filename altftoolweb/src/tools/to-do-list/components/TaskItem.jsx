"use client";
import { Check, Trash2, Edit2, Star, X } from "lucide-react";
import { useState } from "react";

export default function TaskItem({
  task,
  toggleComplete,
  toggleImportant,
  deleteTask,
  editTask,
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);

  const save = () => {
    if (text.trim()) {
      editTask(task.id, text);
      setEditing(false);
    }
  };

  // Highlight important task (non-dark-breaking)
  const importantStyle =
    task.important && !task.completed
      ? {
          background: "var(--card)",
          borderColor: "gold",
        }
      : {};

  return (
    <div
      className="group relative overflow-hidden rounded-xl transition-all border-2 bg-(--card)"
      style={importantStyle}
    >
      <div className="p-4">
        {editing ? (
          <div className="space-y-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="w-full px-4 py-2 border-2 rounded-lg border-(--primary) bg-(--background) text-(--foreground) focus:ring-2 focus:ring-(--primary)"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={save}
                className="px-4 py-2 bg-(--primary) text-(--primary-foreground) rounded-lg cursor-pointer"
              >
                <Check size={18} /> Save
              </button>

              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-(--muted) text-(--muted-foreground) hover:text-red-500 cursor-pointer rounded-lg"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <button
              onClick={() => toggleComplete(task.id)}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center bg-(--background) cursor-pointer"
              style={
                task.completed
                  ? {
                      background: "var(--primary)",
                      borderColor: "var(--primary)",
                    }
                  : { borderColor: "var(--border)" }
              }
            >
              {task.completed && (
                <Check size={16} className="text-(--primary-foreground)" />
              )}
            </button>

            {/* Text */}
            <span
              className={`flex-1 text-base ${
                task.completed
                  ? "text-(--muted-foreground) line-through"
                  : "text-(--foreground)"
              }`}
              style={{
                fontWeight:
                  task.important && !task.completed ? "600" : "normal",
              }}
            >
              {task.text}
            </span>

            {/* Icons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Important */}
              <button
                onClick={() => toggleImportant(task.id)}
                className="p-2 rounded-lg cursor-pointer"
                style={{
                  background: task.important
                    ? "rgba(255,215,0,0.15)"
                    : "transparent",
                  color: task.important
                    ? "goldenrod"
                    : "var(--muted-foreground)",
                }}
              >
                <Star
                  size={18}
                  fill={task.important ? "currentColor" : "none"}
                />
              </button>

              {/* Edit */}
              <button
                onClick={() => setEditing(true)}
                className="p-2 cursor-pointer"
                style={{ color: "var(--primary)" }}
              >
                <Edit2 size={18} />
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 cursor-pointer text-red-700 hover:text-red-500"
                // style={{ color: "crimson" }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
