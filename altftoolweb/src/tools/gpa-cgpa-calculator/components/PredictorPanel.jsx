import React, { useState, useEffect } from "react";
import { predictRequiredGPA } from "../utils/calculator-logic";

export default function PredictorPanel({ currentCGPA, currentCredits }) {
  const [targetCGPA, setTargetCGPA] = useState(8);
  const [upcomingCredits, setUpcomingCredits] = useState(20);
  const [requiredGPA, setRequiredGPA] = useState(0);

  useEffect(() => {
    const res = predictRequiredGPA(currentCGPA, currentCredits, targetCGPA, upcomingCredits);
    setRequiredGPA(res);
  }, [currentCGPA, currentCredits, targetCGPA, upcomingCredits]);

  return (
    <div className="bg-(--background) p-6 rounded-2xl border border-(--border) space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 9-7 7-7-7"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold">Required GPA Predictor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-(--muted-foreground) uppercase">Target CGPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={targetCGPA}
            onChange={(e) => setTargetCGPA(e.target.value)}
            className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-(--muted-foreground) uppercase">Upcoming Credits</label>
          <input
            type="number"
            min="1"
            value={upcomingCredits}
            onChange={(e) => setUpcomingCredits(e.target.value)}
            className="w-full bg-(--card) border border-(--border) rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${requiredGPA === "Impossible" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"}`}>
        <div className="text-xs font-bold uppercase opacity-70">Requirement</div>
        <div className="text-2xl font-black mt-1">
          {requiredGPA === "Impossible" ? "Target Not Achievable" : `Required GPA: ${requiredGPA}`}
        </div>
        <p className="text-[10px] mt-1 opacity-80 font-medium">
          {requiredGPA === "Impossible" 
            ? "Even with 10.00 in the upcoming semester, you cannot reach this target." 
            : `To reach ${targetCGPA} CGPA, you need to score at least ${requiredGPA} in the next ${upcomingCredits} credits.`}
        </p>
      </div>
    </div>
  );
}
