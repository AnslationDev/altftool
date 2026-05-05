"use client";

import { Plus } from "lucide-react";

export default function ExtensionsHeader({ onCreate, onAddData }) {
  return (
    <div className="space-y-5">

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dynamic Module</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all dynamic data in one place</p>
        </div>
        <div className="flex flex-row gap-4">
          <button
            onClick={onAddData}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Data
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Configure Module
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, iconBg, iconColor, valueColor = "text-gray-800" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-xl font-bold tabular-nums leading-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}