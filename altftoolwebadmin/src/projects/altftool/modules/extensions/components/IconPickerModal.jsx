"use client";

import { useState, useMemo } from "react";
import * as Icons from "lucide-react";

export default function IconPickerModal({ selected, onSelect, onClose }) {
  const [search, setSearch] = useState("");

  const icons = useMemo(() => {
  return Object.entries(Icons)
    .filter(([name, Icon]) => {
      return (
        typeof Icon === "function" &&
        name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .slice(0, 400);
}, [search]);

  const SelectedIcon = Icons[selected] || Icons.Box;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[720px] rounded-xl p-6 space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Select Icon
          </h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        {/* SELECTED PREVIEW */}
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <SelectedIcon size={24} />
          <span className="text-sm">
            {selected || "No icon selected"}
          </span>
        </div>

        {/* SEARCH */}
        <input
          className="input w-full"
          placeholder="Search icon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ICON GRID */}
        <div className="grid grid-cols-8 gap-3 max-h-[420px] overflow-y-auto border rounded-lg p-3">

          {icons.map(([name, Icon]) => {
  if (!Icon) return null;

  return (
    <button
      key={name}
      type="button"
      onClick={() => onSelect(name)}
      className={`flex flex-col items-center justify-center gap-1
        p-2 border rounded-md hover:bg-gray-50
        ${selected === name ? "border-blue-500 bg-blue-50" : "border-gray-200"}
      `}
    >
      <Icon size={20} />

      <span className="text-[10px] truncate w-full text-center">
        {name}
      </span>
    </button>
  );
})}

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

      </div>

    </div>
  );
}