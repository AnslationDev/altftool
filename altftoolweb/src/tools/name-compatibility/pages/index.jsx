"use client";

import { useState } from "react";
import Header from "../components/Header";
import NameInput from "../components/NameInput";
import OverallScore from "../components/OverallScore";
import ScoreBreakdown from "../components/ScoreBreakdown";
import NameProfiles from "../components/NameProfiles";
import DetailedAnalysis from "../components/DetailedAnalysis";
import Features from "../components/Features";
import { analyzeCompatibility, validateNames } from "../utils/compatibilityUtils";

export default function NameCompatibility() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleAnalyze = (e) => {
    e.preventDefault();
    const validationErrors = validateNames(name1, name2);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    setErrors([]);
    const analysis = analyzeCompatibility(name1.trim(), name2.trim());
    setResult(analysis);
  };

  return (
    <div className="px-4 py-6">
      <Header />

      <div className="max-w-5xl mx-auto space-y-6">
        <NameInput
          name1={name1}
          setName1={setName1}
          name2={name2}
          setName2={setName2}
          onAnalyze={handleAnalyze}
          errors={errors}
        />

        {result && (
          <>
            <OverallScore
              score={result.scores.overall}
              trait={result.overallTrait}
              message={result.overallMessage}
            />
            <ScoreBreakdown scores={result.scores} />
            <NameProfiles
              name1Profile={result.name1}
              name2Profile={result.name2}
            />
            <DetailedAnalysis result={result} />
          </>
        )}
      </div>

      <Features />
    </div>
  );
}
