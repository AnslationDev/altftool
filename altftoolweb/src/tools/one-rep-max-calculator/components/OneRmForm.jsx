"use client";

import { Calculator, RotateCcw } from "lucide-react";

export default function OneRmForm({
  exercise,
  setExercise,
  formula,
  setFormula,
  formulas,
  weight,
  setWeight,
  reps,
  setReps,
  onCalculate,
  onReset,
}) {
  return (
    <form onSubmit={onCalculate} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Exercise (e.g. Bench Press)"
          className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)"
        />
        <select
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)"
        >
          {formulas.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          min="1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight lifted (kg)"
          className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)"
        />
        <input
          type="number"
          min="1"
          max="20"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps completed"
          className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="px-5 py-3 rounded-lg bg-(--primary) text-white font-semibold flex items-center gap-2"
        >
          <Calculator size={18} />
          Calculate 1RM
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) font-semibold flex items-center gap-2"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>
    </form>
  );
}
