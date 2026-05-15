import React from "react";
import { GRADE_POINTS } from "../utils/calculator-logic";

export default function SubjectRow({ subject, index, updateSubject, removeSubject }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-(--background) p-5 rounded-2xl border border-(--border) hover:border-(--primary) hover:shadow-md transition-all group">
      <div className="md:col-span-6 space-y-2">
        <label className="text-xs font-bold text-(--muted-foreground) uppercase px-1 tracking-wider">Subject Name</label>
        <input
          type="text"
          list="subject-suggestions"
          value={subject.name}
          onChange={(e) => updateSubject(index, "name", e.target.value)}
          placeholder="Search or enter subject name..."
          className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all font-medium"
        />
        <datalist id="subject-suggestions">
          <option value="Mathematics I" />
          <option value="Mathematics II" />
          <option value="Mathematics III" />
          <option value="Engineering Physics" />
          <option value="Engineering Chemistry" />
          <option value="Programming in C" />
          <option value="Programming in Python" />
          <option value="Data Structures & Algorithms" />
          <option value="Object Oriented Programming (Java)" />
          <option value="Database Management Systems" />
          <option value="Operating Systems" />
          <option value="Computer Networks" />
          <option value="Software Engineering" />
          <option value="Theory of Computation" />
          <option value="Artificial Intelligence" />
          <option value="Machine Learning" />
          <option value="Cyber Security" />
          <option value="Cloud Computing" />
          <option value="Digital Electronics" />
          <option value="Microprocessors" />
          <option value="Basic Electrical Engineering" />
          <option value="Control Systems" />
          <option value="Thermodynamics" />
          <option value="Fluid Mechanics" />
          <option value="Strength of Materials" />
          <option value="Basics of Mechanical Engineering" />
          <option value="Environmental Studies" />
          <option value="Economics for Engineers" />
          <option value="Values and Ethics" />
          <option value="Communication Skills" />
        </datalist>
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className="text-xs font-bold text-(--muted-foreground) uppercase px-1 tracking-wider">Credits</label>
        <input
          type="number"
          min="0"
          value={subject.credits}
          onChange={(e) => updateSubject(index, "credits", e.target.value)}
          className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all font-bold text-center"
        />
      </div>
      <div className="md:col-span-3 space-y-2">
        <label className="text-xs font-bold text-(--muted-foreground) uppercase px-1 tracking-wider">Grade</label>
        <select
          value={subject.grade}
          onChange={(e) => updateSubject(index, "grade", e.target.value)}
          className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all appearance-none cursor-pointer font-bold"
        >
          {Object.keys(GRADE_POINTS).map(g => (
            <option key={g} value={g}>{g} Grade ({GRADE_POINTS[g]} Points)</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-1 flex justify-center pb-2">
        <button
          onClick={() => removeSubject(index)}
          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          title="Remove Subject"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
