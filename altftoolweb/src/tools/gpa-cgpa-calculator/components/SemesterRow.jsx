import React from "react";

export default function SemesterRow({ semester, index, updateSemester, removeSemester }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-(--background) p-5 rounded-2xl border border-(--border) hover:border-(--primary) hover:shadow-md transition-all group">
      <div className="md:col-span-5 space-y-2">
        <label className="text-xs font-bold text-(--muted-foreground) uppercase px-1 tracking-wider">Semester Name</label>
        <input
          type="text"
          value={semester.name}
          onChange={(e) => updateSemester(index, "name", e.target.value)}
          placeholder={`Semester ${index + 1}`}
          className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all font-medium"
        />
      </div>
      <div className="md:col-span-3 space-y-2">
        <label className="text-xs font-bold text-(--muted-foreground) uppercase px-1 tracking-wider">Semester GPA</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="10"
          value={semester.gpa}
          onChange={(e) => updateSemester(index, "gpa", e.target.value)}
          className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all font-bold text-center"
        />
      </div>
      <div className="md:col-span-3 space-y-2">
        <label className="text-xs font-bold text-(--muted-foreground) uppercase px-1 tracking-wider">Total Credits</label>
        <input
          type="number"
          min="0"
          value={semester.credits}
          onChange={(e) => updateSemester(index, "credits", e.target.value)}
          className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all font-bold text-center"
        />
      </div>
      <div className="md:col-span-1 flex justify-center pb-2">
        <button
          onClick={() => removeSemester(index)}
          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          title="Remove Semester"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
