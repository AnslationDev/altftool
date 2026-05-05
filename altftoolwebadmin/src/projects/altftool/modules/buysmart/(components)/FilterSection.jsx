"use client";
import React from "react";
import { RefreshCcw } from "lucide-react";

function FilterSection({ filter = {}, setFilter , handleRefresh }) {
  function handleChange(e) {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="flex gap-4 mx-4">
      <legend>
      <input
        type="text"
        name="search"
        className="border px-2 py-2 w-96 rounded-sm"
        placeholder="Search by title"
        value={filter.search ?? "" }
        onChange={handleChange}
      />
      </legend>
      

      <select
        name="status"
        className="w-36 border rounded-sm cursor-pointer"
        value={filter.status ?? "all"}
        onChange={handleChange}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
      </select>

      <div  onClick={handleRefresh} className="border  cursor-pointer px-4 bg-black text-white rounded-sm flex justify-center items-center" >
        <RefreshCcw size={20} />
      </div>
    </div>
  );
}

export default FilterSection;