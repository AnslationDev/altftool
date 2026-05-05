"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

export default function IconPicker({ selected, onSelect }) {

  const [search, setSearch] = useState("");

  const icons = Object.entries(Icons)
    .filter(([name, Icon]) =>
      typeof Icon === "function" &&
      name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 200);

  return (
    <div className="space-y-3">

      {/* SEARCH */}
      <input
        className="input w-full"
        placeholder="Search icon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ICON GRID */}
      <div className="grid grid-cols-6 md:grid-cols-8 gap-2 max-h-72 overflow-y-auto border rounded-lg p-3 bg-white">

        {icons.map(([name, Icon]) => (

          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={`flex flex-col items-center justify-center gap-1
              p-2 rounded-md border text-center
              hover:bg-gray-50 transition
              ${selected === name ? "border-blue-500 bg-blue-50" : "border-gray-200"}
            `}
          >

            <Icon size={20} />

            <span className="text-[10px] leading-tight truncate w-full">
              {name}
            </span>

          </button>

        ))}

      </div>

    </div>
  );
}