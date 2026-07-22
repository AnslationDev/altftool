import React from "react";
import { motion } from "framer-motion";
import { Award, Target, TrendingUp, BookOpen } from "lucide-react";
import CountUp from "react-countup";

const StatCard = ({ title, value, subValue, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="bg-(--card) border border-(--border) rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex items-center gap-4"
  >
    <div className={`w-10 h-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-600 shrink-0`}>
      <Icon size={18} />
    </div>

    <div className="space-y-0.5 relative z-10 flex-1 min-w-0">
      <p className="text-[9px] font-black text-(--muted-foreground) uppercase tracking-widest">{title}</p>
      <h3 className="text-lg font-black text-(--foreground) leading-none truncate">
        {typeof value === "number" ? (
          <CountUp end={value} decimals={title === "Percentage" ? 1 : 0} duration={2} suffix={title === "Percentage" ? "%" : ""} />
        ) : (
          value
        )}
      </h3>
      {subValue && (
        <p className="text-[9px] font-bold text-(--muted-foreground) uppercase tracking-tighter truncate">{subValue}</p>
      )}
    </div>
  </motion.div>
);

const StatsDashboard = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Marks",
      value: parseFloat(stats.totalObtained),
      subValue: `${stats.totalMax} Max`,
      icon: BookOpen,
      color: "indigo",
      delay: 0.1,
    },
    {
      title: "Percentage",
      value: parseFloat(stats.percentage),
      subValue: `Grade ${stats.grade}`,
      icon: Target,
      color: "blue",
      delay: 0.2,
    },
    {
      title: "Performance",
      value: stats.rank,
      subValue: stats.passStatus,
      icon: Award,
      color: "purple",
      delay: 0.3,
    },
    {
      title: "Strongest",
      value: stats.highestSubject,
      subValue: "Top Tier",
      icon: TrendingUp,
      color: "emerald",
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
};

export default StatsDashboard;
