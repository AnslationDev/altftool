"use client";

import AngerMeter from "./AngerMeter";
import AngerTypeCard from "./AngerTypeCard";
import DetailedAngerReport from "./DetailedAngerReport";
import AngerTracker from "./AngerTracker";
import ProgressDashboard from "./ProgressDashboard";
import TriggerIdentification from "./TriggerIdentification";
// import DownloadReport from "./DownloadReport";
import RelationshipImpact from "../components/RelationshipImpact";
import EmotionalBalanceScore from "./EmotionalBalanceScore";
import { Activity } from "lucide-react";
import AngerControlExercise from "./AngerControlExercise";
import dynamic from "next/dynamic";

const DownloadReport = dynamic(
  () => import("./DownloadReport"),
  { ssr: false }
);

export default function ResultCard({
  levelData,
  score,
  angerType,
  detailedReport,
  stressCorrelation,
}) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Score Header */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">{levelData.icon}</div>
        <h2 className="text-4xl font-bold mb-2">{levelData.level}</h2>
        <p className="text-xl text-(--foreground) mb-4">
          Score: {score} points ({levelData.range})
        </p>
      </div>

      {/* <p className="text-lg text-(--foreground) leading-relaxed max-w-2xl mx-auto">
        {levelData.description}
      </p> */}

      {/* Meter */}
      <AngerMeter score={score} levelData={levelData} />

      {/* Anger Type */}
      <AngerTypeCard angerType={angerType} />

      {/* Detailed Report */}
      <DetailedAngerReport report={detailedReport} />

      {/* Stress Correlation */}
      <div className="rounded-2xl p-6 mb-6 border-2 border-(--border) bg-(--card)">
        <h3 className="subheading flex items-start gap-2 mb-4 leading-tight">
          <Activity size={22} className="text-(--primary) mt-0.5 shrink-0" />
          <span>Stress & Anger Correlation</span>
        </h3>
        <p className="text-(--muted-foreground)">
          Your stress level is contributing
          <span className="font-bold text-(--primary)">
            {" "}
            {stressCorrelation ?? 0}%{" "}
          </span>
          to your anger responses.
        </p>
        <div className="w-full bg-(--border) rounded-full h-2 mt-4 ">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stressCorrelation ?? 0}%` }}
          />
        </div>
      </div>

      {/* Tracker & Dashboard */}
      <AngerTracker />
      <ProgressDashboard />
      <TriggerIdentification />
      <RelationshipImpact angerLevel={levelData.level} />
      <EmotionalBalanceScore
        score={score}
        stressCorrelation={stressCorrelation}
      />

      <AngerControlExercise />

      <DownloadReport
        score={score}
        levelData={levelData}
        angerType={angerType}
        stressCorrelation={stressCorrelation}
      />

      {/* Suggestions */}
      <div className="rounded-2xl p-6 mb-6 border-2 border-(--border) bg-(--card)">
        <h3 className="subheading mb-4">💡 Suggestions for You</h3>
        <ul className="space-y-3">
          {levelData.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-(--muted-foreground)"
            >
              <span className="shrink-0 w-6 h-6 bg-(--card) text-(--foreground) rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Tips Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "⚡ Immediate Actions",
            tips: levelData.tips.immediate,
            color: "bg-green-500",
          },
          {
            title: "🎯 Long-term Strategies",
            tips: levelData.tips.longTerm,
            color: "bg-blue-500",
          },
          {
            title: "🌿 Lifestyle Changes",
            tips: levelData.tips.lifestyle,
            color: "bg-purple-500",
          },
        ].map(({ title, tips, color }) => (
          <div
            key={title}
            className="bg-(--card) rounded-2xl p-5 border-2 border-(--border)"
          >
            <h3 className="text-xl font-bold text-(--foreground) mb-4">
              {title}
            </h3>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-(--muted-foreground) text-sm"
                >
                  <span
                    className={`shrink-0 w-5 h-5 ${color} rounded-full flex items-center justify-center text-white text-xs`}
                  >
                    ✓
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-(--card) rounded-xl border-l-4 border-(--primary)">
        <p className="text-sm text-(--muted-foreground)">
          <span className="text-(--primary)">
            <strong>Important Disclaimer: </strong>
          </span>
          This assessment is for informational purposes only and is not a
          substitute for professional medical advice, diagnosis, or treatment.
          If you&apos;re experiencing persistent anger issues or thoughts of
          self-harm, please consult a qualified mental health professional.
        </p>
      </div>

      {/* Restart */}
      <div className="w-full flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-4 bg-(--primary) text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
        >
          🔄 Take Assessment Again
        </button>
      </div>
    </div>
  );
}
