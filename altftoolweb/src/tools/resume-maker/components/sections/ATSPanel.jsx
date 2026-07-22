import { CheckCircle, AlertCircle } from "lucide-react";
import StrengthMeter from "./StrengthMeter";
import KeywordMatcher from "../ai/KeywordMatcher";

const ATSPanel = ({ atsData, resumeText, hiringProbability, resumeRanking }) => {
  return (
    <div className="bg-(--card) rounded-xl shadow-lg p-6">
      <h2 className="text-base sm:text-xl font-bold text-(--foreground) mb-4 flex items-center gap-2  whitespace-nowrap">
        <CheckCircle className="w-6 h-6" />
        ATS Optimization Checklist
      </h2>



      <StrengthMeter score={atsData.score} />



<div className="mt-5 mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold text-blue-700">
      🎯 Hiring Probability
    </h3>

    <span className="text-lg font-bold text-blue-600">
      {hiringProbability}%
    </span>
  </div>

  <p className="text-sm text-gray-700 leading-6">
    Your resume has a{" "}
    <span className="font-semibold text-blue-600">
      {hiringProbability}% chance
    </span>{" "}
    of passing the initial recruiter screening.
  </p>

  <div className="mt-3 flex flex-wrap gap-2 text-xs">
    <span className="bg-(--card) text-(--foreground)border border-blue-100 px-2 py-1 rounded-full">
      ATS Score
    </span>

    <span className="bg-(--card) text-(--foreground) border border-blue-100 px-2 py-1 rounded-full">
      Resume Completeness
    </span>

    <span className="bg-(--card) text-(--foreground) border border-blue-100 px-2 py-1 rounded-full">
      Skills Match
    </span>

    <span className="bg-(--card) text-(--foreground) border border-blue-100 px-2 py-1 rounded-full">
      Experience Quality
    </span>
  </div>
</div>

<div className="mb-5 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold text-yellow-700">
      🏆 Resume Ranking
    </h3>

    <span className="text-lg font-bold text-yellow-600">
      {resumeRanking}%
    </span>
  </div>

  <p className="text-sm text-gray-700 leading-6">
    You are ahead of{" "}
    <span className="font-semibold text-yellow-600">
      {resumeRanking}% users
    </span>{" "}
    based on your resume quality and ATS optimization.
  </p>

  <div className="mt-3 flex flex-wrap gap-2 text-xs">
    <span className="bg-(--card) text-(--foreground) border border-yellow-100 px-2 py-1 rounded-full">
      ATS Optimized
    </span>

    <span className="bg-(--card) text-(--foreground) border border-yellow-100 px-2 py-1 rounded-full">
      Resume Strength
    </span>

    <span className="bg-(--card) text-(--foreground) border border-yellow-100 px-2 py-1 rounded-full">
      Better Than Average
    </span>
  </div>
</div>

<div className="space-y-3">
        {atsData.feedback.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg mt-2 border border-green-100">
  <CheckCircle className="w-5 h-5" />
  <span>🎉 Your resume is fully optimized!</span>
</div>
        ) : (
          atsData.feedback.map((item, index) => (
  <div
    key={index}
    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2
    bg-yellow-50 p-3 rounded-lg mt-2 border border-yellow-100 transition-all"
  >
    <div className="flex items-start gap-2 text-gray-700 text-sm">
      <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />

      <span>
        {item.text}
      </span>
    </div>

    <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
      +{item.points}
    </span>
  </div>
))
)}
        </div>

<KeywordMatcher resumeText={resumeText} />

</div>
  );
};

export default ATSPanel;
