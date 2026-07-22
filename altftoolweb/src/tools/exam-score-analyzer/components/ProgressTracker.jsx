import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ProgressTracker = ({ exams }) => {
  if (!exams || exams.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-(--foreground)">Exam Progress Tracker</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((exam, idx) => {
          const prevExam = idx > 0 ? exams[idx - 1] : null;
          const diff = prevExam ? (parseFloat(exam.percentage) - parseFloat(prevExam.percentage)).toFixed(1) : 0;

          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-(--card) border border-(--border) rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-(--muted-foreground) uppercase">{exam.type}</span>
                {prevExam && (
                  <div className={`flex items-center gap-1 text-[10px] font-black ${diff > 0 ? "text-emerald-500" : diff < 0 ? "text-red-500" : "text-gray-400"
                    }`}>
                    {diff > 0 ? <TrendingUp size={12} /> : diff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {Math.abs(diff)}%
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black text-(--foreground)">{exam.percentage}%</h4>
                <span className="text-[10px] text-(--secondary-foreground)">Grade: {exam.grade}</span>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${exam.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full ${parseFloat(exam.percentage) >= 75 ? "bg-indigo-500" : "bg-blue-400"}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
