"use client";

import ProgressBar from "./ProgressBar";

export default function QuestionCard({ question, onAnswer, questionNumber, totalQuestions }) {
  return (
    <div className="max-w-2xl mx-auto pt-16">
      <h1 className="subheading text-center pb-5">Give Your Answers</h1>

      <ProgressBar current={questionNumber} total={totalQuestions} />

      <div className="bg-(--background) rounded-2xl p-8 shadow-lg border-2 border-(--border) pt-5 mt-15">
        <h2 className="text-2xl font-bold text-(--foreground) mb-6 leading-relaxed">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(option.value)}
              className="w-full p-4 text-left rounded-xl border-2 border-(--border) transition-all duration-200 cursor-pointer hover:bg-(--primary)/20"
            >
              <div className="flex items-center gap-4">
                <span className="shrink-0 w-8 h-8 bg-(--card) rounded-lg flex items-center justify-center font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-(--foreground) font-medium">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}