"use client";
import { Plus } from "lucide-react";

export default function AddTask({ input, setInput, addTask }) {
  return (
    <div className="p-6 bg-(--card) border-b border-(--border) transition-colors">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-3 rounded-lg bg-(--muted) text-(--foreground) placeholder-(--muted-foreground) border border-(--border) focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />

        <button
          onClick={addTask}
          className="px-6 py-3 rounded-lg font-semibold bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <Plus size={20} /> Add
        </button>
      </div>
    </div>
  );
}
