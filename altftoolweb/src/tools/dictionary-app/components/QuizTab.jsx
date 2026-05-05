import { Brain, CheckCircle, XCircle, Trophy, RotateCcw, Zap } from "lucide-react";
import { useQuiz } from "../hooks/useQuiz.js";

export default function QuizTab({ results, word, savedWords }) {
  const {
    questions,
    currentIndex,
    score,
    selected,
    isFinished,
    loading,
    quizStarted,
    generateQuestions,
    handleAnswer,
    handleNext,
    resetQuiz,
  } = useQuiz();

  const hasContent = results || savedWords?.length > 0;
  const current = questions[currentIndex];

  // ── No content ──
  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-(--muted-foreground)">
        <Brain size={40} className="text-(--primary)" />
        <p className="text-sm font-medium text-(--foreground)">No words to quiz on!</p>
        <p className="text-xs text-center">Search a word or save some words to start the quiz.</p>
      </div>
    );
  }

  // ── Start screen ──
  if (!quizStarted && !loading) {
    const questionCount = Math.min(
      3 + Math.min(savedWords?.length || 0, 3), 6
    );

    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Brain size={32} className="text-(--primary)" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-(--foreground) mb-1">
            Test Your Vocabulary!
          </h3>
          <p className="text-sm text-(--muted-foreground)">
            {questionCount} questions — {word ? `"${word}"` : ""} {savedWords?.length > 0 ? `+ ${savedWords.length} saved words` : ""}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          {word && (
            <div className="text-center px-4 py-2 bg-(--muted) rounded-lg">
              <p className="text-xs text-(--muted-foreground)">Current word</p>
              <p className="text-sm font-semibold text-(--foreground)">{word}</p>
            </div>
          )}
          {savedWords?.length > 0 && (
            <div className="text-center px-4 py-2 bg-(--muted) rounded-lg">
              <p className="text-xs text-(--muted-foreground)">Saved words</p>
              <p className="text-sm font-semibold text-(--foreground)">{savedWords.length}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => generateQuestions(word, results, savedWords || [])}
          className="flex items-center gap-2 px-3 py-1 sm:px-6 sm:py-3 bg-(--primary) text-white rounded-xl font-semibold hover:opacity-80 transition cursor-pointer"
        >
          <Zap size={18} />
          Start Quiz
        </button>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Brain size={32} className="text-(--primary) animate-pulse" />
        <p className="text-sm text-(--muted-foreground)">Generating questions...</p>
      </div>
    );
  }

  // ── Finished screen ──
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 50 ? "👍" : "📚";

    return (
      <div className="flex flex-col items-center justify-center gap-5 py-10 px-4">
        <div className="text-5xl">{emoji}</div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-(--foreground) mb-1">
            Quiz Complete!
          </h3>
          <p className="text-sm text-(--muted-foreground)">
            You scored {score} out of {questions.length}
          </p>
        </div>

        {/* Score circle */}
        <div className="w-24 h-24 rounded-full border-4 border-(--primary) flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-(--primary)">{percentage}%</span>
        </div>

        {/* Message */}
        <p className="text-sm text-center text-(--muted-foreground) px-4">
          {percentage >= 80
            ? "Excellent! You know these words very well! 🎉"
            : percentage >= 50
            ? "Good job! Keep practicing to improve! 💪"
            : "Keep learning! Review the words and try again! 📖"}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-5 py-2.5 border border-(--border) text-(--foreground) rounded-lg font-medium hover:bg-(--muted) transition cursor-pointer text-sm"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:block">Try Again</span>
          </button>
          <button
            onClick={() => generateQuestions(word, results, savedWords || [])}
            className="flex items-center gap-2 px-5 py-2.5 bg-(--primary) text-white rounded-lg font-medium hover:opacity-80 transition cursor-pointer text-sm"
          >
            <Zap size={15} />
            <span className="hidden sm:block">New Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ──
  return (
    <div className="px-4 sm:px-6 py-4">

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-(--muted) rounded-full overflow-hidden">
          <div
            className="h-full bg-(--primary) rounded-full transition-all"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-(--muted-foreground) whitespace-nowrap">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Type badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mb-3 inline-block
        ${current.type === "meaning"
          ? "bg-blue-100 text-blue-700"
          : current.type === "synonym"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
        }`}>
        {current.type === "meaning" ? "📖 Meaning" : current.type === "synonym" ? "🔗 Synonym" : "↔️ Antonym"}
      </span>

      {/* Question */}
      <h3 className="text-base sm:text-lg font-semibold text-(--foreground) mb-6 leading-relaxed">
        {current.question}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-6">
        {current.options.map((option, i) => {
          const isCorrect = option === current.correct;
          const isSelected = option === selected;
          const showResult = selected !== null;

          let style = "border-(--border) text-(--foreground) hover:bg-(--muted)";
          if (showResult && isCorrect) style = "border-green-500 bg-green-50 text-green-800";
          else if (showResult && isSelected && !isCorrect) style = "border-red-400 bg-red-50 text-red-800";

          return (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition cursor-pointer flex items-center justify-between gap-2 ${style}`}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </span>
              {showResult && isCorrect && <CheckCircle size={18} className="text-green-600 shrink-0" />}
              {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {selected && (
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${selected === current.correct ? "text-green-600" : "text-red-500"}`}>
            {selected === current.correct ? "✓ Correct!" : `✗ Correct: ${current.correct.slice(0, 50)}${current.correct.length > 50 ? "..." : ""}`}
          </p>
          <button
            onClick={handleNext}
            className="px-5 py-2 bg-(--primary) text-white rounded-lg text-sm font-medium hover:opacity-80 transition cursor-pointer"
          >
            {currentIndex + 1 >= questions.length ? "Finish" : "Next"}
          </button>
        </div>
      )}

    </div>
  );
}