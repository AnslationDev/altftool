import React from "react";
import { Search, Filter, RefreshCcw } from "lucide-react";

const CATEGORIES = [
  "All", "Headache", "Fever", "Digestive", "Stress", "Anxiety",
  "Fatigue", "Muscle Pain", "Allergy", "Sleep Issues", "Custom"
];

export default function Filters({ filters, setFilters, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-(--muted-foreground) uppercase tracking-widest flex items-center gap-3">
          <div className="p-1.5 bg-(--background) rounded-lg border border-(--border)">
            <Filter size={18} className="text-blue-600" />
          </div>
          Refine History
        </h3>
        <button
          onClick={onReset}
          className="p-2 text-(--muted-foreground) hover:text-blue-600 transition-colors bg-(--background) rounded-xl border border-(--border) shadow-sm"
          title="Reset All"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground)" size={20} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search symptoms or medications..."
            className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-4 text-base outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-(--muted-foreground)/50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-4 text-xs outline-none font-black uppercase tracking-widest cursor-pointer appearance-none focus:ring-4 focus:ring-blue-500/10"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-(--card)">{cat}</option>)}
            </select>
          </div>
          <div className="relative">
            <select
              name="severity"
              value={filters.severity}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-4 text-xs outline-none font-black uppercase tracking-widest cursor-pointer appearance-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all" className="bg-(--card)">Severity</option>
              <option value="mild" className="bg-(--card)">Mild</option>
              <option value="moderate" className="bg-(--card)">Medium</option>
              <option value="severe" className="bg-(--card)">Severe</option>
            </select>
          </div>
          <div className="relative">
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-4 text-xs outline-none font-black uppercase tracking-widest cursor-pointer appearance-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="newest" className="bg-(--card)">Newest</option>
              <option value="oldest" className="bg-(--card)">Oldest</option>
              <option value="severityHigh" className="bg-(--card)">Highest</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
