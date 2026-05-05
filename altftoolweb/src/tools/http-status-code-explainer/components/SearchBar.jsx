"use client";
import React, { useState } from "react";

export default function SearchBar({ onSelect }) {
  const [val, setVal] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!val) return;
    onSelect(Number(val));
    setVal("");
  }

  const quick = [200, 201, 301, 302, 400, 401, 403, 404, 500, 503];

  return (
    <div
      className={`
        bg-(--card)
        text-(--foreground)
        p-4 rounded-xl shadow-sm 
        border border-(--border)
      `}
    >
      {/* SEARCH FORM */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="number"
          placeholder="Enter HTTP Status Code (e.g., 404)"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className={`
            flex-1 p-3 rounded-lg
            bg-(--muted) 
            text-(--foreground)
            border border-(--border)
            focus:ring-2 focus:ring-(--primary)
            focus:outline-none
          `}
        />

        <button
          type="submit"
          className={`
            px-4 rounded-lg cursor-pointer
            bg-(--primary)
            text-(--primary-foreground)
            hover:opacity-85 transition
          `}
        >
          Explain
        </button>
      </form>

      {/* QUICK BUTTONS */}
      <div className="flex flex-wrap gap-2 mt-4">
        {quick.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`
              px-3 py-1 rounded-lg cursor-pointer
              border border-(--border)
              bg-(--muted)
              text-(--muted-foreground)
              hover:bg-(--muted-foreground)/10
              transition
            `}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
