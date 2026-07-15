"use client";

import { useState, useCallback } from "react";
import Header from "../components/Header";
import QuizCard from "../components/QuizCard";
import AnimalResult from "../components/AnimalResult";
import AnimalProfile from "../components/AnimalProfile";
import ScoreBar from "../components/ScoreBar";
import ResultActions from "../components/ResultActions";
import Features from "../components/Features";
import { quizQuestions } from "../constants/data";
import { calculateSpiritAnimalSimple } from "../utils/spiritUtils";

export default function SpiritAnimalFinder() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [result, setResult] = useState(null);

  const handleSelectAnswer = useCallback((optionIndex) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = quizQuestions[currentQuestion].options[optionIndex];
      return updated;
    });
  }, [currentQuestion]);

  const handlePrev = () => setCurrentQuestion((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentQuestion((p) => Math.min(quizQuestions.length - 1, p + 1));

  const handleFinish = () => {
    const filledAnswers = answers.filter((a) => a !== null);
    if (filledAnswers.length < quizQuestions.length) return;

    const spiritResult = calculateSpiritAnimalSimple(answers);
    setResult(spiritResult);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers(Array(quizQuestions.length).fill(null));
    setResult(null);
  };

  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="px-4 py-6">
      <Header />

      <div className="max-w-3xl mx-auto space-y-6">
        {!result ? (
          <>
            <div className="text-center">
              <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${(answeredCount / quizQuestions.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[var(--muted-foreground)] mt-1 inline-block">
                {answeredCount} of {quizQuestions.length} answered
              </span>
            </div>

            <QuizCard
              question={quizQuestions[currentQuestion]}
              questionIndex={currentQuestion}
              totalQuestions={quizQuestions.length}
              selectedAnswer={answers[currentQuestion] !== null ? quizQuestions[currentQuestion].options.indexOf(answers[currentQuestion]) : null}
              onSelectAnswer={handleSelectAnswer}
              onPrev={handlePrev}
              onNext={handleNext}
              onFinish={handleFinish}
            />
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
                Your Spirit Animal is...
              </h2>
            </div>

            <AnimalResult
              animal={result.primary}
              matchPercentage={result.matchPercentage}
              isPrimary={true}
            />

            <AnimalProfile animal={result.primary} />

            <ScoreBar allScores={result.allScores} />

            {(result.secondary || result.tertiary) && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Companion Spirits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.secondary && (
                    <AnimalResult animal={result.secondary} isPrimary={false} />
                  )}
                  {result.tertiary && (
                    <AnimalResult animal={result.tertiary} isPrimary={false} />
                  )}
                </div>
              </div>
            )}

            <ResultActions onRestart={handleRestart} />
          </>
        )}
      </div>

      <Features />
    </div>
  );
}
