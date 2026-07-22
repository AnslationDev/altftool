import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Lightbulb, Zap, ArrowRight, Sparkles } from "lucide-react";

const InsightsCard = ({ analysis }) => {
  if (!analysis) return null;

  const { insights, recommendations, motivation } = analysis;

  const getIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-emerald-500" size={18} />;
      case "highlight": return <Zap className="text-amber-500" size={18} />;
      case "warning": return <AlertCircle className="text-red-500" size={18} />;
      default: return <Lightbulb className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Actionable Recommendations - MOVED TO TOP */}
      <div className="space-y-4">
         <h3 className="text-lg font-black text-(--foreground) flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" /> Key Recommendations
         </h3>
         <div className="bg-indigo-600 rounded-3xl p-6 text-white space-y-6 shadow-lg shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
               {recommendations.map((rec, idx) => (
                 <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-3 group"
                 >
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                       <ArrowRight size={12} />
                    </div>
                    <p className="text-xs font-bold leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                      {rec}
                    </p>
                 </motion.div>
               ))}
            </div>

            <div className="pt-4 border-t border-white/10 relative z-10">
               <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60 mb-1">Daily Motivation</p>
               <h4 className="text-xl font-black italic tracking-tight">"{motivation}"</h4>
            </div>
         </div>
      </div>

      {/* Performance Insights - MOVED BELOW */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-(--foreground)">Performance Breakdown</h3>
        <div className="grid grid-cols-1 gap-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 bg-(--card) border border-(--border) rounded-2xl flex items-start gap-4 hover:shadow-md transition-all group"
            >
              <div className="p-2.5 bg-(--background) rounded-xl border border-(--border) group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-xs text-(--foreground) uppercase tracking-wider">{insight.title}</h4>
                <p className="text-xs text-(--secondary-foreground) mt-1 font-medium leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
