"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Check, Share2, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuizRunner({ quiz, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of selected values/indices
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null); // Track selection for current question
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const questions = quiz.questions || [];

  const handleOptionSelect = (option, index) => {
    if (selectedOptionIndex !== null) return; // Prevent double clicks

    setSelectedOptionIndex(index);

    // Track answers
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option.value || index;
    setAnswers(updatedAnswers);

    // If trivia, check if correct and update score
    if (quiz.quizType === "trivia") {
      if (index === questions[currentIndex].correctAnswerIndex) {
        setScore((prev) => prev + 1);
      }
    }

    // Auto-advance after a small delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOptionIndex(null);
      } else {
        // Compute and show results
        finishQuiz(updatedAnswers);
      }
    }, 600);
  };

  const finishQuiz = (finalAnswers) => {
    let finalResult = null;

    if (quiz.quizType === "trivia") {
      // Final trivia score calculation
      let finalScore = 0;
      questions.forEach((q, idx) => {
        if (finalAnswers[idx] === q.correctAnswerIndex) {
          finalScore++;
        }
      });

      // Get correct bracket
      if (finalScore === questions.length) {
        finalResult = { ...quiz.results.high };
      } else if (finalScore >= 3) {
        finalResult = { ...quiz.results.medium };
      } else {
        finalResult = { ...quiz.results.low };
      }

      // Replace score in text
      finalResult.title = finalResult.title.replace("{score}", finalScore);
      finalResult.description = finalResult.description.replace("{score}", finalScore);
    } else {
      // Personality calculation (mode of answers)
      const counts = {};
      finalAnswers.forEach((ans) => {
        counts[ans] = (counts[ans] || 0) + 1;
      });

      let maxVal = null;
      let maxCount = 0;
      Object.keys(counts).forEach((key) => {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          maxVal = key;
        }
      });

      // Default fallback if empty or tied
      if (!maxVal) maxVal = Object.keys(quiz.results)[0];
      finalResult = quiz.results[maxVal];
    }

    setResult(finalResult);
    setShowResults(true);

    // Launch confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOptionIndex(null);
    setShowResults(false);
    setResult(null);
    setScore(0);
    setCopied(false);
  };

  const handleShareResult = () => {
    const shareText = `I took the quiz "${quiz.title}" and got: ${result?.title}! Check yours out here!`;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="bf-quiz-runner-overlay">
      <div className="bf-quiz-runner-container">

        {/* Header */}
        <div className="bf-quiz-runner-header">
          <div className="bf-quiz-runner-header-text">
            <span className="bf-quiz-tag">QUIZ</span>
            <h2>{quiz.title}</h2>
          </div>
          <button className="bf-quiz-close-btn" onClick={onClose} aria-label="Close Quiz">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="bf-quiz-runner-body">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={`q-${currentIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bf-quiz-question-view"
              >
                {/* Progress bar */}
                <div className="bf-quiz-progress-container">
                  <div className="bf-quiz-progress-bar" style={{ width: `${progressPercent}%` }} />
                  <span className="bf-quiz-progress-text">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                <h3 className="bf-question-title">{questions[currentIndex].questionText}</h3>

                {/* Option Grid */}
                <div className={`bf-options-container ${questions[currentIndex].options[0].image ? "bf-options-grid" : "bf-options-list"}`}>
                  {questions[currentIndex].options.map((option, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const isCorrect = quiz.quizType === "trivia" && idx === questions[currentIndex].correctAnswerIndex;
                    const showFeedback = selectedOptionIndex !== null;

                    let cardClass = "bf-option-card";
                    if (isSelected) cardClass += " selected";
                    if (showFeedback) {
                      if (quiz.quizType === "trivia") {
                        if (isCorrect) cardClass += " correct";
                        else if (isSelected) cardClass += " incorrect";
                      } else if (isSelected) {
                        cardClass += " chosen-personality";
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className={cardClass}
                        onClick={() => handleOptionSelect(option, idx)}
                      >
                        {option.image && (
                          <div className="bf-option-img-wrap">
                            <img src={option.image} alt={option.text} className="bf-option-img" />
                          </div>
                        )}
                        <div className="bf-option-text-wrap">
                          <span className="bf-option-text">{option.text}</span>
                          {showFeedback && isCorrect && quiz.quizType === "trivia" && (
                            <span className="bf-option-feedback-icon correct"><Check size={16} /></span>
                          )}
                          {showFeedback && isSelected && !isCorrect && quiz.quizType === "trivia" && (
                            <span className="bf-option-feedback-icon incorrect"><X size={16} /></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* RESULTS PANEL */
              <motion.div
                key="results-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="bf-quiz-result-view"
              >
                <div className="bf-result-card">
                  <div className="bf-result-badge">YOUR RESULT</div>
                  <h2 className="bf-result-title">{result?.title}</h2>
                  {result?.image && (
                    <div className="bf-result-image-wrap">
                      <img src={result.image} alt={result.title} className="bf-result-img" />
                    </div>
                  )}
                  <p className="bf-result-desc">{result?.description}</p>

                  <div className="bf-result-actions">
                    <button className="bf-quiz-btn bf-quiz-btn-primary" onClick={handleShareResult}>
                      <Share2 size={16} />
                      {copied ? "Link Copied!" : "Share Result"}
                    </button>
                    <button className="bf-quiz-btn bf-quiz-btn-secondary" onClick={handleRetake}>
                      <RotateCcw size={16} />
                      Retake Quiz
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
