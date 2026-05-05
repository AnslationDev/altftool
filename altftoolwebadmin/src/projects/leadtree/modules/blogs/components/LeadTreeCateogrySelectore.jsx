"use client";

import { useState, useEffect, useRef } from "react";
import { emitAlert } from "@/lib/alertBus";
import { fetchCategoryNames } from "../lead-blog-services/BlogPostService";

export default function CategorySelector({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  /* ── Load category names EXACTLY as stored ── */
  useEffect(() => {
    (async () => {
      try {
        const snap = await fetchCategoryNames();
        setCategories(snap); // no formatting at all
      } catch (err) {
        console.error(err);
        emitAlert({ type: "error", message: "Failed to load categories" });
      }
    })();
  }, []);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Filter WITHOUT modifying actual data ── */
  const filtered = categories.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={open ? search : value || ""}
        placeholder="Select category"
        onFocus={() => {
          setSearch("");
          setOpen(true);
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        className="border p-2 rounded w-full"
      />

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-20 max-h-56 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((name) => (
              <div
                key={name}
                onClick={() => {
                  onChange(name); // EXACT value from DB
                  setSearch("");
                  setOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  value === name ? "bg-gray-100" : ""
                }`}
              >
                {name} {/* display EXACT */}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No categories found
            </div>
          )}
        </div>
      )}
    </div>
  );
}