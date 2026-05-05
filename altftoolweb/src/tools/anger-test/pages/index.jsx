"use client";

import { useState } from "react";
import { questions } from "../utils/question";
import { generateDetailedReport } from "../utils/detailedReport";
import { calculateStressCorrelation } from "../utils/stressCorrelation";
import { calculateAngerLevel } from "../utils/calculateAngerLevel";
import { detectAngerType } from "../utils/detectAngerType";
import StartScreen from "../components/StartScreen";
import QuestionCard from "../components/QuestionCard";
import ResultCard from "../components/ResultCard";
import Features from "../components/Features";

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const saveTodaysMood = (levelData, score) => {
  const cleanLevel = levelData.level
    ?.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]/gu, "")
    .trim();
  const existingMoods = JSON.parse(localStorage.getItem("anger-moods")) || {};
  const today = new Date().toISOString().split("T")[0];
  existingMoods[today] = { level: cleanLevel, score };
  localStorage.setItem("anger-moods", JSON.stringify(existingMoods));
};

export default function ToolHome() {
  const [currentStep, setCurrentStep] = useState("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const handleStart = () => {
    setShuffledQuestions(shuffleArray(questions));
    setCurrentStep("question");
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleAnswer = (value) => {
    const newAnswers = [
      ...answers,
      { questionId: shuffledQuestions[currentQuestion].id, value },
    ];
    setAnswers(newAnswers);

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const levelData = calculateAngerLevel(newAnswers);
      const score = newAnswers.reduce((sum, ans) => sum + ans.value, 0);
      const angerType = detectAngerType(newAnswers);
      const detailedReport = generateDetailedReport(newAnswers);
      const stressCorrelation = calculateStressCorrelation(newAnswers);

      localStorage.setItem("anger-score", String(score));
      localStorage.setItem("anger-answers", JSON.stringify(newAnswers));
      saveTodaysMood(levelData, score);

      setResult({ levelData, score, angerType, detailedReport, stressCorrelation });
      setCurrentStep("result");
    }
  };

  return (
    <div className="min-h-auto bg-(--background)">
      <main className="py-6 px-4">
        {currentStep === "start" && <StartScreen onStart={handleStart} />}

        {currentStep === "question" && (
          <QuestionCard
            question={shuffledQuestions[currentQuestion]}
            onAnswer={handleAnswer}
            questionNumber={currentQuestion + 1}
            totalQuestions={shuffledQuestions.length}
          />
        )}

        {currentStep === "result" && result && (
          <ResultCard
            levelData={result.levelData}
            score={result.score}
            angerType={result.angerType}
            detailedReport={result.detailedReport}
            stressCorrelation={result.stressCorrelation}
          />
        )}

        <Features />
      </main>
    </div>
  );
}