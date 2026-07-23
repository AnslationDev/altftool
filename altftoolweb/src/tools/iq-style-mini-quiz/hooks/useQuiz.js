"use client";

import { useState, useCallback, useRef } from "react";
import { generateQuiz, calculateScore, estimateCognitiveRating, getCategoryBreakdown } from "../utils/quizEngine";
import { saveQuizResult } from "../utils/storage";
import { DIFFICULTY_LEVELS } from "../constants/quizConfig";

export function useQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const questionStartTime = useRef(null);

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => q.isAnswered || q.isSkipped).length;

  const startQuiz = useCallback((category, difficulty) => {
    const cat = category || selectedCategory;
    const diff = difficulty || selectedDifficulty;
    setSelectedCategory(cat);
    setSelectedDifficulty(diff);

    const quiz = generateQuiz({ category: cat, difficulty: diff });
    setQuestions(quiz);
    setCurrentIndex(0);
    setScore(0);
    setQuizResults(null);
    questionStartTime.current = performance.now();
  }, [selectedCategory, selectedDifficulty]);

  const answerQuestion = useCallback((optionIndex) => {
    if (!currentQuestion) return false;

    const responseTime = questionStartTime.current ? performance.now() - questionStartTime.current : 0;

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex
          ? { ...q, selectedOption: optionIndex, isAnswered: true, responseTime }
          : q
      )
    );

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    if (isCorrect) setScore((s) => s + 1);

    questionStartTime.current = performance.now();
    return isCorrect;
  }, [currentQuestion, currentIndex]);

  const skipQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setQuestions((prev) =>
      prev.map((q, i) => (i === currentIndex ? { ...q, isSkipped: true } : q))
    );
    questionStartTime.current = performance.now();
  }, [currentQuestion, currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      questionStartTime.current = performance.now();
    }
  }, [currentIndex, totalQuestions]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      questionStartTime.current = performance.now();
    }
  }, [currentIndex]);

  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
      questionStartTime.current = performance.now();
    }
  }, [totalQuestions]);

  const finishQuiz = useCallback(() => {
    const stats = calculateScore(questions);
    const rating = estimateCognitiveRating(stats.accuracy, stats.avgResponseTime);
    const categoryBreakdown = getCategoryBreakdown(questions);

    const difficultyConfig = DIFFICULTY_LEVELS.find((d) => d.id === selectedDifficulty);
    const totalTime = questions.reduce((sum, q) => sum + (q.responseTime || 0), 0);

    const results = {
      ...stats,
      rating,
      categoryBreakdown,
      difficulty: selectedDifficulty,
      difficultyLabel: difficultyConfig?.label || selectedDifficulty,
      totalQuestions,
      totalTime: Math.round(totalTime / 1000),
      score: Math.round((stats.correct / totalQuestions) * 100),
    };

    setQuizResults(results);
    saveQuizResult(results);
    return results;
  }, [questions, selectedDifficulty, totalQuestions]);

  const restartQuiz = useCallback(() => {
    startQuiz(selectedCategory, selectedDifficulty);
  }, [startQuiz, selectedCategory, selectedDifficulty]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answeredCount,
    score,
    quizResults,
    selectedDifficulty,
    selectedCategory,
    startQuiz,
    answerQuestion,
    skipQuestion,
    goToNext,
    goToPrevious,
    goToQuestion,
    finishQuiz,
    restartQuiz,
    setSelectedDifficulty,
    setSelectedCategory,
  };
}
