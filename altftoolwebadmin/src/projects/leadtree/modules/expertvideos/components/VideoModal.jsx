"use client";

import { useState, useEffect, useRef } from "react";
import { emitAlert } from "@/lib/alertBus";
import { fetchCategories } from "../expert-video-services/ExpertVideoService";


export default function VideoModal({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
const [loading, setLoading] = useState(true);
  /* ── Load category names EXACTLY as stored ── */
  
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories(); // [{id, name}]
        setCategories(data);
      } catch (err) {
        console.error(err);
        emitAlert({ type: "error", message: "Failed to load categories" });
      } finally {
        setLoading(false);
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
  const filtered = categories.filter((cat) =>
    (cat?.name || "").toLowerCase().includes(search.toLowerCase()),
  );


  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={open ? search : value || ""}
        placeholder= "Select category"
        onFocus={() => {
          setSearch("");
          setOpen(true);
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        className="border border-gray-300 px-2 py-3 text-sm rounded-md w-full"
      />

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow z-20 max-h-56 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  onChange(cat.name);
                  setSearch("");
                  setOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-[15px] ${
                  value === cat.name ? "bg-gray-100" : ""
                }`}
              >
                {cat.name} {/* display EXACT */}
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