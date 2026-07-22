import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, RefreshCcw, Check, Timer, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudyInterface({ deck, mode, onClose }) {
  const [cards, setCards] = useState([...deck.cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [session, setSession] = useState({ correct: 0, incorrect: 0, streak: 0 });
  const [quizInput, setQuizInput] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (mode === 'rapid') setTimeLeft(15);
    if (mode !== 'review') {
        setCards([...deck.cards].sort(() => Math.random() - 0.5));
    }
  }, [mode, deck.cards]);

  useEffect(() => {
    if (mode === 'rapid' && !isFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (mode === 'rapid' && timeLeft === 0) {
      handleNext();
    }
  }, [mode, timeLeft, isFinished]);

  const currentCard = cards[currentIndex];
  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = (correct = null) => {
    if (correct !== null) {
      setSession(prev => ({
        ...prev,
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        streak: correct ? prev.streak + 1 : 0
      }));
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setQuizInput("");
      setIsCorrect(null);
      if (mode === 'rapid') setTimeLeft(15);
    } else {
      setIsFinished(true);
    }
  };

  const checkQuiz = (e) => {
    e.preventDefault();
    const isRight = quizInput.toLowerCase().trim() === currentCard.back.toLowerCase().trim();
    setIsCorrect(isRight);
    setIsFlipped(true);
  };

  if (isFinished) {
    return <SessionComplete session={session} total={cards.length} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-(--card) rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-4 border-b border-(--border) flex justify-between items-center bg-(--background)">
          <div className="flex items-center gap-3">
             <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase tracking-widest">{mode} MODE</span>
             <span className="text-xs font-bold text-(--muted-foreground)">{currentIndex + 1} / {cards.length}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-(--card-hover-bg) rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Study Area */}
        <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-8">

          <div className="w-full bg-(--background) h-1 rounded-full overflow-hidden">
             <motion.div className="h-full bg-blue-600" animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
          </div>

          {mode === 'rapid' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold">
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {/* Flashcard Box */}
          <div
            onClick={handleFlip}
            className="w-full aspect-[16/10] bg-(--background) rounded-lg border-2 border-(--border) shadow-sm flex flex-col items-center justify-center p-10 text-center cursor-pointer hover:border-blue-500 transition-all group"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{isFlipped ? 'Answer' : 'Question'}</span>
              <h2 className={`font-bold leading-tight ${isFlipped ? 'text-2xl text-(--foreground)' : 'text-3xl text-(--foreground)'}`}>
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>
            </div>
            <div className="absolute bottom-6 flex items-center gap-2 text-gray-300 group-hover:text-blue-400 transition-colors">
              <RefreshCcw className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">Click to Flip</span>
            </div>
          </div>

          {mode === 'quiz' && !isCorrect && (
            <form onSubmit={checkQuiz} className="w-full flex gap-2">
               <input
                 autoFocus
                 type="text"
                 placeholder="Type answer..."
                 className="flex-1 px-4 py-3 bg-(--background) border border-(--border) rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-sm font-bold"
                 value={quizInput}
                 onChange={(e) => setQuizInput(e.target.value)}
               />
               <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm">Check</button>
            </form>
          )}

          <div className="flex items-center gap-6">
            {mode === 'review' ? (
              <>
                <button onClick={() => handleNext(false)} className="flex flex-col items-center gap-1 group">
                   <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                     <X className="w-6 h-6" />
                   </div>
                   <span className="text-[9px] font-bold text-gray-400 uppercase">Incorrect</span>
                </button>
                <button onClick={() => handleNext(true)} className="flex flex-col items-center gap-1 group">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all">
                     <Check className="w-6 h-6" />
                   </div>
                   <span className="text-[9px] font-bold text-gray-400 uppercase">Correct</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNext(isCorrect)}
                className="px-10 py-3 bg-(--primary) text-white rounded-lg font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                {currentIndex === cards.length - 1 ? 'Finish' : 'Next Card'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionComplete({ session, total, onClose }) {
  const accuracy = Math.round((session.correct / total) * 100) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-(--card) rounded-xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-(--foreground) mb-2">Session Complete!</h2>
        <p className="text-sm text-(--muted-foreground) font-medium mb-8">Review your session results below.</p>

        <div className="grid grid-cols-2 gap-3 mb-8">
           <ResultItem label="Accuracy" value={`${accuracy}%`} color="text-blue-600" />
           <ResultItem label="Correct" value={session.correct} color="text-green-600" />
           <ResultItem label="Studied" value={total} color="text-(--foreground)" />
           <ResultItem label="Streak" value={session.streak} color="text-orange-600" />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-(--primary) text-white rounded-lg font-bold shadow-md hover:opacity-90 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

function ResultItem({ label, value, color }) {
  return (
    <div className="p-4 bg-(--background) rounded-lg border border-(--border)">
      <span className="text-[10px] font-bold text-(--muted-foreground) uppercase tracking-wider">{label}</span>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
