"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import IshiharaCanvas from "../components/IshiharaCanvas";
import PlateControls from "../components/PlateControls";
import ProgressBar from "../components/ProgressBar";
import Timer from "../components/Timer";
import AccessibilityModes from "../components/AccessibilityModes";
import EducationalSection from "../components/EducationalSection";
import ResultCard from "../components/ResultCard";
import Features from "../components/Features";
import { PLATE_DATA } from "../utils/plateData";

export default function ToolHome() {
  const [gameState, setGameState] = useState("welcome"); // welcome, testing, results
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [visionMode, setVisionMode] = useState("normal");
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);

  const startTest = () => {
    setResults([]);
    setScore(0);
    setCurrentPlateIndex(0);
    setGameState("testing");
  };

  const handleAnswer = (userAnswer) => {
    const currentPlate = PLATE_DATA[currentPlateIndex];
    const isCorrect = userAnswer.toLowerCase() === currentPlate.target.toLowerCase();
    
    const newResults = [
      ...results,
      { plateId: currentPlate.id, userAnswer, correct: currentPlate.target, isCorrect }
    ];
    
    setResults(newResults);
    if (isCorrect) setScore(score + 1);
    
    if (currentPlateIndex < PLATE_DATA.length - 1) {
      setCurrentPlateIndex(currentPlateIndex + 1);
    } else {
      setGameState("results");
    }
  };

  const handleSkip = () => {
    handleAnswer("");
  };

  const handleTimeout = () => {
    handleAnswer("timeout");
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-(--background) selection:bg-blue-100">
      <div className="max-w-6xl mx-auto">
        <Header />

        <div className="section-container mt-12">
          <AnimatePresence mode="wait">
            {gameState === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-(--card) p-8 md:p-12 rounded-[2rem] border border-(--border) shadow-2xl text-center flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="subheading text-3xl mb-4">Start Your Color Vision Screening</h2>
                <p className="description max-w-lg mb-8 mx-auto">
                  Test your ability to see patterns hidden within colored dots. 
                  This test consists of {PLATE_DATA.length} plates. Try to identify the numbers as quickly as possible.
                </p>
                <button 
                  onClick={startTest}
                  className="btn-primary px-10 py-4 text-xl shadow-xl hover:shadow-2xl transition-all"
                >
                  Begin Screening Test
                </button>
                <AccessibilityModes currentMode={visionMode} onModeChange={setVisionMode} />
              </motion.div>
            )}

            {gameState === "testing" && (
              <motion.div
                key="testing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-(--card) p-8 md:p-12 rounded-[2rem] border border-(--border) shadow-2xl"
              >
                <div className="space-y-8 flex flex-col justify-center">
                  <ProgressBar current={currentPlateIndex + 1} total={PLATE_DATA.length} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-(--secondary-foreground)">Plate {currentPlateIndex + 1}</span>
                    <Timer keyIndex={currentPlateIndex} duration={15} onTimeout={handleTimeout} />
                  </div>
                  <PlateControls onAnswer={handleAnswer} onSkip={handleSkip} />
                  <div className="pt-4 border-t border-(--border)">
                    <h4 className="text-xs font-bold text-(--muted-foreground) mb-3 uppercase tracking-tighter">Simulation Mode</h4>
                    <AccessibilityModes currentMode={visionMode} onModeChange={setVisionMode} />
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <IshiharaCanvas 
                    plate={PLATE_DATA[currentPlateIndex]} 
                    visionMode={visionMode} 
                  />
                </div>
              </motion.div>
            )}

            {gameState === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ResultCard 
                  score={score} 
                  total={PLATE_DATA.length} 
                  results={results} 
                  onRetry={startTest}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <EducationalSection />
        <Features />
      </div>
    </div>
  );
}
