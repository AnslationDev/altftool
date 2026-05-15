import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCcw } from "lucide-react";

export default function ResultCard({ score, total, results, onRetry }) {
  const percentage = Math.round((score / total) * 100);
  
  const getStatus = () => {
    if (percentage === 100) return { label: "Perfect Vision", color: "text-green-500", icon: CheckCircle2 };
    if (percentage >= 80) return { label: "Strong Vision", color: "text-blue-500", icon: CheckCircle2 };
    if (percentage >= 50) return { label: "Potential Deficiency", color: "text-yellow-500", icon: AlertTriangle };
    return { label: "Significant Deficiency", color: "text-red-500", icon: XCircle };
  };

  const status = getStatus();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl flex flex-col items-center justify-center text-center">
          <status.icon className={`w-16 h-16 ${status.color} mb-4`} />
          <h2 className={`text-4xl font-black mb-2 ${status.color}`}>{percentage}%</h2>
          <p className="text-xl font-bold text-(--foreground)">{status.label}</p>
          <p className="text-(--muted-foreground) mt-2">
            You correctly identified {score} out of {total} plates.
          </p>
          <button 
            onClick={onRetry}
            className="mt-6 btn-primary px-8 py-3 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Take Test Again
          </button>
        </div>

        <div className="bg-(--card) p-6 rounded-3xl border border-(--border) shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            Plate Review
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {results.map((res, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-(--background) rounded-xl border border-(--border)">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-(--muted) rounded-full text-xs font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Correct: {res.correct}</p>
                    <p className="text-xs text-(--muted-foreground)">Your answer: {res.userAnswer || "Skipped"}</p>
                  </div>
                </div>
                {res.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-blue-800 italic text-sm">
        <p><strong>Note:</strong> This digital test is for awareness only. Computer screens vary in color calibration, which can affect results. Please consult an eye specialist for a clinical diagnosis.</p>
      </div>
    </div>
  );
}
