import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4 animate-fade-up">
        <Activity className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="heading animate-fade-up">
        Symptom Diary
      </h1>
      <p className="description max-w-2xl mx-auto mt-4 animate-fade-up">
        Log health events, track severity trends, and monitor your recovery journey with detailed analytics.
      </p>
    </motion.div>
  );
}
